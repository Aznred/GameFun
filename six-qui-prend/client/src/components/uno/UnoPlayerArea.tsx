import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnoClientPlayerSummary } from '@shared/unoTypes';
import { UnoCardBack } from './UnoCard';

interface Props {
  player: UnoClientPlayerSummary;
  isMe?: boolean;
}

export default function UnoPlayerArea({ player, isMe }: Props) {
  const isCurrentPlayer = player.isCurrentPlayer;

  return (
    <motion.div
      animate={{ scale: isCurrentPlayer ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center gap-1 relative"
    >
      {/* Turn indicator */}
      <AnimatePresence>
        {isCurrentPlayer && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-5 text-xs font-black text-yellow-300 whitespace-nowrap"
            style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 0 8px rgba(253,224,71,0.8)' }}
          >
            ▼ Son tour
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards behind avatar */}
      <div className="mb-1">
        <UnoCardBack count={player.handSize} size="sm" />
      </div>

      {/* Avatar + name */}
      <div
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl"
        style={{
          background: isCurrentPlayer
            ? 'linear-gradient(135deg, rgba(253,224,71,0.2), rgba(251,146,60,0.2))'
            : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${isCurrentPlayer ? 'rgba(253,224,71,0.6)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        <div className="relative">
          <span className="text-2xl">{player.avatar}</span>
          {!player.isConnected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-black" title="Déconnecté" />
          )}
        </div>
        <span className="text-xs font-black text-white truncate max-w-[72px]" style={{ fontFamily: 'Fredoka One, cursive' }}>
          {player.name}
        </span>
        <span className="text-xs font-bold text-white/50" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {player.handSize} carte{player.handSize !== 1 ? 's' : ''}
        </span>
      </div>

      {/* UNO badge */}
      <AnimatePresence>
        {player.hasCalledUno && player.handSize === 1 && (
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: [-5, 5, 0] }}
            exit={{ scale: 0 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded-full"
            style={{ background: '#dc2626', color: 'white', fontFamily: 'Fredoka One, cursive', boxShadow: '0 2px 8px rgba(220,38,38,0.6)', whiteSpace: 'nowrap' }}
          >
            UNO!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score */}
      <div className="text-xs font-bold text-amber-300/80" style={{ fontFamily: 'Nunito, sans-serif' }}>
        🏆 {player.score} pts
      </div>
    </motion.div>
  );
}
