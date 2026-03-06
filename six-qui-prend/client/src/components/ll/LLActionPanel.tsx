import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LLClientGameState, LLClientPlayerSummary } from '@shared/loveLetterTypes';
import { LLCardId, LL_CARD_DEFS, getLLCardDef } from '@shared/loveLetterCards';
import LLCard from './LLCard';

interface LLActionPanelProps {
  state: LLClientGameState;
  myId: string | null;
  onPlay: (cardId: LLCardId, targetId?: string, guess?: LLCardId) => void;
}

export default function LLActionPanel({ state, myId, onPlay }: LLActionPanelProps) {
  const [selectedCard, setSelectedCard] = useState<LLCardId | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<LLCardId | null>(null);
  const [step, setStep] = useState<'pick_card' | 'pick_target' | 'pick_guess'>('pick_card');

  const def = selectedCard ? getLLCardDef(selectedCard) : null;

  const validTargets = state.players.filter(
    (p) => !p.isEliminated && p.id !== myId || (def?.canTargetSelf && p.id === myId)
  ).filter((p) => !p.isEliminated);

  // For guard: all cards except guard
  const guessableCards = LL_CARD_DEFS.filter((c) => c.id !== 'guard');

  const handleCardSelect = (cardId: LLCardId) => {
    setSelectedCard(cardId);
    setSelectedTarget(null);
    setSelectedGuess(null);
    const d = getLLCardDef(cardId);
    if (d.requiresTarget) {
      setStep('pick_target');
    } else {
      setStep('pick_card');
    }
  };

  const handleTargetSelect = (targetId: string) => {
    setSelectedTarget(targetId);
    if (def?.requiresGuess) {
      setStep('pick_guess');
    } else {
      // Play immediately
      onPlay(selectedCard!, targetId, undefined);
      reset();
    }
  };

  const handleGuessSelect = (guess: LLCardId) => {
    onPlay(selectedCard!, selectedTarget ?? undefined, guess);
    reset();
  };

  const handlePlayNoTarget = () => {
    if (!selectedCard) return;
    onPlay(selectedCard, undefined, undefined);
    reset();
  };

  const reset = () => {
    setSelectedCard(null);
    setSelectedTarget(null);
    setSelectedGuess(null);
    setStep('pick_card');
  };

  if (!state.isMyTurn) {
    const current = state.players.find((p) => p.id === state.currentPlayerId);
    return (
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="text-2xl mb-1">⏳</div>
        <p className="font-nunito font-bold text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {current ? `Tour de ${current.name} ${current.avatar}` : 'En attente…'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['pick_card', 'pick_target', 'pick_guess'] as const).map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />}
            <div
              className="text-xs font-bold px-2 py-1 rounded-full font-nunito"
              style={{
                background: step === s ? '#7c3aed' : 'rgba(255,255,255,0.07)',
                color: step === s ? 'white' : 'rgba(255,255,255,0.35)',
              }}
            >
              {s === 'pick_card' ? '1. Choisir une carte' : s === 'pick_target' ? '2. Choisir une cible' : '3. Deviner'}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 1: Pick card ── */}
      <AnimatePresence mode="wait">
        {step === 'pick_card' && (
          <motion.div key="pick_card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-xs font-nunito font-bold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              🃏 Quelle carte voulez-vous jouer ?
            </p>
            <div className="flex gap-3 flex-wrap">
              {state.hand.map((card) => (
                <div key={card.id} className="relative group">
                  <LLCard
                    card={card}
                    selectable
                    selected={selectedCard === card.id}
                    onClick={() => {
                      const d = getLLCardDef(card.id);
                      if (selectedCard === card.id && !d.requiresTarget) {
                        handlePlayNoTarget();
                      } else {
                        handleCardSelect(card.id);
                        if (!d.requiresTarget) handleCardSelect(card.id);
                      }
                    }}
                    showDesc
                  />
                </div>
              ))}
            </div>

            {/* Play button for no-target cards */}
            {selectedCard && !def?.requiresTarget && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePlayNoTarget}
                className="mt-3 btn-primary w-full text-center font-nunito font-black"
              >
                Jouer {def?.emoji} {def?.nameFr}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ── Step 2: Pick target ── */}
        {step === 'pick_target' && (
          <motion.div key="pick_target" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => { setSelectedCard(null); setStep('pick_card'); }}
                className="text-xs font-nunito font-bold px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                ← Retour
              </button>
              <p className="text-xs font-nunito font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                🎯 Qui voulez-vous cibler ?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {validTargets.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTargetSelect(p.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl font-nunito font-bold text-sm"
                  style={{
                    background: selectedTarget === p.id ? '#7c3aed' : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${selectedTarget === p.id ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white',
                    opacity: p.isProtected ? 0.4 : 1,
                  }}
                  disabled={p.isProtected}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name}</span>
                  {p.isProtected && <span className="text-xs opacity-60">(🛡️ protégé)</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Pick guess (Guard) ── */}
        {step === 'pick_guess' && (
          <motion.div key="pick_guess" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setStep('pick_target')}
                className="text-xs font-nunito font-bold px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                ← Retour
              </button>
              <p className="text-xs font-nunito font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                🔮 Quelle carte devinez-vous ?
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {guessableCards.map((c) => (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleGuessSelect(c.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl font-nunito text-xs font-bold"
                  style={{
                    background: c.bg,
                    border: `2px solid ${c.color}66`,
                    color: 'white',
                  }}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span style={{ fontSize: 10 }}>{c.nameFr}</span>
                  <span style={{ fontSize: 9, color: c.color }}>{c.value}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
