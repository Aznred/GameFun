import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnoColor, UNO_COLOR_HEX } from '@shared/unoCards';

interface Props {
  visible: boolean;
  onChoose: (color: UnoColor) => void;
}

const COLORS: { value: UnoColor; label: string; emoji: string }[] = [
  { value: 'red',    label: 'Rouge',  emoji: '🔴' },
  { value: 'blue',   label: 'Bleu',   emoji: '🔵' },
  { value: 'green',  label: 'Vert',   emoji: '🟢' },
  { value: 'yellow', label: 'Jaune',  emoji: '🟡' },
];

export default function UnoColorPicker({ visible, onChoose }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="rounded-3xl p-8 text-center"
            style={{ background: '#1a1a2e', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
            <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Fredoka One, cursive' }}>
              🎨 Choisissez une couleur
            </h2>
            <p className="text-white/50 text-sm mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Votre joker sauvage — choisissez la couleur suivante
            </p>

            <div className="grid grid-cols-2 gap-4">
              {COLORS.map(({ value, label, emoji }) => (
                <motion.button
                  key={value}
                  onClick={() => onChoose(value)}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl font-black text-white relative overflow-hidden"
                  style={{
                    background: UNO_COLOR_HEX[value],
                    border: `3px solid rgba(255,255,255,0.3)`,
                    boxShadow: `0 6px 0 rgba(0,0,0,0.3), 0 12px 24px ${UNO_COLOR_HEX[value]}66`,
                    fontFamily: 'Fredoka One, cursive',
                    minWidth: 110,
                  }}
                >
                  <motion.span
                    className="text-4xl"
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 2 }}
                  >
                    {emoji}
                  </motion.span>
                  <span className="text-lg">{label}</span>

                  {/* Shine */}
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{ background: 'linear-gradient(90deg, transparent, white, transparent)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
