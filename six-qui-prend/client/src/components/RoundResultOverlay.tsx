import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoundResult } from '@shared/types';
import Card from './Card';
import { playRowCapture, playOuch, playCardPlace } from '../utils/sounds';

interface RoundResultOverlayProps {
  result: RoundResult;
  myId: string | null;
  playerNames: Record<string, string>;
}

export default function RoundResultOverlay({ result, myId, playerNames }: RoundResultOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const myPlay = result.plays.find((p) => p.playerId === myId);
    if (myPlay?.tookRow && myPlay.pointsGained > 0) {
      playOuch();
    } else if (result.plays.some((p) => p.tookRow)) {
      playRowCapture();
    } else {
      playCardPlace();
    }
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [result.round]);

  const myPlay = result.plays.find((p) => p.playerId === myId);
  const myPoints = myPlay?.pointsGained ?? 0;
  const iGotHurt = myPoints > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={result.round}
          initial={{ opacity: 0, y: -60, scale: 0.8, rotate: -3 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: -40, scale: 0.9, transition: { duration: 0.4 } }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-auto px-3"
        >
          <div
            className="glass-panel p-4 shadow-2xl overflow-hidden relative"
            style={{ border: iGotHurt ? '2px solid rgba(239,68,68,0.4)' : '2px solid rgba(34,197,94,0.3)' }}
          >
            {/* Fond coloré subtil */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                background: iGotHurt
                  ? 'radial-gradient(ellipse at center, #ef4444, transparent)'
                  : 'radial-gradient(ellipse at center, #22c55e, transparent)',
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-3 relative">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl"
                >
                  {iGotHurt ? '😱' : '😊'}
                </motion.span>
                <h3 className="font-black text-amber-400 text-base font-nunito">
                  Manche {result.round} — Résultats
                </h3>
              </div>

              {myPoints > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, delay: 0.3 }}
                  className="bg-red-600/80 text-white font-black text-sm px-3 py-1.5 rounded-xl border border-red-400/50 font-nunito"
                >
                  -{myPoints} 🐂 pour vous !
                </motion.div>
              )}
              {myPoints === 0 && myPlay && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, delay: 0.3 }}
                  className="bg-green-600/60 text-green-200 font-black text-sm px-3 py-1.5 rounded-xl border border-green-400/30 font-nunito"
                >
                  😎 Safe !
                </motion.div>
              )}
            </div>

            {/* Plays list */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto relative">
              {result.plays.map((play, i) => {
                const isMe = play.playerId === myId;
                return (
                  <motion.div
                    key={play.playerId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 300 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      isMe
                        ? 'bg-amber-500/15 border border-amber-500/25'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className="font-bold text-sm text-white/80 min-w-[90px] truncate font-nunito">
                      {play.playerName}
                      {isMe && <span className="text-white/40 text-xs ml-1">(moi)</span>}
                    </span>

                    <Card card={play.card} tiny />

                    <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                      {play.tookRow ? (
                        <>
                          <motion.span
                            animate={{ x: [0, -3, 3, 0] }}
                            transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
                            className="text-xs text-white/50 font-nunito"
                          >
                            🐄 enclos {play.rowIndex + 1}
                          </motion.span>
                          <span className="text-red-400 font-black text-sm font-nunito">
                            -{play.pointsGained}🐂
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-white/30 font-nunito">
                          → enclos {play.rowIndex + 1}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Timer bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 rounded-b-3xl"
              style={{ background: 'linear-gradient(90deg, #22c55e, #fbbf24, #ef4444)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
