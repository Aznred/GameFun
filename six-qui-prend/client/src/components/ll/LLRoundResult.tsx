import React from 'react';
import { motion } from 'framer-motion';
import { LLClientGameState } from '@shared/loveLetterTypes';
import LLCard from './LLCard';

interface LLRoundResultProps {
  state: LLClientGameState;
  myId: string | null;
  isHost: boolean;
  onNextRound: () => void;
  onReturnToHub: () => void;
}

export default function LLRoundResult({ state, myId, isHost, onNextRound, onReturnToHub }: LLRoundResultProps) {
  const isGameOver = state.phase === 'game_over';
  const winnerId = isGameOver ? state.gameWinnerId : state.roundWinnerId;
  const winner = state.players.find((p) => p.id === winnerId);
  const isIWon = winnerId === myId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #1e0533 0%, #0f0a1e 100%)', border: '2px solid rgba(167,139,250,0.3)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 text-center"
          style={{ background: isGameOver ? 'linear-gradient(90deg, #78350f, #b45309)' : 'linear-gradient(90deg, #4a1d96, #7c3aed)' }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-5xl mb-2"
          >
            {isGameOver ? (isIWon ? '🏆' : '💌') : (isIWon ? '💌' : '😔')}
          </motion.div>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 22, color: 'white' }}>
            {isGameOver
              ? (isIWon ? 'Victoire ! La lettre est livrée !' : 'Partie terminée !')
              : (isIWon ? 'Vous gagnez cette manche !' : `${winner?.name ?? '?'} remporte la manche !`)}
          </h2>
          {!isGameOver && winner && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Nunito, sans-serif', marginTop: 4 }}>
              {winner.avatar} {winner.name} remporte un jeton d'affection
            </p>
          )}
        </div>

        {/* Scores */}
        <div className="p-5 space-y-2">
          <h3 className="text-xs uppercase tracking-widest font-black font-nunito mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Jetons d'affection
          </h3>
          {[...state.players].sort((a, b) => b.tokens - a.tokens).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: p.id === winnerId ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${p.id === winnerId ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <span className="text-xl">{p.avatar}</span>
              <span className="flex-1 font-bold text-sm font-nunito" style={{ color: p.id === myId ? '#fbbf24' : 'white' }}>
                {p.name}
              </span>
              {/* Token dots */}
              <div className="flex gap-1">
                {Array.from({ length: state.tokensToWin }).map((_, j) => (
                  <div
                    key={j}
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: j < p.tokens ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                      border: `1px solid ${j < p.tokens ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                    }}
                  />
                ))}
              </div>
              <span className="font-black text-sm font-nunito" style={{ color: '#fbbf24', minWidth: 32, textAlign: 'right' }}>
                {p.tokens}/{state.tokensToWin}
              </span>
            </motion.div>
          ))}

          {/* Reveal removed card */}
          {state.removedCard && (
            <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-xs font-bold font-nunito" style={{ color: 'rgba(255,255,255,0.5)' }}>Carte retirée :</span>
              <LLCard card={state.removedCard} small />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          {isGameOver ? (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onReturnToHub}
                className="flex-1 btn-primary font-nunito font-black text-base py-3"
              >
                🎮 Retour à la salle
              </motion.button>
            </>
          ) : (
            <>
              {isHost ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onNextRound}
                  className="flex-1 btn-primary font-nunito font-black text-base py-3"
                >
                  🃏 Manche suivante →
                </motion.button>
              ) : (
                <div className="flex-1 text-center py-3 font-nunito font-bold text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  ⏳ En attente de l'hôte…
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onReturnToHub}
                className="px-4 py-3 rounded-2xl font-nunito font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
              >
                🏠 Hub
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
