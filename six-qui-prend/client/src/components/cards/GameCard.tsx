import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';
import { staggerItem } from '../../animations/variants';

export interface GameCardData {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  players: string;
  duration: string;
  available: boolean;
  color: string;
  tags: string[];
  desc?: string;
}

interface GameCardProps {
  game: GameCardData;
  selected?: boolean;
  onClick?: () => void;
  showQuickJoin?: boolean;
  onQuickJoin?: () => void;
}

export default function GameCard({
  game,
  selected = false,
  onClick,
  showQuickJoin = false,
  onQuickJoin,
}: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const canInteract = game.available && !!onClick;

  return (
    <motion.div
      variants={staggerItem}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={canInteract ? onClick : undefined}
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none"
      style={{
        background: selected
          ? `linear-gradient(135deg, ${game.color}20, ${game.color}08)`
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${selected ? game.color : hovered && game.available ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: selected
          ? arcade.shadow.glow(game.color)
          : hovered && game.available
            ? arcade.shadow.cardHover
            : arcade.shadow.card,
        opacity: game.available ? 1 : 0.4,
        cursor: canInteract ? 'pointer' : 'default',
        transform: selected ? 'translateY(-4px)' : hovered && game.available ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
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
          opacity: selected ? 1 : hovered && game.available ? 0.7 : 0.4,
          boxShadow: selected ? `0 0 24px ${game.color}60` : 'none',
          transition: 'opacity 0.25s, box-shadow 0.25s',
          borderRadius: '16px 16px 0 0',
        }}
      />

      {/* Content */}
      <div className="p-5 relative">
        {/* Unavailable badge */}
        {!game.available && (
          <div
            className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.5)' }}
          >
            Bientôt
          </div>
        )}

        {/* Icon */}
        <motion.div
          animate={{ scale: hovered && game.available ? 1.08 : 1 }}
          transition={{ duration: 0.2 }}
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3"
          style={{
            background: `${game.color}25`,
            border: `1px solid ${game.color}40`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          {game.icon}
        </motion.div>

        {/* Title */}
        <div
          className="font-bold text-base mb-1"
          style={{
            color: selected ? game.color : '#f8f6ff',
            fontFamily: arcade.font.body,
            transition: 'color 0.2s',
          }}
        >
          {game.name}
        </div>

        {/* Tagline */}
        <div
          className="text-sm mb-3"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: arcade.font.body }}
        >
          {game.tagline}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
            👥 {game.players}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ⏱ {game.duration}
          </span>
        </div>

        {/* Tags */}
        {game.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {game.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{
                  background: selected ? `${game.color}30` : 'rgba(255,255,255,0.06)',
                  color: selected ? game.color : 'rgba(255,255,255,0.5)',
                  border: selected ? `1px solid ${game.color}50` : '1px solid transparent',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Quick join button */}
        {showQuickJoin && game.available && onQuickJoin && (
          <motion.button
            variants={staggerItem}
            onClick={(e) => { e.stopPropagation(); onQuickJoin(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full py-2 rounded-xl font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)`,
              color: '#fff',
              fontFamily: arcade.font.body,
              boxShadow: arcade.shadow.button,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Rejoindre
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
