import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playClick, playGameStart, playOuch } from '../utils/sounds';
import LLCard from '../components/ll/LLCard';
import LLActionPanel from '../components/ll/LLActionPanel';
import LLPlayerArea from '../components/ll/LLPlayerArea';
import LLRoundResult from '../components/ll/LLRoundResult';
import Chat from '../components/Chat';
import LoveLetterRulesModal from '../components/LoveLetterRulesModal';
import { LLCardId } from '@shared/loveLetterCards';
import { LLCard as LLCardType } from '@shared/loveLetterCards';

export default function LoveLetterPage() {
  const {
    llGame, playerId, room, chatMessages,
    llPlayCard, llNextRound, returnToHub,
  } = useGameStore();

  const [peekCard, setPeekCard] = useState<LLCardType | null>(null);
  const [showPeek, setShowPeek] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const prevActionRef = useRef<string | null>(null);

  // Listen for peek event
  useEffect(() => {
    const { socket: s } = useGameStore.getState() as any;
    if (!s) return;
    const handler = (card: LLCardType) => {
      setPeekCard(card);
      setShowPeek(true);
      setTimeout(() => setShowPeek(false), 4000);
    };
    s.on('ll_peek', handler);
    return () => s.off('ll_peek', handler);
  }, []);

  // Sound on action
  useEffect(() => {
    if (!llGame?.lastAction) return;
    const key = llGame.lastAction.result;
    if (key === prevActionRef.current) return;
    prevActionRef.current = key;
    if (llGame.lastAction.eliminatedId) playOuch();
    else playClick();
  }, [llGame?.lastAction]);

  useEffect(() => { playGameStart(); }, []);

  if (!llGame) return null;

  const me = llGame.players.find((p) => p.id === playerId);
  const opponents = llGame.players.filter((p) => p.id !== playerId);
  const isHost = room?.hostId === playerId;
  const isRoundEnd = llGame.phase === 'round_end' || llGame.phase === 'game_over';

  const handlePlay = (cardId: LLCardId, targetId?: string, guess?: LLCardId) => {
    llPlayCard(cardId, targetId, guess);
  };

  return (
    <div className="min-h-dvh flex flex-col max-w-4xl mx-auto p-3 gap-3">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <motion.span
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          className="text-3xl"
        >
          💌
        </motion.span>
        <div>
          <h1 className="title-fredoka text-2xl leading-none" style={{
            background: 'linear-gradient(135deg, #c084fc, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Love Letter
          </h1>
          <p className="text-xs font-nunito font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Manche {llGame.roundNumber} · {llGame.deckSize} cartes restantes
          </p>
        </div>

        {/* Bouton règles */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playClick(); setShowRules(true); }}
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base"
          style={{ background: 'rgba(192,132,252,0.2)', border: '2px solid rgba(192,132,252,0.4)', color: '#c084fc' }}
          title="Règles du jeu"
        >
          📖
        </motion.button>

        {/* Phase indicator */}
        <div className="ml-auto">
          {llGame.isMyTurn && llGame.phase === 'playing' && (
            <motion.div
              animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 8px rgba(192,132,252,0.3)', '0 0 22px rgba(192,132,252,0.7)', '0 0 8px rgba(192,132,252,0.3)'] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="px-4 py-2 rounded-full text-sm font-black font-nunito text-white flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              💌 À vous de jouer !
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Opponents ── */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(opponents.length, 3)}, 1fr)` }}>
        {opponents.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <LLPlayerArea player={p} tokensToWin={llGame.tokensToWin} />
          </motion.div>
        ))}
      </div>

      {/* ── Last action log ── */}
      <AnimatePresence>
        {llGame.lastAction && (
          <motion.div
            key={llGame.lastAction.result}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl px-4 py-2.5 flex items-center gap-3"
            style={{
              background: llGame.lastAction.eliminatedId ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${llGame.lastAction.eliminatedId ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <span className="text-lg">{llGame.lastAction.card.emoji}</span>
            <div className="flex-1">
              <span className="text-xs font-black font-nunito" style={{ color: '#c084fc' }}>
                {llGame.lastAction.playerName}
              </span>
              <span className="text-xs font-nunito ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                joue {llGame.lastAction.card.nameFr}
              </span>
              <p className="text-xs font-nunito" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
                {llGame.lastAction.result}
              </p>
            </div>
            {llGame.lastAction.eliminatedId && (
              <span className="text-xl">💀</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── My zone ── */}
      <div className="glass-panel p-4 flex flex-col gap-3">
        {me && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{me.avatar}</span>
            <div>
              <span className="font-black text-sm font-nunito text-amber-300">{me.name} (vous)</span>
              {me.isProtected && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold font-nunito" style={{ background: 'rgba(192,132,252,0.2)', color: '#c084fc' }}>
                  🛡️ Protégé
                </span>
              )}
            </div>
            <div className="ml-auto flex gap-1">
              {Array.from({ length: llGame.tokensToWin }).map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full" style={{
                  background: i < me.tokens ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${i < me.tokens ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                  boxShadow: i < me.tokens ? '0 0 6px rgba(251,191,36,0.5)' : 'none',
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Hand */}
        <div>
          <p className="text-xs uppercase tracking-widest font-black font-nunito mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Votre main
          </p>
          <div className="flex gap-3">
            {llGame.hand.map((card) => (
              <LLCard key={card.id} card={card} dimmed={!llGame.isMyTurn} />
            ))}
          </div>
        </div>

        {/* Action panel */}
        {llGame.phase === 'playing' && (
          <LLActionPanel
            state={llGame}
            myId={playerId}
            onPlay={handlePlay}
          />
        )}
      </div>

      {/* ── Priest peek overlay ── */}
      <AnimatePresence>
        {showPeek && peekCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowPeek(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-nunito font-bold mb-4 text-white/70">🕊️ Vous regardez secrètement…</p>
              <LLCard card={peekCard} />
              <p className="mt-4 text-xs font-nunito text-white/50">Cliquez pour fermer</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Round / Game end overlay ── */}
      {isRoundEnd && (
        <LLRoundResult
          state={llGame}
          myId={playerId}
          isHost={isHost}
          onNextRound={() => { playClick(); llNextRound(); }}
          onReturnToHub={() => { playClick(); returnToHub(); }}
        />
      )}

      {/* Chat */}
      <Chat messages={chatMessages} myId={playerId} />

      {/* Modal règles */}
      <AnimatePresence>
        {showRules && <LoveLetterRulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
