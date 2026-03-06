import React from 'react';
import { motion } from 'framer-motion';
import { EKCard as EKCardData } from '@shared/ekCards';
import {
  EK_CARD_LABELS, EK_CARD_EMOJIS, EK_CARD_COLORS, EK_CARD_DESC, isCatCard,
} from '@shared/ekCards';

interface Props {
  card: EKCardData;
  selected?: boolean;
  selectable?: boolean;
  dimmed?: boolean;
  small?: boolean;
  onClick?: (card: EKCardData) => void;
  showTooltip?: boolean;
}

export default function EKCard({
  card, selected, selectable, dimmed, small, onClick, showTooltip = true,
}: Props) {
  const color = EK_CARD_COLORS[card.type];
  const emoji = EK_CARD_EMOJIS[card.type];
  const label = EK_CARD_LABELS[card.type];
  const desc = EK_CARD_DESC[card.type];

  const w = small ? 64 : 90;
  const h = small ? 96 : 130;
  const fontSize = small ? 28 : 38;

  return (
    <div className="relative group" style={{ width: w, height: h }}>
      <motion.button
        onClick={() => onClick?.(card)}
        disabled={!selectable}
        whileHover={selectable ? { y: -10, scale: 1.05 } : undefined}
        whileTap={selectable ? { scale: 0.95 } : undefined}
        animate={selected ? { y: -14, scale: 1.06 } : { y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          width: w,
          height: h,
          borderRadius: 8,
          border: `2px solid ${selected ? color : 'rgba(255,255,255,0.15)'}`,
          background: selected
            ? `${color}22`
            : 'rgba(255,255,255,0.04)',
          cursor: selectable ? 'pointer' : 'default',
          opacity: dimmed ? 0.4 : 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: '6px 4px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top color bar */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 3,
          background: color,
          borderRadius: '8px 8px 0 0',
        }} />
        {/* Emoji */}
        <div style={{ fontSize, lineHeight: 1, userSelect: 'none' }}>{emoji}</div>
        {/* Label */}
        <div style={{
          fontSize: small ? 9 : 10,
          fontWeight: 700,
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.2,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          padding: '0 2px',
          userSelect: 'none',
        }}>
          {label}
        </div>
        {/* Cat pair indicator */}
        {isCatCard(card.type) && !small && (
          <div style={{
            fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            PAIRE
          </div>
        )}
      </motion.button>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div
          className="pointer-events-none absolute z-50 bottom-full left-1/2 mb-2 hidden group-hover:block"
          style={{ transform: 'translateX(-50%)', width: 180 }}
        >
          <div style={{
            background: '#1a1f2e',
            border: `1px solid ${color}`,
            borderRadius: 6,
            padding: '8px 10px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 4 }}>
              {emoji} {label}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
              {desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A face-down card (back of deck) */
export function EKCardBack({ small }: { small?: boolean }) {
  const w = small ? 64 : 90;
  const h = small ? 96 : 130;
  return (
    <div style={{
      width: w, height: h,
      borderRadius: 8,
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: '2px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: small ? 28 : 36,
    }}>
      💥
    </div>
  );
}
