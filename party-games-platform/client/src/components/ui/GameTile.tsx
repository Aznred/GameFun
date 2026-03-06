import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';
import type { GameMeta } from '../../data/games';

interface GameTileProps {
  game: GameMeta;
  selected?: boolean;
  onClick?: () => void;
  onPlay?: () => void;
}

export default function GameTile({ game, selected = false, onClick, onPlay }: GameTileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || !game.available) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    setTilt({ x: Math.max(-8, Math.min(8, -dy * 10)), y: Math.max(-8, Math.min(8, dx * 10)) });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const canInteract = game.available && (onClick || onPlay);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: arcade.duration.normal, ease: arcade.ease }}
      className="relative rounded-3xl overflow-hidden cursor-pointer select-none"
      style={{
        perspective: 800,
        opacity: game.available ? 1 : 0.5,
        cursor: canInteract ? 'pointer' : 'default',
      }}
    >
      <motion.div
        className="relative w-full h-full rounded-3xl p-6 flex flex-col"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: selected ? 1.02 : 1,
        }}
        whileTap={canInteract ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          transformStyle: 'preserve-3d',
          background: `linear-gradient(165deg, ${game.color}30 0%, ${game.color}10 50%, rgba(0,0,0,0.2) 100%)`,
          border: `3px solid ${selected ? game.color : 'rgba(255,255,255,0.15)'}`,
          boxShadow: selected
            ? `${arcade.shadow.glow(game.color)}, ${arcade.shadow.cardHover}`
            : `0 8px 0 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Top glow bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${game.color}, transparent)`,
            opacity: selected ? 1 : 0.6,
            boxShadow: `0 0 20px ${game.color}60`,
          }}
        />

        {!game.available && (
          <div
            className="absolute top-4 right-4 px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider"
            style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(254,243,199,0.6)' }}
          >
            Soon
          </div>
        )}

        {/* Big icon */}
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-4"
          style={{
            background: `linear-gradient(180deg, ${game.color}50, ${game.color}25)`,
            border: `2px solid ${game.color}60`,
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.2)',
          }}
          whileHover={game.available ? { scale: 1.08 } : undefined}
        >
          {game.icon}
        </motion.div>

        <div className="font-black text-xl mb-1" style={{ fontFamily: arcade.font.display, color: selected ? game.color : '#fef3c7' }}>
          {game.name}
        </div>
        <div className="text-sm mb-3" style={{ color: arcade.colors.textMuted }}>
          {game.tagline}
        </div>
        <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'rgba(254,243,199,0.5)' }}>
          <span>👥 {game.players}</span>
          <span>•</span>
          <span>⏱ {game.duration}</span>
        </div>

        {onPlay && game.available && (
          <motion.button
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm border-0 cursor-pointer"
            style={{
              background: `linear-gradient(180deg, ${game.color}, ${game.color}dd)`,
              color: '#fff',
              boxShadow: arcade.shadow.button,
              fontFamily: arcade.font.display,
            }}
          >
            Play
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
