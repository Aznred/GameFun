import React from 'react';
import { motion } from 'framer-motion';
import { LLCard as LLCardType, getLLCardDef } from '@shared/loveLetterCards';

interface LLCardProps {
  card: LLCardType;
  selected?: boolean;
  selectable?: boolean;
  dimmed?: boolean;
  small?: boolean;
  onClick?: () => void;
  showDesc?: boolean;
}

export default function LLCard({ card, selected, selectable, dimmed, small, onClick, showDesc }: LLCardProps) {
  const def = getLLCardDef(card.id);

  if (small) {
    return (
      <div
        className="rounded-xl overflow-hidden select-none flex flex-col"
        style={{
          width: 48,
          height: 66,
          background: def.bg,
          border: `2px solid ${def.color}88`,
          boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
          opacity: dimmed ? 0.35 : 1,
        }}
      >
        <div className="flex items-center justify-between px-1.5 pt-1">
          <span style={{ fontSize: 10, fontWeight: 900, color: def.color, fontFamily: 'Fredoka One, cursive' }}>
            {card.value}
          </span>
          <span style={{ fontSize: 14 }}>{card.emoji}</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', fontFamily: 'Fredoka One, cursive', textAlign: 'center', padding: '0 3px', lineHeight: 1.2 }}>
            {card.nameFr}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={selectable ? { y: -14, scale: 1.08 } : {}}
      whileTap={selectable ? { scale: 0.93 } : {}}
      animate={selected ? { y: -20, scale: 1.12 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden flex flex-col select-none"
      style={{
        width: 90,
        height: 130,
        background: def.bg,
        border: `3px solid ${selected ? def.color : def.color + '66'}`,
        boxShadow: selected
          ? `0 0 0 2px ${def.color}, 0 8px 0 rgba(0,0,0,0.3), 0 16px 28px ${def.color}44`
          : `0 4px 0 rgba(0,0,0,0.3), 0 6px 20px rgba(0,0,0,0.4)`,
        cursor: selectable ? 'pointer' : 'default',
        opacity: dimmed ? 0.3 : 1,
      }}
    >
      {/* Value badge */}
      <div
        className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center font-black"
        style={{ background: def.color + '33', border: `2px solid ${def.color}`, color: def.color, fontSize: 14, fontFamily: 'Fredoka One, cursive' }}
      >
        {card.value}
      </div>

      {/* Emoji central */}
      <div className="flex-1 flex items-center justify-center pt-2">
        <span style={{ fontSize: 38, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          {card.emoji}
        </span>
      </div>

      {/* Name banner */}
      <div
        className="flex items-center justify-center px-2 pb-1.5 pt-1"
        style={{ background: 'rgba(0,0,0,0.45)' }}
      >
        <span style={{ color: 'white', fontSize: 11, fontWeight: 900, fontFamily: 'Fredoka One, cursive', textAlign: 'center', lineHeight: 1.2 }}>
          {card.nameFr}
        </span>
      </div>

      {/* Description tooltip on hover */}
      {showDesc && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 z-20 rounded-xl p-2.5 text-xs pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.9)',
            border: `1px solid ${def.color}66`,
            color: 'rgba(255,255,255,0.85)',
            fontFamily: 'Nunito, sans-serif',
            lineHeight: 1.4,
            backdropFilter: 'blur(8px)',
          }}
        >
          {def.description}
        </div>
      )}

      {/* Selection ring */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ boxShadow: `inset 0 0 0 2px ${def.color}` }}
        />
      )}
    </motion.div>
  );
}

/** Dos de carte Love Letter */
export function LLCardBack({ small }: { small?: boolean }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex items-center justify-center"
      style={{
        width: small ? 48 : 90,
        height: small ? 66 : 130,
        background: 'linear-gradient(145deg, #3b0764, #4c0519)',
        border: '2.5px solid #7c3aed55',
        boxShadow: '0 3px 10px rgba(0,0,0,0.5)',
      }}
    >
      <span style={{ fontSize: small ? 18 : 30, opacity: 0.5 }}>💌</span>
    </div>
  );
}
