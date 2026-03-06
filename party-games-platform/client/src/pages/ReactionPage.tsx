import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function ReactionPage() {
  const { reactionState, reactionClick } = useGameStore();

  useEffect(() => {
    if (reactionState?.phase === 'go') {
      const handler = () => reactionClick();
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [reactionState?.phase, reactionClick]);

  if (!reactionState) return null;

  const isClickable = reactionState.phase === 'go';

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-8">
      <motion.div
        key={reactionState.phase}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md aspect-video rounded-3xl flex items-center justify-center cursor-pointer select-none"
        style={{
          background: reactionState.phase === 'go' ? '#ef4444' : reactionState.phase === 'countdown' ? '#1a1a2e' : '#0f0d1a',
          border: `4px solid ${reactionState.phase === 'go' ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: reactionState.phase === 'go' ? '0 0 60px rgba(239,68,68,0.5)' : 'none',
        }}
        onClick={isClickable ? reactionClick : undefined}
      >
        {reactionState.phase === 'waiting' && (
          <span className="text-2xl font-bold text-white/50">Get ready…</span>
        )}
        {reactionState.phase === 'countdown' && (
          <motion.span
            key={reactionState.countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-black text-white"
          >
            {reactionState.countdown}
          </motion.span>
        )}
        {reactionState.phase === 'go' && (
          <span className="text-4xl font-black text-white">CLICK NOW!</span>
        )}
        {reactionState.phase === 'results' && (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-4">Results</div>
            <div className="space-y-2">
              {reactionState.results.map((r, i) => (
                <div key={r.playerId} className="flex items-center justify-between gap-4">
                  <span className="text-xl">{r.avatar}</span>
                  <span className="font-bold">{r.playerName}</span>
                  <span className="text-amber-400 font-mono">{r.reactionMs} ms</span>
                  {i === 0 && <span className="text-green-400 font-bold">🏆</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      <p className="mt-6 text-white/50 text-sm">
        {reactionState.phase === 'go' ? 'Click anywhere as fast as you can!' : reactionState.phase === 'countdown' ? 'Wait for GO!' : ''}
      </p>
    </div>
  );
}
