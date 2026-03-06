import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import UnoCard from '../components/uno/UnoCard';
import UnoColorPicker from '../components/uno/UnoColorPicker';
import UnoPlayerArea from '../components/uno/UnoPlayerArea';
import UnoRoundResult from '../components/uno/UnoRoundResult';
import Chat from '../components/Chat';
import UnoRulesModal from '../components/UnoRulesModal';
import { UnoClientGameState } from '@shared/unoTypes';
import { UnoCard as UnoCardType, UnoColor, UNO_COLOR_HEX, getCardLabel } from '@shared/unoCards';
import { playClick, playCardSelect, playGameStart, playVictory } from '../utils/sounds';

function trySound(fn: () => void) {
  try { fn(); } catch (_) { /* ignore */ }
}

// ─── Current color indicator ──────────────────────────────────────────────────

function ColorIndicator({ color }: { color: UnoColor }) {
  const hex = UNO_COLOR_HEX[color];
  const labels: Record<UnoColor, string> = {
    red: 'Rouge', blue: 'Bleu', green: 'Vert', yellow: 'Jaune', wild: 'Sauvage',
  };
  return (
    <motion.div
      key={color}
      initial={{ scale: 0.7 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-1"
    >
      <motion.div
        animate={{ boxShadow: [`0 0 10px ${hex}`, `0 0 25px ${hex}`, `0 0 10px ${hex}`] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-8 h-8 rounded-full border-2 border-white/40"
        style={{ background: hex }}
      />
      <span className="text-xs font-bold text-white/70" style={{ fontFamily: 'Nunito, sans-serif' }}>
        {labels[color]}
      </span>
    </motion.div>
  );
}

// ─── Direction indicator ───────────────────────────────────────────────────────

function DirectionBadge({ direction }: { direction: 1 | -1 }) {
  return (
    <motion.div
      animate={{ rotate: direction === 1 ? 0 : 180 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="text-2xl"
      title={direction === 1 ? 'Sens horaire' : 'Sens anti-horaire'}
    >
      🔄
    </motion.div>
  );
}

// ─── Action log ───────────────────────────────────────────────────────────────

function ActionLog({ game }: { game: UnoClientGameState }) {
  const log = game.lastAction;
  if (!log) return null;

  let text = '';
  switch (log.action) {
    case 'play':
    case 'play_drawn':
      text = `${log.playerName} joue ${log.card ? getCardLabel(log.card.value) : '?'}`;
      break;
    case 'draw':
      text = `${log.playerName} pioche`;
      break;
    case 'pass':
      text = `${log.playerName} passe`;
      break;
    case 'uno':
      text = `${log.playerName} crie UNO!`;
      break;
    case 'uno_penalty':
      text = `${log.playerName} prend 2 cartes (oubli UNO)`;
      break;
    case 'color_chosen':
      text = `${log.playerName} choisit ${log.chosenColor ?? '?'}`;
      break;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-xs text-center px-3 py-1 rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UnoPage() {
  const { unoGame, room, playerId, unoPlayCard, unoDrawCard, unoPassTurn, unoChooseColor, unoCallUno, unoNextRound, returnToHub, chatMessages } = useGameStore();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const game = unoGame;
  const myId = playerId ?? '';

  // ── Hooks must come BEFORE any conditional return ──
  useEffect(() => {
    if (game) trySound(playGameStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'game_over' && game.gameWinnerId === myId) {
      trySound(playVictory);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.phase, myId]);

  if (!game) return null;

  const isHost = room?.hostId === myId;
  const isMyTurn = game.isMyTurn;
  const needsColorPick = game.phase === 'color_pick' && game.currentPlayerId === myId;
  const canUno = game.canCallUno;

  const handleCardClick = (cardId: string) => {
    if (!isMyTurn) return;
    if (game.phase === 'awaiting_draw') {
      if (cardId === game.drawnCardId) {
        trySound(playCardSelect);
        setSelectedCardId(cardId);
      }
      return;
    }
    if (!game.playableCardIds.includes(cardId)) return;
    trySound(playCardSelect);
    if (selectedCardId === cardId) {
      // Double-click → confirm play
      handlePlay(cardId);
    } else {
      setSelectedCardId(cardId);
    }
  };

  const handlePlay = (cardId: string) => {
    if (!cardId) return;
    trySound(playClick);
    unoPlayCard(cardId);
    setSelectedCardId(null);
  };

  const handleConfirmPlay = () => {
    if (selectedCardId) handlePlay(selectedCardId);
  };

  const handleDraw = () => {
    if (!isMyTurn || game.phase !== 'playing') return;
    trySound(playClick);
    unoDrawCard();
    setSelectedCardId(null);
  };

  const handlePass = () => {
    if (game.phase !== 'awaiting_draw') return;
    trySound(playClick);
    unoPassTurn();
    setSelectedCardId(null);
  };

  const handleColorPick = (color: UnoColor) => {
    unoChooseColor(color);
  };

  const handleCallUno = () => {
    trySound(playClick);
    unoCallUno(myId); // Call UNO for yourself
  };

  // Opponents = everyone except me
  const opponents = game.players.filter((p) => p.id !== myId);
  const me = game.players.find((p) => p.id === myId);

  const topCard = game.topCard;
  const colorBg = UNO_COLOR_HEX[game.currentColor];

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: '#07080c' }}>

      {/* ── Color picker overlay ── */}
      <UnoColorPicker visible={needsColorPick} onChoose={handleColorPick} />

      {/* ── Round/Game result overlay ── */}
      <UnoRoundResult
        game={game}
        isHost={isHost}
        onNextRound={() => unoNextRound()}
        onReturnToHub={() => returnToHub()}
      />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 z-10 relative">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-2xl"
          >
            🃏
          </motion.div>
          <span className="font-black text-white text-xl" style={{ fontFamily: 'Fredoka One, cursive' }}>UNO</span>
          <div className="text-xs px-2 py-0.5 rounded-full font-bold text-white/60"
            style={{ background: 'rgba(255,255,255,0.08)', fontFamily: 'Nunito, sans-serif' }}>
            Manche {game.roundNumber}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DirectionBadge direction={game.direction} />
          <ColorIndicator color={game.currentColor} />
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { trySound(playClick); setShowRules(true); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ background: 'rgba(249,115,22,0.2)', border: '2px solid rgba(249,115,22,0.4)', color: '#f97316' }}
            title="Règles du jeu"
          >
            📖
          </motion.button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="text-white/60 hover:text-white text-xl transition-colors p-1"
          >
            💬
          </button>
          <button
            onClick={returnToHub}
            className="text-white/40 hover:text-white text-sm transition-colors px-2 py-1 rounded-lg"
            style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Opponents ── */}
      <div className="flex justify-center gap-6 px-4 py-3 flex-wrap z-10 relative">
        {opponents.map((opp) => (
          <UnoPlayerArea key={opp.id} player={opp} />
        ))}
      </div>

      {/* ── Center table ── */}
      <div className="flex-1 flex items-center justify-center gap-8 relative z-10 px-4">

        {/* Draw pile */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            onClick={handleDraw}
            whileHover={isMyTurn && game.phase === 'playing' ? { y: -6, scale: 1.05 } : {}}
            whileTap={isMyTurn && game.phase === 'playing' ? { scale: 0.95 } : {}}
            className="relative"
            style={{ cursor: isMyTurn && game.phase === 'playing' ? 'pointer' : 'default' }}
          >
            {/* Stack effect */}
            {[3, 2, 1].map((offset) => (
              <div key={offset} className="absolute rounded-xl"
                style={{
                  width: 72, height: 104,
                  top: -offset * 2, left: offset,
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  border: '2px solid rgba(255,255,255,0.12)',
                  zIndex: 10 - offset,
                }} />
            ))}
            <div className="relative z-10 w-[72px] h-[104px] rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                border: isMyTurn && game.phase === 'playing'
                  ? '3px solid rgba(255,255,255,0.5)'
                  : '2px solid rgba(255,255,255,0.2)',
                boxShadow: isMyTurn && game.phase === 'playing'
                  ? '0 0 20px rgba(167,139,250,0.4)'
                  : '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <span className="font-black text-white/70 text-xl" style={{ fontFamily: 'Fredoka One, cursive' }}>
                +{game.deckSize}
              </span>
            </div>
          </motion.div>
          <span className="text-xs text-white/50 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Piocher
          </span>
          {isMyTurn && game.phase === 'playing' && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-xs text-purple-300 font-bold"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              ← Cliquer pour piocher
            </motion.span>
          )}
        </div>

        {/* Center info */}
        <div className="flex flex-col items-center gap-2">
          <ActionLog game={game} />

          {/* Discard pile */}
          <div className="relative">
            <motion.div
              key={topCard.id}
              initial={{ scale: 0.8, rotate: -10, y: -20 }}
              animate={{ scale: 1, rotate: Math.random() * 16 - 8, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <UnoCard card={topCard} size="lg" animate={false} />
            </motion.div>

            {/* Color overlay for wild */}
            {(topCard.value === 'wild' || topCard.value === 'wild_draw_four') && game.currentColor !== 'wild' && (
              <motion.div
                key={game.currentColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full border-3 border-white shadow-lg z-20"
                style={{ background: colorBg, border: '3px solid white', boxShadow: `0 0 12px ${colorBg}` }}
              />
            )}
          </div>

          {/* Turn indicator */}
          {isMyTurn && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-3 py-1 rounded-full text-sm font-black"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #f97316)',
                color: 'white',
                fontFamily: 'Fredoka One, cursive',
                boxShadow: '0 0 16px rgba(220,38,38,0.5)',
              }}
            >
              ⚡ Votre tour !
            </motion.div>
          )}

          {!isMyTurn && (
            <div className="text-sm text-white/50 font-bold text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Tour de {game.players.find((p) => p.id === game.currentPlayerId)?.name ?? '?'}
            </div>
          )}
        </div>

        {/* Pass button (during awaiting_draw) */}
        {isMyTurn && game.phase === 'awaiting_draw' && (
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.94 }}
              onClick={handlePass}
              className="px-4 py-3 rounded-2xl font-black text-white"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                fontFamily: 'Fredoka One, cursive',
              }}
            >
              ⏭ Passer
            </motion.button>
            <span className="text-xs text-white/40" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Garder la carte
            </span>
          </div>
        )}
      </div>

      {/* ── My hand ── */}
      <div className="relative z-10 pb-4 px-2">
        {/* My info bar */}
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{me?.avatar ?? '🎴'}</span>
            <span className="font-black text-white" style={{ fontFamily: 'Fredoka One, cursive' }}>
              {me?.name ?? 'Moi'}
            </span>
            <span className="text-sm text-white/50 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
              — {me?.score ?? 0} pts
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* UNO call button */}
            <AnimatePresence>
              {canUno && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.8 }}
                  onClick={handleCallUno}
                  className="px-4 py-2 rounded-full font-black text-white text-lg"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #dc2626)',
                    boxShadow: '0 0 20px rgba(220,38,38,0.8)',
                    fontFamily: 'Fredoka One, cursive',
                    border: '3px solid white',
                  }}
                >
                  UNO!
                </motion.button>
              )}
            </AnimatePresence>

            {/* Catch other players missing UNO */}
            {game.players
              .filter((p) => p.id !== myId && p.handSize === 1 && !p.hasCalledUno)
              .map((p) => (
                <motion.button
                  key={p.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => unoCallUno(p.id)}
                  className="px-3 py-1.5 rounded-full font-black text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    fontFamily: 'Fredoka One, cursive',
                    boxShadow: '0 0 12px rgba(124,58,237,0.6)',
                  }}
                >
                  🎯 UNO! ({p.name})
                </motion.button>
              ))
            }

            {/* Play selected card */}
            {selectedCardId && isMyTurn && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleConfirmPlay}
                className="px-4 py-2 rounded-2xl font-black text-white text-base"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                  fontFamily: 'Fredoka One, cursive',
                }}
              >
                ▶ Jouer
              </motion.button>
            )}
          </div>
        </div>

        {/* Hand */}
        <div
          className="flex items-end justify-center gap-1 flex-wrap px-2 pb-2"
          style={{ minHeight: 120 }}
        >
          {game.hand.map((card) => {
            const isPlayable = game.playableCardIds.includes(card.id);
            const isSelected = selectedCardId === card.id;
            const isDimmed = isMyTurn && !isPlayable && game.phase === 'playing';

            return (
              <motion.div
                key={card.id}
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <UnoCard
                  card={card}
                  size="md"
                  playable={isPlayable}
                  selected={isSelected}
                  onClick={() => handleCardClick(card.id)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Instruction hint */}
        {isMyTurn && game.phase === 'playing' && !selectedCardId && (
          <p className="text-center text-xs text-white/40 mt-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {game.playableCardIds.length > 0
              ? '💡 Cliquez une carte pour la sélectionner, re-cliquez pour la jouer'
              : '💡 Aucune carte jouable — pioche à gauche'}
          </p>
        )}
        {selectedCardId && isMyTurn && (
          <p className="text-center text-xs text-green-400 mt-1" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700 }}>
            ✅ Carte sélectionnée — cliquez "Jouer" ou re-cliquez la carte
          </p>
        )}
      </div>

      {/* ── Chat ── */}
      {showChat && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed right-0 top-0 bottom-0 w-72 z-40 flex flex-col"
          style={{ background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
        >
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
        {showRules && <UnoRulesModal onClose={() => setShowRules(false)} />}
      </AnimatePresence>
    </div>
  );
}
