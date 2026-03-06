import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@shared/types';

interface CardProps {
  card: CardType;
  selected?: boolean;
  selectable?: boolean;
  dimmed?: boolean;
  small?: boolean;
  tiny?: boolean;
  onClick?: () => void;
}

// ─── Thème selon le nombre de têtes de bœuf ──────────────────────────────────

interface Theme {
  bg: string;
  border: string;
  headerBg: string;
  headerText: string;
  cowColor: string;
  badge: string | null;
  badgeColor: string;
  face: string;   // emoji central
  topLabel?: string;
}

function getTheme(bulls: number): Theme {
  if (bulls >= 7) return {
    bg: 'linear-gradient(160deg, #fdf4ff 0%, #f3e8ff 100%)',
    border: '#7c3aed',
    headerBg: 'linear-gradient(90deg, #6d28d9, #7c3aed)',
    headerText: '#ffffff',
    cowColor: '#7c3aed',
    badge: '☠️ MORT',
    badgeColor: '#7c3aed',
    face: '💀',
  };
  if (bulls >= 5) return {
    bg: 'linear-gradient(160deg, #fff1f2 0%, #fecdd3 100%)',
    border: '#dc2626',
    headerBg: 'linear-gradient(90deg, #b91c1c, #dc2626)',
    headerText: '#ffffff',
    cowColor: '#dc2626',
    badge: '😱 AÏÏÏ',
    badgeColor: '#dc2626',
    face: '😱',
  };
  if (bulls >= 3) return {
    bg: 'linear-gradient(160deg, #fff7ed 0%, #fed7aa 100%)',
    border: '#ea580c',
    headerBg: 'linear-gradient(90deg, #c2410c, #ea580c)',
    headerText: '#ffffff',
    cowColor: '#ea580c',
    badge: '😬 OUF',
    badgeColor: '#ea580c',
    face: '😬',
  };
  if (bulls === 2) return {
    bg: 'linear-gradient(160deg, #fffbeb 0%, #fde68a 100%)',
    border: '#d97706',
    headerBg: 'linear-gradient(90deg, #b45309, #d97706)',
    headerText: '#ffffff',
    cowColor: '#d97706',
    badge: null,
    badgeColor: '#d97706',
    face: '😐',
  };
  return {
    bg: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%)',
    border: '#64748b',
    headerBg: 'linear-gradient(90deg, #475569, #64748b)',
    headerText: '#ffffff',
    cowColor: '#475569',
    badge: null,
    badgeColor: '#64748b',
    face: '😊',
  };
}

// ─── Rangée de 🐄 ─────────────────────────────────────────────────────────────

function CowRow({ count, color, size = 14 }: { count: number; color: string; size?: number }) {
  const shown = Math.min(count, 7);
  return (
    <div className="flex flex-wrap justify-center gap-px" style={{ maxWidth: size * 4 + 12 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <span key={i} style={{ fontSize: size, lineHeight: 1, filter: `drop-shadow(0 1px 0 ${color}88)` }}>
          🐄
        </span>
      ))}
      {count > 7 && (
        <span style={{ fontSize: size * 0.75, color, fontWeight: 900, alignSelf: 'center' }}>+{count - 7}</span>
      )}
    </div>
  );
}

// ─── Carte tiny (dans les rangées) ───────────────────────────────────────────

export function CardTiny({ card }: { card: CardType }) {
  const theme = getTheme(card.bullHeads);
  return (
    <div
      className="rounded-lg overflow-hidden select-none flex flex-col"
      style={{
        width: 36,
        height: 50,
        background: theme.bg,
        border: `2px solid ${theme.border}`,
        boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ background: theme.headerBg, height: 18, flexShrink: 0 }}
      >
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 900, fontFamily: 'Fredoka One, cursive' }}>
          {card.number}
        </span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
        <CowRow count={card.bullHeads} color={theme.cowColor} size={9} />
      </div>
    </div>
  );
}

// ─── Carte small (affichée dans GameRow) ─────────────────────────────────────

