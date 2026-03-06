import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WlSpectrum } from '@shared/wavelengthSpectrums';
import { WL_SCORE_ZONES } from '@shared/wavelengthLogic';

// ─── Geometry ─────────────────────────────────────────────────────────────────

const CX = 250, CY = 250, OR = 210, IR = 90;

function posToAngle(pos: number): number {
  return (1 - pos / 100) * Math.PI;
}
function polar(r: number, angle: number) {
  return { x: CX + r * Math.cos(angle), y: CY - r * Math.sin(angle) };
}
function arcSector(p1: number, p2: number, outerR = OR, innerR = IR): string {
  const a1 = posToAngle(p1), a2 = posToAngle(p2);
  const o1 = polar(outerR, a1), o2 = polar(outerR, a2);
  const i1 = polar(innerR, a1), i2 = polar(innerR, a2);
  const large = p2 - p1 > 50 ? 1 : 0;
  return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y} Z`;
}

// ─── Score zone palette ───────────────────────────────────────────────────────

const ZONE_COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#94a3b8'];

// ─── Needle ───────────────────────────────────────────────────────────────────

function Needle({ position, color, opacity = 1, label }: {
  position: number; color: string; opacity?: number; label?: string;
}) {
  const angle = posToAngle(position);
  const tip = polar(OR - 8, angle);
  const b1 = polar(IR + 12, angle + 0.06);
  const b2 = polar(IR + 12, angle - 0.06);
  const labelPt = polar(OR + 20, angle);
  return (
    <g opacity={opacity}>
      <polygon points={`${tip.x},${tip.y} ${b1.x},${b1.y} ${b2.x},${b2.y}`}
        fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
      {label && (
        <text x={labelPt.x} y={labelPt.y + 4} textAnchor="middle"
          fill={color} fontSize={11} fontFamily="Fredoka One, cursive" fontWeight="900">
          {label}
        </text>
      )}
    </g>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OtherGuess {
  playerId: string;
  name: string;
  position: number;
  color: string;
}

interface WlDialProps {
  spectrum: WlSpectrum | null;
  myPosition: number;               // local dial position (0-100)
  targetPosition?: number | null;   // visible to psychic
  revealTarget?: number | null;     // shown after reveal
  otherGuesses?: OtherGuess[];      // shown after reveal
  interactive?: boolean;
  onDial?: (position: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WlDial({
  spectrum, myPosition, targetPosition, revealTarget, otherGuesses = [],
  interactive, onDial,
}: WlDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const posFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 300 / rect.height;
    const dx = (clientX - rect.left) * scaleX - CX;
    const dy = -((clientY - rect.top) * scaleY - CY);
    const angle = Math.atan2(dy, dx);
    if (angle < 0 || angle > Math.PI) return null;
    return Math.round((1 - angle / Math.PI) * 100);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!interactive || !onDial) return;
    const p = posFromEvent(e.clientX, e.clientY);
    if (p !== null) onDial(p);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !onDial || e.buttons !== 1) return;
    const p = posFromEvent(e.clientX, e.clientY);
    if (p !== null) onDial(p);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    if (!interactive || !onDial || !e.touches[0]) return;
    const p = posFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    if (p !== null) onDial(p);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!interactive || !onDial || !e.touches[0]) return;
    const p = posFromEvent(e.touches[0].clientX, e.touches[0].clientY);
    if (p !== null) onDial(p);
  };

  const showReveal = revealTarget != null;

  return (
    <div className="flex flex-col items-center select-none w-full">
      <svg
        ref={svgRef}
        viewBox="0 0 500 300"
        width="100%"
        style={{ maxWidth: 560, cursor: interactive ? 'crosshair' : 'default', touchAction: 'none', userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {/* Background ring */}
        <path d={arcSector(0, 100)} fill="rgba(255,255,255,0.05)" />
        <path d={arcSector(0, 100)} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />

        {/* Score zones on reveal */}
        <AnimatePresence>
          {showReveal && [WL_SCORE_ZONES[3], WL_SCORE_ZONES[2], WL_SCORE_ZONES[1], WL_SCORE_ZONES[0]].map((hw, i) => {
            const zi = 3 - i;
            const p1 = Math.max(0, revealTarget! - hw);
            const p2 = Math.min(100, revealTarget! + hw);
            if (p1 >= p2) return null;
            return (
              <motion.path key={zi} d={arcSector(p1, p2)} fill={ZONE_COLORS[zi]}
                initial={{ opacity: 0 }} animate={{ opacity: 0.72 }} transition={{ delay: i * 0.1, duration: 0.4 }} />
            );
          })}
        </AnimatePresence>

        {/* Psychic target glow */}
        {targetPosition != null && !showReveal && (
          <>
            <motion.path d={arcSector(Math.max(0, targetPosition - 14), Math.min(100, targetPosition + 14))}
              fill="rgba(251,191,36,0.15)" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.path d={arcSector(Math.max(0, targetPosition - 4), Math.min(100, targetPosition + 4))}
              fill="rgba(251,191,36,0.55)" animate={{ opacity: [0.4, 0.75, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} />
          </>
        )}

        {/* Target center line on reveal */}
        {showReveal && (() => {
          const a = posToAngle(revealTarget!);
          const o = polar(OR + 6, a), inn = polar(IR - 6, a);
          return <motion.line x1={inn.x} y1={inn.y} x2={o.x} y2={o.y}
            stroke="white" strokeWidth={2.5} strokeDasharray="5 4"
            initial={{ opacity: 0 }} animate={{ opacity: 0.95 }} transition={{ delay: 0.5 }} />;
        })()}

        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => i * 10).map((p) => {
          const a = posToAngle(p);
          const o1 = polar(OR, a), o2 = polar(OR + 9, a);
          return <line key={p} x1={o1.x} y1={o1.y} x2={o2.x} y2={o2.y}
            stroke="rgba(255,255,255,0.25)" strokeWidth={p % 50 === 0 ? 2.5 : 1} />;
        })}

        {/* Base line */}
        <line x1={CX - OR - 20} y1={CY} x2={CX + OR + 20} y2={CY} stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} />

        {/* Spectrum labels */}
        {spectrum && (
          <>
            <text x={CX - OR - 12} y={CY + 22} textAnchor="end"
              fill="white" fontSize={15} fontFamily="Fredoka One, cursive" fontWeight="900">{spectrum.left}</text>
            <text x={CX + OR + 12} y={CY + 22} textAnchor="start"
              fill="white" fontSize={15} fontFamily="Fredoka One, cursive" fontWeight="900">{spectrum.right}</text>
          </>
        )}

        {/* Other players' needles (after reveal) */}
        {showReveal && otherGuesses.map((g) => (
          <Needle key={g.playerId} position={g.position} color={g.color} opacity={0.85} label={g.name.slice(0, 6)} />
        ))}

        {/* My needle */}
        {!showReveal && (
          <motion.g animate={{ opacity: 1 }} transition={{ duration: 0.05 }}>
            <Needle position={myPosition} color={interactive ? '#f97316' : 'rgba(255,255,255,0.8)'} label="Moi" />
          </motion.g>
        )}
        {showReveal && (
          <Needle position={myPosition} color="#f97316" opacity={1} label="Moi" />
        )}

        {/* Center pivot */}
        <circle cx={CX} cy={CY} r={12} fill="#1e293b" stroke="rgba(255,255,255,0.3)" strokeWidth={2.5} />
        <circle cx={CX} cy={CY} r={5} fill={interactive ? '#f97316' : 'white'} />
      </svg>

      {/* Score zone legend */}
      {showReveal && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex gap-4 mt-1 flex-wrap justify-center">
          {(['4 pts', '3 pts', '2 pts', '1 pt'] as const).map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs font-bold"
              style={{ color: ZONE_COLORS[i], fontFamily: 'Nunito, sans-serif' }}>
              <div className="w-3 h-3 rounded-sm" style={{ background: ZONE_COLORS[i] }} />
              {label}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
