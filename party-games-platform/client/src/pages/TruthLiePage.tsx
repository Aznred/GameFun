import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function TruthLiePage() {
  const { truthLieState, truthLieSubmitVote, playerId } = useGameStore();

  if (!truthLieState) return null;

  const isVoting = truthLieState.phase === 'voting';
  const isResults = truthLieState.phase === 'results';
  const hasVoted = truthLieState.votes[playerId ?? ''];

  const options = ['true', 'false', 'partial'] as const;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <h1 className="text-2xl font-bold text-purple-400 mb-6">Truth or Lie?</h1>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
          <div className="text-sm text-white/50 mb-2">Story</div>
          <p className="text-xl font-medium">{truthLieState.story}</p>
        </div>

        {isVoting && !hasVoted && (
          <div className="flex gap-4 justify-center">
            {options.map((opt) => (
              <motion.button
                key={opt}
                onClick={() => truthLieSubmitVote(opt)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-xl font-bold capitalize border-2 border-purple-500/50 hover:bg-purple-500/20"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        )}

        {hasVoted && isVoting && (
          <p className="text-center text-white/50">Waiting for others to vote…</p>
        )}

        {isResults && (
          <div className="text-center">
            <div className="text-lg font-bold text-green-400 mb-4">The truth was: {truthLieState.truth}</div>
            <div className="space-y-2">
              {Object.entries(truthLieState.scores).map(([id, score]) => (
                <div key={id} className="flex justify-between">
                  <span>Player</span>
                  <span className="font-bold">{score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
