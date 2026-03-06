import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { EKClientState } from '@shared/ekTypes';
import { EKCard as EKCardData, EK_CARD_COLORS, EK_CARD_EMOJIS, EK_CARD_LABELS, isCatCard } from '@shared/ekCards';
import EKCard, { EKCardBack } from '../components/ek/EKCard';
import EKRulesModal from '../components/ek/EKRulesModal';
import { playClick, playVictory, playGameStart } from '../utils/sounds';

// ─── Types & helpers ──────────────────────────────────────────────────────────

type Overlay =
  | null
  | 'see_future'
  | 'insert_kitten'
  | 'select_target'
  | 'favor_give'
  | 'game_over'
  | 'rules';

function NopeBar({ game, onNope, nopeCard }: {
  game: EKClientState;
  onNope: (cardId: string) => void;
  nopeCard: EKCardData | null;
}) {
  const [timeLeft, setTimeLeft] = useState(100);
  const [seq, setSeq] = useState(game.nopeWindowSeq);

  useEffect(() => {
    if (game.phase !== 'nope_window') return;
    // Reset on new nope window
    setTimeLeft(100);
    setSeq(game.nopeWindowSeq);
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 100 / 30));
    }, 100);
    return () => clearInterval(interval);
  }, [game.nopeWindowSeq, game.phase]);

  if (game.phase !== 'nope_window') return null;

  const pendingCard = game.pendingCard;
  const color = pendingCard ? EK_CARD_COLORS[pendingCard.type] : '#f97316';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#1a1f2e',
        borderBottom: '2px solid rgba(255,255,255,0.1)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
          Carte jouée par <strong style={{ color: '#fff' }}>{game.pendingCardPlayerName}</strong>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color }}>
          {pendingCard ? `${EK_CARD_EMOJIS[pendingCard.type]} ${EK_CARD_LABELS[pendingCard.type]}` : ''}
          {game.nopeCount % 2 === 1 && (
            <span style={{ marginLeft: 8, color: '#dc2626', fontSize: 12 }}>🚫 NOPÉ</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: 120 }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${timeLeft}%`,
            background: color,
            transition: 'width 0.1s linear',
            borderRadius: 2,
          }} />
        </div>
      </div>

      {game.canPlayNope && nopeCard && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); onNope(nopeCard.id); }}
          style={{
            background: '#dc2626',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          🚫 NOPE !
        </motion.button>
      )}
    </motion.div>
  );
}

function PlayerBadge({ player, isCurrentPlayer, isMe }: {
  player: EKClientState['players'][0];
  isCurrentPlayer: boolean;
  isMe: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      opacity: player.isAlive ? 1 : 0.3,
      position: 'relative',
    }}>
      {isCurrentPlayer && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: -8, left: '50%', transform: 'translateX(-50%)',
            width: 8, height: 8,
            borderRadius: '50%',
            background: '#22c55e',
          }}
        />
      )}
      <div style={{
        width: 44, height: 44,
        borderRadius: 8,
        background: '#1a1f2e',
        border: `2px solid ${isCurrentPlayer ? '#22c55e' : isMe ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        position: 'relative',
      }}>
        {player.avatar}
        {!player.isAlive && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>💀</div>
        )}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 60 }}>
        {player.name}
      </div>
      <div style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        padding: '1px 6px',
      }}>
        {player.handSize} 🃏
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ExplodingKittensPage() {
  const game = useGameStore((s) => s.ekGame);
  const myId = useGameStore((s) => s.playerId);
  const {
    ekPlayCard, ekPlayPair, ekPlayNope, ekDrawCard,
    ekSelectTarget, ekFavorGive, ekInsertKitten,
  } = useGameStore();

  const [overlay, setOverlay] = useState<Overlay>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [insertPosition, setInsertPosition] = useState<number>(0);
  const [pairMode, setPairMode] = useState(false);
  const gameStartedRef = useRef(false);

  useEffect(() => {
    if (game && !gameStartedRef.current) {
      gameStartedRef.current = true;
      playGameStart();
    }
  }, [game]);

  useEffect(() => {
    if (game?.phase === 'game_over' && overlay !== 'game_over') {
      setTimeout(() => setOverlay('game_over'), 500);
      playVictory();
    }
  }, [game?.phase]);

  // Auto-open overlays based on phase
  useEffect(() => {
    if (!game) return;
    if (game.seeTheFutureCards && game.seeTheFutureCards.length > 0 && overlay !== 'see_future') {
      setOverlay('see_future');
    }
    if (game.phase === 'awaiting_insert' && game.isMyTurn && overlay !== 'insert_kitten') {
      setInsertPosition(0);
      setOverlay('insert_kitten');
    }
    if (game.isSelectingTarget && overlay !== 'select_target') {
      setOverlay('select_target');
    }
    if (game.isAwaitingMyFavorGive && overlay !== 'favor_give') {
      setOverlay('favor_give');
    }
  }, [game?.phase, game?.seeTheFutureCards?.length, game?.isSelectingTarget, game?.isAwaitingMyFavorGive]);

  const handleCardClick = useCallback((card: EKCardData) => {
    if (!game?.isMyTurn || game.phase !== 'playing') return;

    if (pairMode) {
      if (selectedCards.length === 0) {
        setSelectedCards([card.id]);
      } else if (selectedCards.length === 1) {
        const firstCard = game.myHand.find((c) => c.id === selectedCards[0]);
        if (firstCard && firstCard.type === card.type && card.id !== selectedCards[0]) {
          ekPlayPair(selectedCards[0], card.id);
          setSelectedCards([]);
          setPairMode(false);
        } else {
          setSelectedCards([card.id]);
        }
      }
      return;
    }

    if (card.type === 'exploding_kitten' || card.type === 'defuse') return;
    if (isCatCard(card.type)) {
      setPairMode(true);
      setSelectedCards([card.id]);
      return;
    }
    if (card.type === 'nope') return;

    playClick();
    ekPlayCard(card.id);
  }, [game, pairMode, selectedCards, ekPlayCard, ekPlayPair]);

  const cancelPairMode = useCallback(() => {
    setPairMode(false);
    setSelectedCards([]);
  }, []);

  if (!game) return null;

  const me = game.players.find((p) => p.id === myId);
  const others = game.players.filter((p) => p.id !== myId);
  const nopeCard = game.myHand.find((c) => c.type === 'nope') ?? null;
  const myCurrentCard = selectedCards[0] ? game.myHand.find((c) => c.id === selectedCards[0]) : null;

  const pendingCardColor = game.pendingCard ? EK_CARD_COLORS[game.pendingCard.type] : '#fff';

  return (
    <div style={{ minHeight: '100dvh', background: '#07080c', display: 'flex', flexDirection: 'column' }}>
      {/* Nope window bar */}
      <AnimatePresence>
        {game.phase === 'nope_window' && (
          <NopeBar game={game} onNope={(id) => ekPlayNope(id)} nopeCard={nopeCard} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginTop: game.phase === 'nope_window' ? 56 : 0,
        transition: 'margin-top 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>💣</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Exploding Kittens
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {game.players.filter((p) => p.isAlive).length} joueur{game.players.filter((p) => p.isAlive).length > 1 ? 's' : ''} en vie
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 300, fontStyle: 'italic' }}>
          {game.lastAction}
        </div>

        <button
          onClick={() => setOverlay('rules')}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          RÈGLES
        </button>
      </div>

      {/* Other players row */}
      <div style={{
        display: 'flex',
        gap: 16,
        padding: '16px 20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {others.map((p) => (
          <PlayerBadge
            key={p.id}
            player={p}
            isCurrentPlayer={game.currentPlayerId === p.id}
            isMe={false}
          />
        ))}
      </div>

      {/* Center — deck + discard */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 }}>

        {/* Phase-specific hints */}
        <AnimatePresence mode="wait">
          {game.isMyTurn && game.phase === 'playing' && (
            <motion.div
              key="myturn"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 6,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 700,
                color: '#22c55e',
                letterSpacing: '0.05em',
              }}
            >
              C'est votre tour ! {game.turnsRemaining > 1 ? `(${game.turnsRemaining} pioche${game.turnsRemaining > 1 ? 's' : ''} restante${game.turnsRemaining > 1 ? 's' : ''})` : ''}
              {pairMode && ' — Choisissez la 2e carte chat'}
            </motion.div>
          )}
          {game.phase === 'awaiting_insert' && game.currentPlayerId === myId && (
            <motion.div
              key="insert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: 6,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 700,
                color: '#ef4444',
              }}
            >
              💣 Choisissez où remettre le Chaton Explosif dans le deck
            </motion.div>
          )}
          {game.isAwaitingMyFavorGive && (
            <motion.div
              key="favor"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(236,72,153,0.1)',
                border: '1px solid rgba(236,72,153,0.4)',
                borderRadius: 6,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 700,
                color: '#ec4899',
              }}
            >
              🙏 Choisissez une carte à donner à {game.pendingCardPlayerName}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deck and discard */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {/* Draw pile */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pioche
            </div>
            <motion.div
              whileHover={game.canDrawCard ? { scale: 1.05 } : undefined}
              whileTap={game.canDrawCard ? { scale: 0.95 } : undefined}
              onClick={() => {
                if (!game.canDrawCard) return;
                playClick();
                ekDrawCard();
              }}
              style={{ cursor: game.canDrawCard ? 'pointer' : 'default' }}
            >
              <EKCardBack />
            </motion.div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {game.deckSize} carte{game.deckSize !== 1 ? 's' : ''}
            </div>
            {game.canDrawCard && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { playClick(); ekDrawCard(); }}
                style={{
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#000',
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                }}
              >
                PIOCHER
              </motion.button>
            )}
          </div>

          {/* Discard pile */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Défausse
            </div>
            {game.topDiscard ? (
              <EKCard card={game.topDiscard} showTooltip={false} />
            ) : (
              <div style={{
                width: 90, height: 130,
                borderRadius: 8,
                border: '2px dashed rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.2)',
                fontSize: 24,
              }}>
                —
              </div>
            )}
          </div>
        </div>

        {/* Me indicator */}
        {me && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 22, width: 36, height: 36,
              borderRadius: 6,
              background: '#1a1f2e',
              border: `2px solid ${game.isMyTurn ? '#22c55e' : '#3b82f6'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {me.avatar}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {me.name} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>(vous)</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {game.myHand.length} carte{game.myHand.length !== 1 ? 's' : ''} en main
              </div>
            </div>
          </div>
        )}
      </div>

      {/* My hand */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.02)',
      }}>
        {pairMode && (
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
              🐱 Mode paire — sélectionnez une 2e carte {myCurrentCard ? EK_CARD_LABELS[myCurrentCard.type] : ''} identique
            </div>
            <button
              onClick={cancelPairMode}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4, padding: '4px 10px', fontSize: 11,
                color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {game.myHand.map((card) => {
            const isSelected = selectedCards.includes(card.id);
            const isPlayable = game.isMyTurn && game.phase === 'playing'
              && card.type !== 'exploding_kitten'
              && card.type !== 'defuse'
              && card.type !== 'nope';
            const isFavorGiveable = game.isAwaitingMyFavorGive;

            // In pair mode, only same-type cat cards are selectable for 2nd pick
            const isPairSelectable = pairMode && selectedCards.length === 1
              && isCatCard(card.type)
              && card.type === (game.myHand.find((c) => c.id === selectedCards[0])?.type)
              && card.id !== selectedCards[0];
            const isFirstPairSelected = pairMode && selectedCards[0] === card.id;

            return (
              <EKCard
                key={card.id}
                card={card}
                selected={isSelected || isFirstPairSelected}
                selectable={
                  isFavorGiveable
                    ? card.type !== 'exploding_kitten'
                    : pairMode
                      ? (isFirstPairSelected || isPairSelectable)
                      : isPlayable
                }
                dimmed={
                  (pairMode && !isFirstPairSelected && !isPairSelectable) ||
                  (game.amIEliminated)
                }
                onClick={(c) => {
                  if (isFavorGiveable && c.type !== 'exploding_kitten') {
                    playClick();
                    ekFavorGive(c.id);
                  } else {
                    handleCardClick(c);
                  }
                }}
              />
            );
          })}
          {game.myHand.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '20px 0' }}>
              Vous n'avez plus de cartes en main
            </div>
          )}
        </div>
        {game.amIEliminated && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 16, color: '#ef4444', fontWeight: 700 }}>
            💥 Vous avez explosé ! En attente de la fin de partie...
          </div>
        )}
      </div>

      {/* ─── Overlays ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {overlay && overlay !== 'rules' && (
          <motion.div
            key={overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
          >
            {/* See the Future */}
            {overlay === 'see_future' && game.seeTheFutureCards && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(6,182,212,0.4)',
                  borderRadius: 12,
                  padding: 24,
                  maxWidth: 400,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔮</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4', marginBottom: 4 }}>
                  Voir l'Avenir
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  Les 3 prochaines cartes (de haut en bas)
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {game.seeTheFutureCards.map((card, i) => (
                    <div key={card.id} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                        {i === 0 ? '1er' : i === 1 ? '2e' : '3e'}
                      </div>
                      <EKCard card={card} showTooltip={false} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setOverlay(null)}
                  style={{
                    marginTop: 20,
                    background: '#06b6d4',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 28px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#000',
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              </motion.div>
            )}

            {/* Insert kitten */}
            {overlay === 'insert_kitten' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: 12,
                  padding: 24,
                  maxWidth: 440,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>💣</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                  Où remettre le Chaton Explosif ?
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  0 = dessus de la pioche, {game.deckSize} = dessous
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  <input
                    type="range"
                    min={0}
                    max={game.deckSize}
                    value={insertPosition}
                    onChange={(e) => setInsertPosition(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#ef4444' }}
                  />
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>
                    Position : {insertPosition}
                    {insertPosition === 0 && ' (dessus — danger immédiat)'}
                    {insertPosition === game.deckSize && ' (dessous — plus sûr)'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    ekInsertKitten(insertPosition);
                    setOverlay(null);
                  }}
                  style={{
                    marginTop: 20,
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 28px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Insérer le Chaton
                </button>
              </motion.div>
            )}

            {/* Select target */}
            {overlay === 'select_target' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: '#1a1f2e',
                  border: `1px solid ${pendingCardColor}44`,
                  borderRadius: 12,
                  padding: 24,
                  maxWidth: 400,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>
                  {game.pendingCard ? EK_CARD_EMOJIS[game.pendingCard.type] : '🎯'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: pendingCardColor, marginBottom: 4 }}>
                  Choisissez une cible
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  {game.pendingCard?.type === 'favor'
                    ? 'Le joueur choisi devra vous donner une carte'
                    : 'Vous volerez une carte aléatoire à ce joueur'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                  {game.players
                    .filter((p) => p.id !== myId && p.isAlive && p.handSize > 0)
                    .map((p) => (
                      <motion.button
                        key={p.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          playClick();
                          ekSelectTarget(p.id);
                          setOverlay(null);
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: 8,
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          color: '#fff',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{p.avatar}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.handSize} cartes</div>
                        </div>
                      </motion.button>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Game Over */}
            {overlay === 'game_over' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: 32,
                  maxWidth: 400,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24', marginBottom: 8 }}>
                  Partie terminée !
                </div>
                {game.winnerNames.length > 0 && (
                  <div style={{ fontSize: 16, color: '#fff', marginBottom: 20 }}>
                    Survivant : <strong style={{ color: '#22c55e' }}>{game.winnerNames[0]}</strong>
                  </div>
                )}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  Retour au hub dans quelques secondes...
                </div>
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {game.players.map((p) => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px',
                      background: game.winnerIds.includes(p.id) ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                      borderRadius: 6,
                      border: game.winnerIds.includes(p.id) ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                    }}>
                      <span style={{ fontSize: 18 }}>{p.avatar}</span>
                      <span style={{ flex: 1, fontSize: 13, color: '#fff', textAlign: 'left' }}>{p.name}</span>
                      <span style={{ fontSize: 14 }}>
                        {game.winnerIds.includes(p.id) ? '👑 Survivant' : '💀 Éliminé'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules modal */}
      <AnimatePresence>
        {overlay === 'rules' && (
          <EKRulesModal onClose={() => setOverlay(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
