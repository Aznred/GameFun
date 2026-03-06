import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function ResultsPage() {
  const { gameEndResult, returnToHub } = useGameStore();

  if (!gameEndResult) return null;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-white/10"
      >
        <h1 className="text-3xl font-bold text-amber-400 mb-2 text-center">🏆 Winner!</h1>
        <div className="text-xl font-bold text-center mb-8 text-white/90">
          {gameEndResult.players.find((p) => p.id === gameEndResult.winnerId)?.name ?? 'Nobody'}
        </div>
        <div className="space-y-2 mb-8">
            {gameEndResult.players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-xl ${
                p.id === gameEndResult.winnerId ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-bold">{p.name}</span>
                {p.id === gameEndResult.winnerId && <span className="text-amber-400">👑</span>}
              </div>
              <span className="font-bold">{p.score} pts</span>
            </div>
          ))}
        </div>
        <button
          onClick={returnToHub}
          className="w-full py-4 rounded-xl font-bold bg-amber-500 text-black hover:bg-amber-400"
        >
          Back to Lobby
        </button>
      </motion.div>
    </div>
  );
}
