import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientPlayerSummary } from '@shared/types';

interface ScoreboardProps {
  players: ClientPlayerSummary[];
  myId: string | null;
  round: number;
  totalRounds: number;
}

const RANK_COLORS = ['text-amber-400', 'text-gray-300', 'text-orange-600'];
const RANK_BG = ['bg-amber-500/15 border-amber-500/30', 'bg-white/8 border-white/15', 'bg-orange-900/15 border-orange-600/20'];

export default function Scoreboard({ players, myId, round, totalRounds }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => a.score - b.score);
  const progress = ((round - 1) / totalRounds) * 100;

  return (
    <div className="glass-panel p-3 min-w-[190px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 font-nunito">
          🏆 Scores
        </h3>
        <div className="text-right">
          <span className="text-xs font-black text-amber-400 font-nunito">
            {round}/{totalRounds}
          </span>
          <div className="text-[10px] text-white/30 font-nunito">manches</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #22c55e, #fbbf24, #ef4444)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Player list */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {sorted.map((player, rank) => {
            const isMe = player.id === myId;
            const isFirst = rank === 0;
            return (
              <motion.div
                key={player.id}
                layout
                layoutId={`score-${player.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-2 py-2 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-amber-500/15 border-amber-500/30'
                    : RANK_BG[rank] ?? 'bg-white/5 border-transparent'
                }`}
              >
                {/* Rank */}
                <span className={`text-sm font-black w-5 text-center ${RANK_COLORS[rank] ?? 'text-white/30'} font-nunito`}>
                  {rank === 0 ? '👑' : rank + 1}
                </span>

                {/* Avatar */}
                <motion.span
                  className="text-lg"
                  animate={isFirst ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  {player.avatar}
                </motion.span>

                {/* Name */}
                <span className={`text-xs font-bold flex-1 truncate font-nunito ${isMe ? 'text-amber-300' : 'text-white/80'}`}>
                  {player.name}
                  {isMe && <span className="text-white/30 ml-1 text-[10px]">(moi)</span>}
                </span>

                {/* Indicators */}
                <div className="flex items-center gap-1 shrink-0">
                  {player.isChoosingRow && (
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="text-xs"
                    >⏳</motion.span>
                  )}
                  {player.hasPlayed && !player.isChoosingRow && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-green-400"
                    >✓</motion.span>
                  )}
                  {!player.isConnected && (
                    <span className="text-xs text-red-400">✕</span>
                  )}
                </div>

                {/* Score */}
                <motion.div
                  key={player.score}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  className={`text-sm font-black tabular-nums min-w-[32px] text-right font-nunito ${
                    isMe ? 'text-amber-400' : isFirst ? 'text-green-400' : 'text-white/70'
                  }`}
                >
                  {player.score}🐂
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
