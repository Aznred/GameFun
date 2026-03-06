import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import WlDial, { OtherGuess } from '../components/wavelength/WlDial';
import Chat from '../components/Chat';
import WavelengthRulesModal from '../components/WavelengthRulesModal';
import { WlClientState } from '@shared/wavelengthTypes';
import { playClick, playGameStart, playVictory, playCardSelect } from '../utils/sounds';

function trySound(fn: () => void) { try { fn(); } catch (_) {} }

// Palette de couleurs pour les joueurs
const PLAYER_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#06b6d4', '#eab308', '#ec4899', '#84cc16', '#f59e0b', '#8b5cf6', '#10b981'];

// ─── Scoreboard ───────────────────────────────────────────────────────────────

function Scoreboard({ game, myId }: { game: WlClientState; myId: string }) {
  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {sorted.map((p, i) => {
        const color = PLAYER_COLORS[game.players.findIndex((x) => x.id === p.id) % PLAYER_COLORS.length];
        return (
          <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-black"
            style={{
              background: p.id === myId ? color + '33' : 'rgba(255,255,255,0.07)',
              border: `1.5px solid ${p.id === myId ? color : 'rgba(255,255,255,0.1)'}`,
              color: 'white',
              fontFamily: 'Fredoka One, cursive',
            }}>
            <span style={{ color }}>{i === 0 ? '👑' : `#${i + 1}`}</span>
            {p.avatar} {p.name}
            <span style={{ color }}>{p.score} pts</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Round result overlay ─────────────────────────────────────────────────────

function RoundResult({ game, myId, isHost, onNext, onHub }: {
  game: WlClientState; myId: string; isHost: boolean;
  onNext: () => void; onHub: () => void;
}) {
  const result = game.lastRoundResult;
  const isVisible = (game.phase === 'reveal' || game.phase === 'game_over') && result;
  if (!isVisible) return null;

  const isGameOver = game.phase === 'game_over';
  const myPoints = result.points[myId] ?? 0;
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <motion.div
        initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="rounded-3xl p-6 w-full max-w-sm mx-4 text-center"
        style={{ background: '#0f172a', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}
      >
        <div className="text-5xl mb-2">
          {isGameOver ? '🏆' : myPoints === 4 ? '🎯' : myPoints >= 2 ? '👍' : '😅'}
        </div>
        <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Fredoka One, cursive' }}>
          {isGameOver ? 'Partie terminée !' : `Manche ${game.roundNumber}/${game.totalRounds}`}
        </h2>

        <p className="text-sm text-white/50 mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Indice : <strong className="text-white">"{result.clue}"</strong>
        </p>
        <p className="text-xs text-white/40 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Cible était à <strong className="text-amber-300">{result.targetPosition}%</strong>
        </p>

        {/* Points this round */}
        <div className="space-y-1.5 mb-5 text-left">
          {sortedPlayers.map((p) => {
            const pts = result.points[p.id] ?? null;
            const guess = result.guesses[p.id] ?? null;
            const colorIdx = game.players.findIndex((x) => x.id === p.id) % PLAYER_COLORS.length;
            const color = PLAYER_COLORS[colorIdx];
            const isPsychic = p.id === result.psychicId;
            return (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: p.id === myId ? color + '22' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.id === myId ? color + '55' : 'rgba(255,255,255,0.07)'}` }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{p.avatar}</span>
                  <span className="font-bold text-sm text-white truncate max-w-[80px]" style={{ fontFamily: 'Fredoka One, cursive' }}>{p.name}</span>
                  {isPsychic && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#7c3aed22', color: '#a855f7', fontFamily: 'Nunito, sans-serif' }}>🔮 psychique</span>}
                </div>
                <div className="text-right">
                  {!isPsychic && pts !== null ? (
                    <>
                      <span className="font-black text-sm" style={{ color: pts >= 3 ? '#22c55e' : pts >= 1 ? '#f59e0b' : '#94a3b8', fontFamily: 'Fredoka One, cursive' }}>
                        +{pts} pt{pts !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-white/30 ml-1" style={{ fontFamily: 'Nunito, sans-serif' }}>({guess}%)</span>
                    </>
                  ) : (
                    <span className="text-xs text-white/30" style={{ fontFamily: 'Nunito, sans-serif' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner on game over */}
        {isGameOver && game.winnerIds.length > 0 && (
          <div className="mb-4 py-2 px-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.15)', border: '1.5px solid rgba(251,191,36,0.4)' }}>
            <p className="font-black text-amber-300 text-base" style={{ fontFamily: 'Fredoka One, cursive' }}>
              🏆 {game.winnerIds.length === 1
                ? `${game.players.find((p) => p.id === game.winnerIds[0])?.name} gagne !`
                : 'Égalité !'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!isGameOver && isHost && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={onNext}
              className="flex-1 py-3 rounded-2xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', fontFamily: 'Fredoka One, cursive', boxShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>
              ▶ Suite
            </motion.button>
          )}
          {!isGameOver && !isHost && (
            <div className="flex-1 py-3 text-center text-white/40 text-sm font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Attente de l'hôte…
            </div>
          )}
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onHub}
            className="flex-1 py-3 rounded-2xl font-black text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Fredoka One, cursive', border: '1px solid rgba(255,255,255,0.12)' }}>
            🏠 Hub
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WavelengthPage() {
  const {
    wlGame: game, room, playerId, chatMessages,
    wlSubmitClue, wlSubmitGuess, wlNextRound, returnToHub,
  } = useGameStore();

  const [clueInput, setClueInput] = useState('');
  const [localDial, setLocalDial] = useState(50);
  const [showChat, setShowChat] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const myId = playerId ?? '';

  // ── Hooks must come BEFORE any conditional return ──
  useEffect(() => {
    if (game) trySound(playGameStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'game_over' && game.winnerIds.includes(myId)) trySound(playVictory);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.phase, myId]);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'psychic_clue') setLocalDial(50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.roundNumber]);

  if (!game) return null;

  const isHost = room?.hostId === myId;
  const myPlayer = game.players.find((p) => p.id === myId);
  const myColorIdx = game.players.findIndex((p) => p.id === myId) % PLAYER_COLORS.length;

  const handleSubmitClue = () => {
    if (!clueInput.trim()) return;
    trySound(playClick);
    wlSubmitClue(clueInput.trim());
    setClueInput('');
  };

  const handleSubmitGuess = () => {
    trySound(playClick);
    wlSubmitGuess(localDial);
  };

  // Build other guesses for reveal
  const otherGuesses: OtherGuess[] = [];
  if (game.phase === 'reveal' || game.phase === 'game_over') {
    const result = game.lastRoundResult;
    if (result) {
      game.players.forEach((p, i) => {
        if (p.id === myId || p.id === result.psychicId) return;
        if (result.guesses[p.id] != null) {
          otherGuesses.push({
            playerId: p.id,
            name: p.name,
            position: result.guesses[p.id],
            color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          });
        }
      });
    }
  }

  const showReveal = game.phase === 'reveal' || game.phase === 'game_over';

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: '#07080c' }}>

      {/* Result overlay */}
      <AnimatePresence>
        {showReveal && (
          <RoundResult
            game={game} myId={myId} isHost={isHost}
            onNext={() => { trySound(playClick); wlNextRound(); }}
            onHub={() => returnToHub()}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 z-10 relative shrink-0">
        <div className="flex items-center gap-2">
          <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }} className="text-2xl">
            🌊
          </motion.span>
          <span className="font-black text-white text-xl" style={{ fontFamily: 'Fredoka One, cursive' }}>Wavelength</span>
          <div className="text-xs px-2 py-0.5 rounded-full font-bold text-white/50"
            style={{ background: 'rgba(255,255,255,0.08)', fontFamily: 'Nunito, sans-serif' }}>
            {game.roundNumber}/{game.totalRounds}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { trySound(playClick); setShowRules(true); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: 'rgba(168,85,247,0.2)', border: '2px solid rgba(168,85,247,0.4)', color: '#c084fc' }}
            title="Règles du jeu"
          >
            📖
          </motion.button>
          <button onClick={() => setShowChat(!showChat)} className="text-white/50 hover:text-white text-xl p-1">💬</button>
          <button onClick={returnToHub} className="text-white/30 hover:text-white text-sm px-2 py-1 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>✕</button>
        </div>
      </div>

      {/* ── Scoreboard ── */}
      <div className="px-4 mb-2 z-10 relative shrink-0">
        <Scoreboard game={game} myId={myId} />
      </div>

      {/* ── Main game area ── */}
      <div className="flex-1 flex flex-col items-center px-3 pb-4 z-10 relative min-h-0">

        {/* Spectrum banner */}
        {game.spectrum && (
          <motion.div key={game.spectrum.left} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mb-3 shrink-0">
            <div className="rounded-2xl px-5 py-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-blue-300 shrink-0" style={{ fontFamily: 'Fredoka One, cursive' }}>
                  {game.spectrum.left}
                </span>
                <div className="flex-1 h-2 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, rgba(255,255,255,0.15) 50%, #ef4444)' }} />
                <span className="text-lg font-black text-red-300 shrink-0" style={{ fontFamily: 'Fredoka One, cursive' }}>
                  {game.spectrum.right}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Psychic + round info */}
        <div className="flex items-center gap-3 mb-3 shrink-0 flex-wrap justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: '#7c3aed22', border: '1.5px solid #a855f7', color: '#c084fc', fontFamily: 'Nunito, sans-serif' }}>
            🔮 Psychique : <span className="text-white font-black">{game.psychicName}</span>
          </div>
          {game.phase === 'player_guess' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito, sans-serif', border: '1px solid rgba(255,255,255,0.1)' }}>
              ✅ {game.submittedCount}/{game.totalGuessers} réponses
            </div>
          )}
        </div>

        {/* The Dial */}
        <div className="w-full max-w-xl shrink-0">
          <WlDial
            spectrum={game.spectrum}
            myPosition={showReveal
              ? (game.lastRoundResult?.guesses[myId] ?? localDial)
              : localDial}
            targetPosition={game.amIPsychic ? game.targetPosition : null}
            revealTarget={showReveal ? game.lastRoundResult?.targetPosition ?? null : null}
            otherGuesses={otherGuesses}
            interactive={game.phase === 'player_guess' && !game.amIPsychic && !game.hasSubmitted}
            onDial={(p) => {
              setLocalDial(p);
              trySound(playCardSelect);
            }}
          />
        </div>

        {/* Phase actions */}
        <AnimatePresence mode="wait">

          {/* Psychic: submit clue */}
          {game.phase === 'psychic_clue' && game.amIPsychic && (
            <motion.div key="clue-input"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-xl mt-3">
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(124,58,237,0.15)', border: '2px solid #a855f7' }}>
                <p className="text-purple-300 text-sm font-bold mb-3 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  🔮 Vous êtes le Psychique ! La cible est à {Math.round(game.targetPosition ?? 50)}%.
                  <br />Donnez un indice en un seul mot.
                </p>
                <div className="flex gap-2">
                  <input
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitClue()}
                    placeholder="Votre indice…"
                    maxLength={40}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(167,139,250,0.5)', outline: 'none', fontFamily: 'Nunito, sans-serif', fontSize: 16 }}
                    autoFocus
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitClue} disabled={!clueInput.trim()}
                    className="px-5 py-3 rounded-xl font-black text-white"
                    style={{
                      background: clueInput.trim() ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.1)',
                      fontFamily: 'Fredoka One, cursive',
                      opacity: clueInput.trim() ? 1 : 0.5,
                    }}>
                    Soumettre
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Waiting for psychic */}
          {game.phase === 'psychic_clue' && !game.amIPsychic && (
            <motion.div key="wait-psychic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-3 text-center">
              <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white/50 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                🔮 {game.psychicName} réfléchit à son indice…
              </motion.p>
            </motion.div>
          )}

          {/* Player guessing */}
          {game.phase === 'player_guess' && (
            <motion.div key="guessing"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-xl mt-3">

              {/* Clue display */}
              <div className="text-center mb-4">
                <p className="text-white/40 text-xs mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>Indice du psychique</p>
                <motion.p initial={{ scale: 0.85 }} animate={{ scale: 1 }}
                  className="text-3xl font-black text-white" style={{ fontFamily: 'Fredoka One, cursive', textShadow: '0 0 20px rgba(167,139,250,0.6)' }}>
                  "{game.clue}"
                </motion.p>
              </div>

              {!game.amIPsychic && !game.hasSubmitted ? (
                <div className="text-center">
                  <p className="text-white/50 text-sm mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    🎯 Tournez le cadran puis confirmez votre réponse
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-lg font-black text-white/60" style={{ fontFamily: 'Fredoka One, cursive' }}>
                      Position : <span className="text-white">{localDial}%</span>
                    </div>
                    <motion.button whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                      onClick={handleSubmitGuess}
                      className="px-6 py-3 rounded-2xl font-black text-white"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        fontFamily: 'Fredoka One, cursive',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.3), 0 8px 20px rgba(124,58,237,0.4)',
                      }}>
                      ✅ Confirmer
                    </motion.button>
                  </div>
                </div>
              ) : game.amIPsychic ? (
                <p className="text-center text-white/40 text-sm font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  🤐 Vous êtes le psychique — attendez les réponses…
                </p>
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="text-center py-3 px-6 rounded-2xl"
                  style={{ background: '#22c55e22', border: '1.5px solid #22c55e44' }}>
                  <p className="text-green-400 font-black text-base" style={{ fontFamily: 'Fredoka One, cursive' }}>
                    ✅ Réponse envoyée à {localDial}%
                  </p>
                  <p className="text-white/40 text-xs mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    En attente de {game.totalGuessers - game.submittedCount} autre{game.totalGuessers - game.submittedCount > 1 ? 's' : ''} joueur{game.totalGuessers - game.submittedCount > 1 ? 's' : ''}…
                  </p>
                </motion.div>
              )}

              {/* Host: force reveal */}
              {isHost && game.submittedCount < game.totalGuessers && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => { trySound(playClick); wlNextRound(); }}
                    className="text-xs text-white/30 hover:text-white/60 underline transition-colors"
                    style={{ fontFamily: 'Nunito, sans-serif' }}>
                    Forcer la révélation
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat */}
      {showChat && (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="fixed right-0 top-0 bottom-0 w-72 z-40 flex flex-col"
          style={{ background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <span className="font-black text-white" style={{ fontFamily: 'Fredoka One, cursive' }}>💬 Chat</span>
            <button onClick={() => setShowChat(false)} className="text-white/50 hover:text-white text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chat messages={chatMessages} myId={myId} />
          </div>
        </motion.div>
      )}

      {/* Modal règles */}
      <AnimatePresence>
        {showRules && <WavelengthRulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
