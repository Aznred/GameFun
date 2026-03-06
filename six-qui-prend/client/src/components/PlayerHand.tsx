import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@shared/types';
import Card from './Card';
import { playCardPlay } from '../utils/sounds';

interface PlayerHandProps {
  hand: CardType[];
  selectedNumber: number | null;
  hasPlayed: boolean;
  phase: string;
  onSelect: (n: number) => void;
  onPlay: () => void;
}

export default function PlayerHand({ hand, selectedNumber, hasPlayed, phase, onSelect, onPlay }: PlayerHandProps) {
  const canPlay = !hasPlayed && phase === 'playing';

  const handlePlay = () => {
    playCardPlay();
    onPlay();
  };

  return (
    <div className="glass-panel p-4 relative overflow-hidden">
      {/* Fond déco */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, #fbbf24 0%, transparent 70%)' }} />

      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="font-black text-white/80 uppercase tracking-widest text-sm font-nunito flex items-center gap-2">
          🐄 Votre main
          <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full font-bold">
            {hand.length}
          </span>
        </h3>

        <AnimatePresence mode="wait">
          {hasPlayed ? (
            <motion.div
              key="played"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-300 text-sm font-black px-3 py-1.5 rounded-full font-nunito"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.5 }}
              >
                ✅
              </motion.span>
              Carte jouée !
            </motion.div>
          ) : phase === 'row_selection' ? (
            <motion.div
              key="waiting"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-sm font-black px-3 py-1.5 rounded-full font-nunito"
            >
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                ⏳
              </motion.span>
              En attente…
            </motion.div>
          ) : canPlay ? (
            <motion.div
              key="select"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-amber-400/70 text-xs font-bold font-nunito"
            >
              {selectedNumber ? '👆 Cliquez encore pour désélectionner' : '👇 Choisissez une carte'}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Cartes */}
      <div className="flex flex-wrap gap-2 justify-center items-end pb-2">
        <AnimatePresence>
          {hand.map((card, i) => (
            <motion.div
              key={card.number}
              layout
              initial={{ opacity: 0, y: 60, rotate: Math.random() * 20 - 10 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{
                opacity: 0,
                y: -80,
                scale: 0.5,
                rotate: 20,
                transition: { duration: 0.3 },
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.04 }}
            >
              <Card
                card={card}
                selected={selectedNumber === card.number}
                selectable={canPlay}
                dimmed={hasPlayed}
                onClick={() => canPlay && onSelect(selectedNumber === card.number ? 0 : card.number)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bouton jouer */}
      <AnimatePresence>
        {canPlay && selectedNumber !== null && selectedNumber > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex justify-center mt-4"
          >
            <motion.button
              onClick={handlePlay}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93, y: 3 }}
              className="btn-primary text-xl px-12 py-4 font-nunito font-black relative overflow-hidden"
            >
              {/* Shine animé */}
              <motion.div
                className="absolute inset-0 opacity-30"
                style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              🐄 Envoyer le {selectedNumber} !
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