function CardSmall({ card }: { card: CardType }) {
  const theme = getTheme(card.bullHeads);
  return (
    <div
      className="rounded-xl overflow-hidden select-none flex flex-col"
      style={{
        width: 46,
        height: 64,
        background: theme.bg,
        border: `2.5px solid ${theme.border}`,
        boxShadow: '0 3px 7px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center"
        style={{ background: theme.headerBg, height: 22, flexShrink: 0 }}
      >
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 900, fontFamily: 'Fredoka One, cursive' }}>
          {card.number}
        </span>
      </div>

      {/* Corps */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        <CowRow count={card.bullHeads} color={theme.cowColor} size={11} />
        <span style={{ fontSize: 9, fontWeight: 800, color: theme.cowColor, fontFamily: 'Nunito, sans-serif' }}>
          ×{card.bullHeads}
        </span>
      </div>
    </div>
  );
}

// ─── Carte normale (dans la main) ────────────────────────────────────────────

export default function Card({ card, selected, selectable, dimmed, small, tiny, onClick }: CardProps) {
  if (tiny) return <CardTiny card={card} />;
  if (small) return <CardSmall card={card} />;

  const theme = getTheme(card.bullHeads);

  return (
    <motion.div
      whileHover={selectable ? { y: -12, scale: 1.08, rotate: [-1, 1, -1] } : {}}
      whileTap={selectable ? { scale: 0.92 } : {}}
      animate={selected ? { y: -18, scale: 1.12 } : { y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden select-none flex flex-col"
      style={{
        width: 80,
        height: 110,
        background: theme.bg,
        border: `3px solid ${selected ? theme.border : theme.border + 'bb'}`,
        boxShadow: selected
          ? `0 0 0 2px ${theme.border}, 0 8px 0 rgba(0,0,0,0.22), 0 12px 28px ${theme.border}44`
          : `0 4px 0 rgba(0,0,0,0.22), 0 6px 18px rgba(0,0,0,0.28)`,
        cursor: selectable ? 'pointer' : 'default',
        opacity: dimmed ? 0.3 : 1,
        transition: 'opacity 0.3s, box-shadow 0.15s',
      }}
    >
      {/* ── Header coloré avec numéro ── */}
      <div
        className="flex items-center justify-between px-2"
        style={{ background: theme.headerBg, height: 30, flexShrink: 0 }}
      >
        <span style={{
          color: '#fff',
          fontSize: 20,
          fontWeight: 900,
          fontFamily: 'Fredoka One, cursive',
          lineHeight: 1,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          {card.number}
        </span>

        {/* Badge danger compact */}
        {theme.badge && (
          <span style={{
            fontSize: 8,
            fontWeight: 900,
            color: 'white',
            background: 'rgba(0,0,0,0.3)',
            padding: '1px 4px',
            borderRadius: 99,
            fontFamily: 'Nunito, sans-serif',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            {theme.badge}
          </span>
        )}
      </div>

      {/* ── Corps de la carte ── */}
      <div
        className="flex-1 flex flex-col items-center justify-around py-1.5 px-1"
        style={{ background: 'rgba(255,255,255,0.5)' }}
      >
        {/* Emoji central expressif */}
        <span style={{ fontSize: 22, lineHeight: 1, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}>
          {theme.face}
        </span>

        {/* Vaches 🐄 */}
        <CowRow count={card.bullHeads} color={theme.cowColor} size={12} />
      </div>

      {/* ── Pied : numéro + count ── */}
      <div
        className="flex items-center justify-between px-2"
        style={{ background: theme.headerBg + 'cc', height: 22, flexShrink: 0 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Fredoka One, cursive' }}>
          {card.number}
        </span>
        <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.9)', fontFamily: 'Nunito, sans-serif' }}>
          {card.bullHeads}🐄
        </span>
      </div>

      {/* Anneau de sélection pulsant */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ boxShadow: `inset 0 0 0 2.5px ${theme.border}` }}
        />
      )}
    </motion.div>
  );
}

/** Dos de carte */
export function CardBack({ small, tiny }: { small?: boolean; tiny?: boolean }) {
  const w = tiny ? 36 : small ? 46 : 80;
  const h = tiny ? 50 : small ? 64 : 110;
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1"
      style={{
        width: w,
        height: h,
        background: 'linear-gradient(145deg, #14532d 0%, #166534 50%, #14532d 100%)',
        border: '2.5px solid #16a34a',
        boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
      }}
    >
      <span style={{ fontSize: tiny ? 14 : small ? 18 : 26, opacity: 0.5 }}>🐮</span>
      {!tiny && (
        <span style={{ fontSize: tiny ? 6 : small ? 8 : 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'Fredoka One, cursive' }}>
          6 QUI PREND
        </span>
      )}
    </div>
  );
}
