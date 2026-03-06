import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnoClientGameState } from '@shared/unoTypes';

interface Props {
  game: UnoClientGameState;
  isHost: boolean;
  onNextRound: () => void;
  onReturnToHub: () => void;
}

export default function UnoRoundResult({ game, isHost, onNextRound, onReturnToHub }: Props) {
  const isVisible = game.phase === 'round_end' || game.phase === 'game_over';
  const isGameOver = game.phase === 'game_over';
  const winnerId = isGameOver ? game.gameWinnerId : game.roundWinnerId;
  const winner = game.players.find((p) => p.id === winnerId);

  const sorted = [...game.players].sort((a, b) => b.score - a.score);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-3xl p-8 w-full max-w-sm text-center"
            style={{ background: '#0f172a', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}
          >
            {/* Title */}
            <motion.div
              animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-6xl mb-3"
            >
              {isGameOver ? '🏆' : '🎉'}
            </motion.div>

            <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Fredoka One, cursive' }}>
              {isGameOver ? 'Partie terminée !' : `Manche ${game.roundNumber} terminée !`}
            </h2>

            {winner && (
              <p className="text-lg mb-5" style={{ color: '#fbbf24', fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>
                {winner.avatar} {winner.name} {isGameOver ? 'remporte la partie !' : 'gagne la manche !'}
              </p>
            )}

            {/* Scores */}
            <div className="space-y-2 mb-6">
              {sorted.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{
                    background: p.id === winnerId
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))'
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${p.id === winnerId ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white/40" style={{ fontFamily: 'Fredoka One, cursive', minWidth: 16 }}>
                      #{i + 1}
                    </span>
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-black text-white text-sm" style={{ fontFamily: 'Fredoka One, cursive' }}>
                      {p.name}
                    </span>
                    {p.id === winnerId && <span className="text-yellow-400 text-sm">👑</span>}
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-300" style={{ fontFamily: 'Fredoka One, cursive' }}>
                      {p.score} pts
                    </div>
                    <div className="text-xs text-white/40" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      / {game.targetScore}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {!isGameOver && isHost && (
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onNextRound}
                  className="flex-1 py-3 rounded-2xl font-black text-white text-base"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #f97316)',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                    fontFamily: 'Fredoka One, cursive',
                  }}
                >
                  🎮 Manche suivante
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={onReturnToHub}
                className="flex-1 py-3 rounded-2xl font-black text-base"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: 'Fredoka One, cursive',
                }}
              >
                🏠 Hub
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
