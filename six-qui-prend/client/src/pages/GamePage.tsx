import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import GameRow from '../components/GameRow';
import PlayerHand from '../components/PlayerHand';
import Scoreboard from '../components/Scoreboard';
import Chat from '../components/Chat';
import RoundResultOverlay from '../components/RoundResultOverlay';
import RowSelector from '../components/RowSelector';
import RulesModal from '../components/RulesModal';
import { playGameStart, playClick } from '../utils/sounds';

export default function GamePage() {
  const {
    game, playerId, chatMessages, lastRoundResult,
    selectedCardNumber, choosingRow, chooseRowCard,
    selectCard, playCard, chooseRow,
  } = useGameStore();

  const [showRules, setShowRules] = useState(false);

  useEffect(() => { playGameStart(); }, []);

  if (!game) return null;

  const me = game.players.find((p) => p.id === playerId);
  const playerNames = Object.fromEntries(game.players.map((p) => [p.id, p.name]));
  const waitingCount = game.players.filter((p) => !p.hasPlayed).length;
  const allPlayersCount = game.players.length;

  return (
    <div className="min-h-dvh flex flex-col p-3 gap-3 max-w-5xl mx-auto">

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 pt-1"
      >
        {/* Logo vache animée */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          className="text-3xl shrink-0"
        >
          🐄
        </motion.div>

        <div>
          <h1 className="title-fredoka text-2xl leading-none" style={{
            background: 'linear-gradient(135deg, #fbbf24, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            6 qui prend!
          </h1>
          <p className="text-xs font-nunito font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>
            🌾 Manche {game.round} sur {game.totalRounds}
          </p>
        </div>

        {/* Bouton règles */}
        <motion.button
          whileHover={{ scale: 1.12, rotate: 12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { playClick(); setShowRules(true); }}
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2"
          style={{ background: 'rgba(59,130,246,0.2)', borderColor: 'rgba(96,165,250,0.5)', color: '#93c5fd' }}
          title="Règles du jeu"
        >
          📖
        </motion.button>

        {/* Phase indicator */}
        <motion.div
          key={`${game.phase}-${me?.hasPlayed}`}
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ml-auto"
        >
          {game.phase === 'playing' && !me?.hasPlayed && (
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
                boxShadow: ['0 0 8px rgba(251,191,36,0.2)', '0 0 22px rgba(251,191,36,0.7)', '0 0 8px rgba(251,191,36,0.2)'],
              }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="px-4 py-2 rounded-full text-sm font-black font-nunito text-black flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
            >
              🐄 À vous de jouer !
            </motion.div>
          )}
          {game.phase === 'playing' && me?.hasPlayed && (
            <div className="px-4 py-2 rounded-full text-sm font-black font-nunito flex items-center gap-1.5"
              style={{ background: 'rgba(20,83,45,0.6)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' }}>
              ✅ En attente ({waitingCount}/{allPlayersCount})
            </div>
          )}
          {game.phase === 'row_selection' && (
            <motion.div
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 0.65, repeat: Infinity }}
              className="px-4 py-2 rounded-full text-sm font-black font-nunito flex items-center gap-1.5"
              style={{ background: 'rgba(120,53,15,0.6)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.4)' }}
            >
              🐄 Choix d'un enclos…
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Main layout ── */}
      <div className="flex flex-col lg:flex-row gap-3 flex-1">

        {/* Table de jeu */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Enclos / rangées */}
          <div className="table-felt p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🌾</span>
              <h2 className="text-xs uppercase tracking-widest font-black font-nunito" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Les enclos
              </h2>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-2">
              {game.rows.map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <GameRow index={i} cards={row} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Main du joueur */}
          <PlayerHand
            hand={game.myHand}
            selectedNumber={selectedCardNumber}
            hasPlayed={me?.hasPlayed ?? false}
            phase={game.phase}
            onSelect={(n) => selectCard(n === selectedCardNumber ? null : n)}
            onPlay={playCard}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:w-56 flex flex-col gap-3">
          <Scoreboard
            players={game.players}
            myId={playerId}
            round={game.round}
            totalRounds={game.totalRounds}
          />

          {/* Statut joueurs */}
          <div className="glass-panel p-3">
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-3 font-black font-nunito">
              👥 Joueurs
            </h3>
            <div className="space-y-2">
              {game.players.map((p) => (
                <motion.div key={p.id} layout className="flex items-center gap-2">
                  <motion.span
                    className="text-lg"
                    animate={p.isChoosingRow ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {p.avatar}
                  </motion.span>
                  <span className={`text-xs flex-1 truncate font-bold font-nunito ${p.id === playerId ? 'text-amber-300' : 'text-white/70'}`}>
                    {p.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {p.isChoosingRow && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-yellow-400 text-sm"
                      >⏳</motion.span>
                    )}
                    {p.hasPlayed && !p.isChoosingRow && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-green-500/80 rounded-full flex items-center justify-center text-[10px]"
                      >✓</motion.div>
                    )}
                    {!p.isConnected && <span className="text-red-400 text-xs">✕</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Score perso */}
          <motion.div
            layout
            className="glass-panel p-3 text-center"
          >
            <div className="text-xs uppercase tracking-widest text-white/40 mb-1 font-black font-nunito">
              Vos points
            </div>
            <motion.div
              key={game.myScore}
              initial={{ scale: 1.5, color: '#ef4444' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="text-4xl font-black title-fredoka"
            >
              {game.myScore}
            </motion.div>
            <div className="text-2xl">🐂</div>
          </motion.div>
        </div>
      </div>

      {/* Overlays */}
      {lastRoundResult && (
        <RoundResultOverlay result={lastRoundResult} myId={playerId} playerNames={playerNames} />
      )}
      {choosingRow && chooseRowCard && (
        <RowSelector rows={game.rows} card={chooseRowCard} onSelect={chooseRow} />
      )}

      <Chat messages={chatMessages} myId={playerId} />

      {/* Modal règles */}
      <AnimatePresence>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
