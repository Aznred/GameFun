import React from 'react';
import { motion } from 'framer-motion';
import { UnoCard as UnoCardType, UnoColor, UNO_COLOR_HEX, getCardLabel } from '@shared/unoCards';

// ─── Color palette for cards ─────────────────────────────────────────────────

const COLOR_STYLES: Record<UnoColor, { bg: string; border: string; text: string; oval: string }> = {
  red:    { bg: '#b91c1c', border: '#fca5a5', text: '#fff', oval: '#dc2626' },
  blue:   { bg: '#1d4ed8', border: '#93c5fd', text: '#fff', oval: '#2563eb' },
  green:  { bg: '#15803d', border: '#86efac', text: '#fff', oval: '#16a34a' },
  yellow: { bg: '#a16207', border: '#fde68a', text: '#fff', oval: '#ca8a04' },
  wild:   { bg: '#1e1b4b', border: '#c4b5fd', text: '#fff', oval: '#4c1d95' },
};

// ─── Wild card center (4-quadrant design) ─────────────────────────────────────

function WildCenter({ size }: { size: number }) {
  const r = size * 0.36;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <clipPath id="oval-clip">
        <ellipse cx={size / 2} cy={size / 2} rx={r} ry={r * 1.35} />
      </clipPath>
      <g clipPath="url(#oval-clip)">
        <rect x={0} y={0} width={size / 2} height={size / 2} fill="#dc2626" />
        <rect x={size / 2} y={0} width={size / 2} height={size / 2} fill="#2563eb" />
        <rect x={0} y={size / 2} width={size / 2} height={size / 2} fill="#ca8a04" />
        <rect x={size / 2} y={size / 2} width={size / 2} height={size / 2} fill="#15803d" />
      </g>
      <ellipse
        cx={size / 2} cy={size / 2}
        rx={r} ry={r * 1.35}
        fill="none" stroke="white" strokeWidth={size * 0.04}
      />
    </svg>
  );
}

// ─── Card face ────────────────────────────────────────────────────────────────

interface UnoCardProps {
  card: UnoCardType;
  size?: 'sm' | 'md' | 'lg';
  playable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  animate?: boolean;
}

const SIZES = {
  sm: { w: 52, h: 76, cornerText: 11, centerText: 26, ovalW: 28, ovalH: 40 },
  md: { w: 72, h: 104, cornerText: 14, centerText: 36, ovalW: 40, ovalH: 56 },
  lg: { w: 88, h: 128, cornerText: 16, centerText: 44, ovalW: 50, ovalH: 70 },
};

export default function UnoCard({ card, size = 'md', playable, selected, onClick, faceDown, animate = true }: UnoCardProps) {
  const dim = SIZES[size];
  const style = COLOR_STYLES[faceDown ? 'wild' : card.color];
  const label = faceDown ? '?' : getCardLabel(card.value);
  const isWild = card.value === 'wild' || card.value === 'wild_draw_four';

  const cardEl = (
    <div
      onClick={onClick}
      className="relative select-none flex-shrink-0"
      style={{
        width: dim.w,
        height: dim.h,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Card body */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{
          background: faceDown
            ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
            : style.bg,
          border: `3px solid ${selected ? '#fff' : style.border}`,
          boxShadow: selected
            ? `0 0 0 3px white, 0 0 20px rgba(255,255,255,0.5), 0 8px 24px rgba(0,0,0,0.5)`
            : playable
              ? `0 0 0 2px ${style.border}, 0 6px 16px rgba(0,0,0,0.4)`
              : '0 4px 12px rgba(0,0,0,0.4)',
          transition: 'box-shadow 0.15s, border-color 0.15s',
        }}
      >
        {faceDown ? (
          // Back of card
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg" style={{
              width: dim.w * 0.65, height: dim.h * 0.75,
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Fredoka One, cursive', fontSize: dim.centerText * 0.7, fontWeight: 900 }}>UNO</span>
            </div>
          </div>
        ) : (
          <>
            {/* Diagonal ellipse background */}
            <div className="absolute inset-0" style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '50%',
              transform: 'rotate(-25deg) scale(1.2) translate(0, 10%)',
            }} />

            {/* Top-left corner */}
            <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none"
              style={{ color: style.text, fontFamily: 'Fredoka One, cursive', fontSize: dim.cornerText, fontWeight: 900, lineHeight: 1 }}>
              {label}
            </div>

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isWild ? (
                <WildCenter size={dim.ovalW * 1.4} />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: dim.ovalW,
                    height: dim.ovalH,
                    background: style.oval,
                    border: `3px solid rgba(255,255,255,0.5)`,
                    transform: 'rotate(-20deg)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <span style={{
                    color: 'white',
                    fontFamily: 'Fredoka One, cursive',
                    fontSize: dim.centerText,
                    fontWeight: 900,
                    transform: 'rotate(20deg)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    lineHeight: 1,
                  }}>
                    {label}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom-right corner (rotated 180°) */}
            <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none"
              style={{
                color: style.text,
                fontFamily: 'Fredoka One, cursive',
                fontSize: dim.cornerText,
                fontWeight: 900,
                lineHeight: 1,
                transform: 'rotate(180deg)',
              }}>
              {label}
            </div>

            {/* Playable glow */}
            {playable && !selected && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.6)` }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );

  if (!animate) return cardEl;

  return (
    <motion.div
      whileHover={onClick ? { y: -10, scale: 1.06 } : {}}
      whileTap={onClick ? { scale: 0.94 } : {}}
      animate={selected ? { y: -14 } : { y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{ display: 'inline-block' }}
    >
      {cardEl}
    </motion.div>
  );
}

// ─── Card Back (small display for other players) ──────────────────────────────

export function UnoCardBack({ count, size = 'sm' }: { count: number; size?: 'sm' | 'md' }) {
  const dim = SIZES[size];
  const maxVisible = Math.min(count, 7);

  return (
    <div className="relative flex items-center" style={{ height: dim.h, minWidth: dim.w }}>
      {Array.from({ length: maxVisible }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-xl"
          style={{
            width: dim.w,
            height: dim.h,
            left: i * (size === 'sm' ? 10 : 14),
            zIndex: i,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <div className="rounded-md flex items-center justify-center"
              style={{ width: dim.w * 0.6, height: dim.h * 0.7, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Fredoka One, cursive', fontSize: dim.cornerText, fontWeight: 900 }}>U</span>
            </div>
          </div>
        </div>
      ))}
      {count > maxVisible && (
        <div className="absolute z-10 flex items-center justify-center rounded-full text-white font-black text-xs"
          style={{ right: -8, top: -8, width: 22, height: 22, background: '#7c3aed', border: '2px solid white', fontFamily: 'Fredoka One, cursive' }}>
          +{count - maxVisible + 1}
        </div>
      )}
    </div>
  );
}
