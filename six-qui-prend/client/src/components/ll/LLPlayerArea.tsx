import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LLClientPlayerSummary } from '@shared/loveLetterTypes';
import { LLCard as LLCardType } from '@shared/loveLetterCards';
import LLCard, { LLCardBack } from './LLCard';

interface LLPlayerAreaProps {
  player: LLClientPlayerSummary;
  isMe?: boolean;
  tokensToWin: number;
}

export default function LLPlayerArea({ player, isMe, tokensToWin }: LLPlayerAreaProps) {
  return (
    <motion.div
      layout
      className="rounded-2xl p-3 flex flex-col gap-2 relative"
      style={{
        background: player.isCurrentPlayer
          ? 'rgba(124,58,237,0.2)'
          : player.isEliminated
          ? 'rgba(239,68,68,0.08)'
          : 'rgba(255,255,255,0.05)',
        border: player.isCurrentPlayer
          ? '2px solid rgba(167,139,250,0.6)'
          : player.isEliminated
          ? '1px solid rgba(239,68,68,0.2)'
          : '1px solid rgba(255,255,255,0.07)',
        opacity: player.isEliminated ? 0.55 : 1,
      }}
    >
      {/* Current player indicator */}
      {player.isCurrentPlayer && (
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded-full"
          style={{ background: '#7c3aed', color: 'white', fontFamily: 'Nunito, sans-serif' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ▶ Son tour
        </motion.div>
      )}

      {/* Player info */}
      <div className="flex items-center gap-2">
        <motion.span
          className="text-2xl"
          animate={player.isCurrentPlayer ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          {player.avatar}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p
            className="font-black text-sm font-nunito truncate"
            style={{ color: isMe ? '#fbbf24' : player.isEliminated ? '#f87171' : 'white' }}
          >
            {player.name} {isMe && '(vous)'}
          </p>
          <div className="flex items-center gap-1">
            {player.isProtected && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold font-nunito" style={{ background: 'rgba(167,139,250,0.2)', color: '#c084fc' }}>
                🛡️ Protégé
              </span>
            )}
            {player.isEliminated && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold font-nunito" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                💀 Éliminé
              </span>
            )}
          </div>
        </div>

        {/* Tokens */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex gap-0.5 flex-wrap justify-end" style={{ maxWidth: 64 }}>
            {Array.from({ length: tokensToWin }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  background: i < player.tokens ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${i < player.tokens ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: i < player.tokens ? '0 0 6px rgba(251,191,36,0.5)' : 'none',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-bold font-nunito" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {player.tokens}/{tokensToWin}
          </span>
        </div>
      </div>

      {/* Discard pile */}
      {player.discardPile.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence>
            {player.discardPile.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.3, rotate: 30 }}
                animate={{ opacity: 1, scale: 1, rotate: (i % 3 - 1) * 4 }}
                className="relative"
                title={entry.result}
              >
                <LLCard card={entry.card} small />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Hand size indicator (for other players) */}
      {!isMe && !player.isEliminated && (
        <div className="flex gap-1">
          {Array.from({ length: player.handSize }).map((_, i) => (
            <LLCardBack key={i} small />
          ))}
        </div>
      )}
    </motion.div>
  );
}
