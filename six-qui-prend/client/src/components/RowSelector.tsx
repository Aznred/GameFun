import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '@shared/types';
import GameRow from './GameRow';
import Card from './Card';
import { playClick } from '../utils/sounds';

interface RowSelectorProps {
  rows: CardType[][];
  card: CardType;
  onSelect: (rowIndex: number) => void;
}

export default function RowSelector({ rows, card, onSelect }: RowSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.7, y: 50, rotate: -3 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="glass-panel p-6 max-w-lg w-full shadow-2xl"
        style={{ border: '2px solid rgba(239,68,68,0.4)' }}
      >
        {/* Header animé */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-center mb-2"
        >
          <div className="text-5xl mb-2">😰</div>
          <h2 className="text-2xl font-black text-red-400 font-nunito">
            Trop basse !
          </h2>
        </motion.div>

        <p className="text-sm text-white/60 text-center mb-5 font-nunito">
          Votre carte <strong className="text-white font-black">{card.number}</strong> est plus petite
          que toutes les rangées. Quelle rangée voulez-vous récupérer ?
        </p>

        {/* Carte jouée */}
        <div className="flex justify-center mb-5">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Card card={card} />
          </motion.div>
        </div>

        {/* Rangées */}
        <div className="space-y-3">
          {rows.map((row, i) => {
            const points = row.reduce((s, c) => s + c.bullHeads, 0);
            const isExpensive = points >= 5;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => { playClick(); onSelect(i); }}
                className="cursor-pointer group"
              >
                <GameRow index={i} cards={row} selectable />
                <motion.div
                  className={`text-xs text-right mt-1 pr-2 font-black font-nunito ${
                    isExpensive ? 'text-red-400' : 'text-amber-400/70'
                  }`}
                >
                  {isExpensive ? '💀' : '💸'} Coûte {points} 🐂
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
