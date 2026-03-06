import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@shared/types';
import Card from './Card';

interface GameRowProps {
  index: number;
  cards: CardType[];
  selectable?: boolean;
  onClick?: () => void;
}

// Thèmes "pré enclos de ferme"
const ROW_THEMES = [
  {
    label: '🌾',
    name: 'Champ de blé',
    headerBg: 'linear-gradient(90deg, #92400e, #b45309)',
    rowBg: 'linear-gradient(135deg, rgba(120,53,15,0.5) 0%, rgba(146,64,14,0.35) 100%)',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.45)',
    border: '#b45309',
    slotBorder: 'rgba(245,158,11,0.3)',
  },
  {
    label: '🌿',
    name: 'Prairie',
    headerBg: 'linear-gradient(90deg, #14532d, #166534)',
    rowBg: 'linear-gradient(135deg, rgba(20,83,45,0.5) 0%, rgba(22,101,52,0.35) 100%)',
    accent: '#22c55e',
    glow: 'rgba(34,197,94,0.4)',
    border: '#16a34a',
    slotBorder: 'rgba(34,197,94,0.3)',
  },
  {
    label: '🪨',
    name: 'Enclos rocheux',
    headerBg: 'linear-gradient(90deg, #1e3a5f, #1e40af)',
    rowBg: 'linear-gradient(135deg, rgba(30,58,95,0.5) 0%, rgba(30,64,175,0.35) 100%)',
    accent: '#60a5fa',
    glow: 'rgba(96,165,250,0.4)',
    border: '#2563eb',
    slotBorder: 'rgba(96,165,250,0.3)',
  },
  {
    label: '🌸',
    name: 'Pâturage rose',
    headerBg: 'linear-gradient(90deg, #701a75, #a21caf)',
    rowBg: 'linear-gradient(135deg, rgba(112,26,117,0.5) 0%, rgba(162,28,175,0.35) 100%)',
    accent: '#e879f9',
    glow: 'rgba(232,121,249,0.4)',
    border: '#a21caf',
    slotBorder: 'rgba(232,121,249,0.3)',
  },
];

// Total des 🐄 dans une rangée
function rowBullSum(cards: CardType[]) {
  return cards.reduce((s, c) => s + c.bullHeads, 0);
}

export default function GameRow({ index, cards, selectable, onClick }: GameRowProps) {
  const theme = ROW_THEMES[index % ROW_THEMES.length];
  const filled = cards.length;
  const slotsLeft = 5 - filled; // 5 cartes max avant la 6e qui déclenche la prise
  const isDangerous = filled >= 4;
  const isAlmostFull = filled === 5;
  const bullTotal = rowBullSum(cards);

  return (
    <motion.div
      onClick={onClick}
      whileHover={selectable ? { scale: 1.025, y: -4 } : {}}
      whileTap={selectable ? { scale: 0.96 } : {}}
      className="relative rounded-2xl overflow-hidden"
      style={{
        border: `2.5px solid ${selectable ? theme.accent : theme.border + '77'}`,
        boxShadow: selectable
          ? `0 0 24px ${theme.glow}, 0 4px 16px rgba(0,0,0,0.4)`
          : `0 4px 12px rgba(0,0,0,0.3)`,
        cursor: selectable ? 'pointer' : 'default',
        background: theme.rowBg,
      }}
    >
      {/* ── Bandeau titre ── */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: theme.headerBg, borderBottom: `1px solid rgba(255,255,255,0.1)` }}
      >
        <span className="text-base">{theme.label}</span>
        <span style={{
          fontFamily: 'Fredoka One, cursive',
          fontSize: 13,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.02em',
        }}>
          {theme.name}
        </span>

        {/* Compteur de bœufs dans la rangée */}
        {bullTotal > 0 && (
          <span
            className="ml-auto text-xs font-black rounded-full px-2 py-0.5"
            style={{
              background: 'rgba(0,0,0,0.35)',
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            {bullTotal} 🐄
          </span>
        )}

        {/* Jauge de remplissage */}
        <div
          className="flex gap-0.5 ml-1"
          style={{ opacity: 0.7 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i < filled
                  ? (isDangerous ? '#ef4444' : theme.accent)
                  : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Zone des cartes ── */}
      <div className="flex items-center gap-2 p-2.5 min-h-[80px]">
        {/* Cartes */}
        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          <AnimatePresence>
            {cards.map((card, i) => (
              <motion.div
                key={card.number}
                initial={{ opacity: 0, scale: 0.25, x: 40, rotate: 25 }}
                animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, y: -40, rotate: -30 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26, delay: i * 0.03 }}
              >
                <Card card={card} small />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Emplacements vides */}
        <div className="flex gap-1 shrink-0">
          {Array.from({ length: Math.max(0, slotsLeft) }).map((_, i) => (
            <motion.div
              key={i}
              animate={isAlmostFull && i === 0
                ? { opacity: [0.25, 0.9, 0.25], scale: [1, 1.08, 1] }
                : {}
              }
              transition={{ duration: 0.7, repeat: Infinity }}
              style={{
                width: 46,
                height: 64,
                borderRadius: 12,
                border: `2px dashed ${isDangerous ? '#ef444488' : theme.slotBorder}`,
                background: isDangerous ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.04)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Badge alerte rangée pleine ── */}
      <AnimatePresence>
        {isAlmostFull && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-3 right-3 z-10"
          >
            <motion.div
              animate={{ rotate: [-4, 4, -4], scale: [1, 1.05, 1] }}
              transition={{ duration: 0.45, repeat: Infinity }}
              className="flex items-center gap-1 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xl"
              style={{
                background: 'linear-gradient(90deg, #dc2626, #b91c1c)',
                border: '2px solid #fca5a5',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              🐄 DANGER !
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sélection glow pulsant */}
      {selectable && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.3, 0.75, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{ boxShadow: `inset 0 0 0 2.5px ${theme.accent}` }}
        />
      )}
    </motion.div>
  );
}
