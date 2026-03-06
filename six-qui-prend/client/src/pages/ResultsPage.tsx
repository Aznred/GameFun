import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playVictory, playDefeat, playClick } from '../utils/sounds';

// ── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#fbbf24', '#f97316', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const CONFETTI_EMOJIS = ['🐮', '🐂', '⭐', '🎉', '🏆', '🎊', '✨'];

interface Particle {
  id: number;
  x: number;
  color: string;
  emoji?: string;
  size: number;
  duration: number;
  delay: number;
  spin: number;
}

function generateConfetti(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    emoji: Math.random() > 0.6 ? CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)] : undefined,
    size: 8 + Math.random() * 12,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2,
    spin: (Math.random() - 0.5) * 720,
  }));
}

const CONFETTI_PARTICLES = generateConfetti(60);

export default function ResultsPage() {
  const { gameEndResult, playerId, resetToHome, returnToHub, room } = useGameStore();
  const played = useRef(false);

  useEffect(() => {
    if (!gameEndResult || played.current) return;
    played.current = true;
    const isWinner = gameEndResult.winnerId === playerId;
    setTimeout(() => isWinner ? playVictory() : playDefeat(), 300);
  }, []);

  if (!gameEndResult) return null;

  const winner = gameEndResult.players[0];
  const isWinner = winner.id === playerId;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* ── Confettis ────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {CONFETTI_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute top-0"
            style={{ left: `${p.x}%` }}
            initial={{ y: -50, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0],
              rotate: p.spin,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
              ease: 'linear',
            }}
          >
            {p.emoji ? (
              <span style={{ fontSize: p.size + 8 }}>{p.emoji}</span>
            ) : (
              <div
                style={{
                  width: p.size,
                  height: p.size * 0.5,
                  background: p.color,
                  borderRadius: 2,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Background glow ───────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isWinner
            ? 'radial-gradient(ellipse at center, rgba(251,191,36,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)',
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -60, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -8, 8, -4, 0],
          }}
          transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-8xl mb-4"
        >
          {isWinner ? '🏆' : '🐮'}
        </motion.div>

        <motion.h1
          className="title-fredoka text-5xl md:text-6xl leading-none mb-2"
          style={{
            background: isWinner
              ? 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)'
              : 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
          }}
        >
          {isWinner ? 'Victoire !' : 'Partie terminée !'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-white/60 font-nunito font-semibold text-lg"
        >
          {isWinner
            ? '🎊 Vous avez le moins de têtes de bœuf !'
            : `🏆 ${winner.avatar} ${winner.name} remporte la partie !`}
        </motion.p>
      </motion.div>

      {/* ── Classement ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
        className="glass-panel p-6 w-full max-w-md shadow-2xl relative z-10 mb-6"
        style={{ border: '2px solid rgba(251,191,36,0.2)' }}
      >
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-5 text-center font-black font-nunito">
          🏆 Classement final
        </h2>

        <div className="space-y-3">
          {gameEndResult.players.map((player, i) => {
            const isMe = player.id === playerId;
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[i] ?? `${i + 1}.`;
            const bgStyles = [
              'from-amber-900/40 to-amber-950/30 border-amber-500/40',
              'from-gray-800/40 to-gray-900/30 border-gray-500/30',
              'from-orange-900/30 to-orange-950/20 border-orange-600/25',
            ];

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -40, rotate: -3 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 22,
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-gradient-to-r ${
                  bgStyles[i] ?? 'from-white/5 to-transparent border-white/10'
                } ${isMe ? 'ring-2 ring-amber-400/50' : ''}`}
              >
                <motion.span
                  className="text-3xl w-10 text-center"
                  animate={i === 0 ? { scale: [1, 1.2, 1], rotate: [-5, 5, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, delay: 1 }}
                >
                  {medal}
                </motion.span>

                <span className="text-2xl">{player.avatar}</span>

                <div className="flex-1 min-w-0">
                  <span className={`font-black text-base font-nunito ${isMe ? 'text-amber-300' : 'text-white'}`}>
                    {player.name}
                  </span>
                  {isMe && <span className="text-white/30 text-xs ml-2 font-nunito">(vous)</span>}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 400 }}
                  className={`font-black text-xl tabular-nums font-nunito ${
                    i === 0 ? 'text-amber-400' : isMe ? 'text-amber-300' : 'text-white/70'
                  }`}
                >
                  {player.score} 🐂
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Boutons ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 flex gap-3 flex-wrap justify-center"
      >
        {/* Retour au hub si une salle existe encore */}
        {room && (
          <motion.button
            onClick={() => { playClick(); returnToHub(); }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 2 }}
            className="btn-primary text-lg px-10 py-4 font-nunito font-black"
          >
            🎮 Retour à la salle
          </motion.button>
        )}

        <motion.button
          onClick={() => { playClick(); resetToHome(); }}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.95, y: 2 }}
          className="text-lg px-8 py-4 font-nunito font-black rounded-2xl border-2"
          style={{
            background: 'rgba(255,255,255,0.07)',
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.7)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
          }}
        >
          🏠 Accueil
        </motion.button>
      </motion.div>
    </div>
  );
}
