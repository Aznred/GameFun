import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';
import type { GameCardData } from './GameCard';

interface GameCard3DProps {
  game: GameCardData;
  selected?: boolean;
  onClick?: () => void;
  showQuickJoin?: boolean;
  onQuickJoin?: () => void;
}

const PERSPECTIVE = 800;
const TILT_MAX = 8;

export default function GameCard3D({
  game,
  selected = false,
  onClick,
  showQuickJoin = false,
  onQuickJoin,
}: GameCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const canInteract = game.available && !!onClick;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || !canInteract) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    setTilt({
      y: Math.max(-TILT_MAX, Math.min(TILT_MAX, dx * TILT_MAX)),
      x: Math.max(-TILT_MAX, Math.min(TILT_MAX, -dy * TILT_MAX)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const handleMouseEnter = () => {
    if (game.available) setHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={canInteract ? onClick : undefined}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: arcade.ease }}
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none"
      style={{
        perspective: PERSPECTIVE,
        cursor: canInteract ? 'pointer' : 'default',
      }}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: selected ? 1.02 : hovered && game.available ? 1.02 : 1,
          translateZ: 0,
        }}
        whileTap={
          canInteract
            ? {
                scale: 0.98,
                transition: { duration: 0.08 },
              }
            : undefined
        }
        transition={{
          type: 'spring',
          stiffness: 320,
          damping: 24,
          mass: 0.6,
        }}
        style={{
          transformStyle: 'preserve-3d',
          background: selected
            ? `linear-gradient(135deg, ${game.color}22, ${game.color}0a)`
            : 'rgba(255,255,255,0.04)',
          border: `2px solid ${
            selected ? game.color : hovered && game.available ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'
          }`,
          boxShadow: selected
            ? `${arcade.shadow.glow(game.color)}, 0 12px 32px rgba(0,0,0,0.35)`
            : hovered && game.available
              ? `0 0 28px ${game.color}30, 0 8px 0 rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.4)`
              : '0 4px 0 rgba(0,0,0,0.2), 0 10px 28px rgba(0,0,0,0.35)',
          opacity: game.available ? 1 : 0.4,
        }}
      >
        {/* Top accent bar with glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
            opacity: selected ? 1 : hovered && game.available ? 0.85 : 0.4,
            boxShadow: selected ? `0 0 24px ${game.color}60` : hovered && game.available ? `0 0 16px ${game.color}50` : 'none',
            transition: 'opacity 0.2s, box-shadow 0.2s',
            borderRadius: '16px 16px 0 0',
          }}
        />

        <div className="p-5 relative" style={{ transform: 'translateZ(12px)' }}>
          {!game.available && (
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.5)' }}
            >
              Bientôt
            </div>
          )}

          <motion.div
            animate={{ scale: hovered && game.available ? 1.08 : 1 }}
            transition={{ duration: 0.2 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3"
            style={{
              background: `${game.color}28`,
              border: `1px solid ${game.color}50`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.2)`,
            }}
          >
            {game.icon}
          </motion.div>

          <div
            className="font-bold text-base mb-1"
            style={{
              color: selected ? game.color : '#f8f6ff',
              fontFamily: arcade.font.display,
              transition: 'color 0.2s',
            }}
          >
            {game.name}
          </div>

          <div
            className="text-sm mb-3"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: arcade.font.body }}
          >
            {game.tagline}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
              👥 {game.players}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ⏱ {game.duration}
            </span>
          </div>

          {game.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {game.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    background: selected ? `${game.color}35` : 'rgba(255,255,255,0.06)',
                    color: selected ? game.color : 'rgba(255,255,255,0.5)',
                    border: selected ? `1px solid ${game.color}50` : '1px solid transparent',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {showQuickJoin && game.available && onQuickJoin && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onQuickJoin(); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 w-full py-2 rounded-xl font-bold text-sm border-0 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)`,
                color: '#fff',
                fontFamily: arcade.font.body,
                boxShadow: arcade.shadow.button,
              }}
            >
              Jouer
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
