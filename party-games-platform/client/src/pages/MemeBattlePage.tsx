import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function MemeBattlePage() {
  const { memeBattleState, memeSubmitCaption, memeVote, playerId } = useGameStore();
  const [caption, setCaption] = useState('');

  if (!memeBattleState) return null;

  const isWriting = memeBattleState.phase === 'writing';
  const isVoting = memeBattleState.phase === 'voting';
  const isResults = memeBattleState.phase === 'results';
  const hasSubmitted = memeBattleState.captions.some((c) => c.playerId === playerId);
  const hasVoted = memeBattleState.votes[playerId ?? ''];

  const handleSubmit = () => {
    if (caption.trim() && isWriting) {
      memeSubmitCaption(caption.trim());
      setCaption('');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col p-8">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">Meme Battle</h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="aspect-video rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6"
        >
          <div className="text-6xl">😂</div>
          <span className="text-white/30 text-sm ml-2">(Add image URL here)</span>
        </motion.div>

        {isWriting && (
          <div className="flex gap-3">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Write the funniest caption..."
              maxLength={200}
              disabled={hasSubmitted}
              className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSubmit}
              disabled={!caption.trim() || hasSubmitted}
              className="px-6 py-3 rounded-xl font-bold bg-amber-500 text-black disabled:opacity-50"
            >
              {hasSubmitted ? '✓ Sent' : 'Submit'}
            </button>
          </div>
        )}

        {isVoting && (
          <div className="space-y-3">
            <div className="text-sm text-white/50">Vote for the funniest caption:</div>
            {memeBattleState.captions
              .filter((c) => c.playerId !== playerId)
              .map((c) => (
                <button
                  key={c.playerId}
                  onClick={() => !hasVoted && memeVote(c.playerId)}
                  disabled={!!hasVoted}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                    hasVoted === c.playerId ? 'border-amber-400 bg-amber-500/20' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold">{c.playerName}</div>
                  <div className="text-white/80">{c.caption}</div>
                </button>
              ))}
          </div>
        )}

        {isResults && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase text-white/50">Results</div>
            {memeBattleState.captions.map((c) => (
              <div key={c.playerId} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{c.playerName}</span>
                  <span className="text-amber-400">{memeBattleState.scores[c.playerId] ?? 0} pts</span>
                </div>
                <div className="text-white/70 mt-1">{c.caption}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
