import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playClick, playGameStart } from '../utils/sounds';

function trySound(fn: () => void) { try { fn(); } catch (_) {} }
import Chat from '../components/Chat';
import { arcade } from '../themes/arcade';
import { GAMES, GAME_META } from '../data/games';
import GameCard from '../components/cards/GameCard';
import AnimatedPanel from '../components/ui/AnimatedPanel';
import ArcadeButton from '../components/ui/ArcadeButton';
import PlayerAvatar from '../components/ui/PlayerAvatar';
import { staggerContainer, staggerItem } from '../animations/variants';

export default function GameHubPage() {
  const { room, playerId, chatMessages, selectGame, startGame, leaveRoom, kickPlayer } = useGameStore();
  const [showHistory, setShowHistory] = useState(false);

  if (!room) return null;

  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const selGame = GAMES.find((g) => g.id === room.selectedGameId) ?? GAMES[0];
  const meta = GAME_META[room.selectedGameId ?? 'six-qui-prend'] ?? { name: selGame.name, color: selGame.color, icon: selGame.icon };
  const canStart = isHost && selGame.available && room.players.length >= 2;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'transparent',
        color: arcade.colors.text,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: arcade.font.body,
      }}
    >
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          height: 64,
          borderBottom: `1px solid ${arcade.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div
            animate={{ background: meta.color }}
            transition={{ duration: 0.4 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: arcade.shadow.glow(meta.color),
            }}
          >
            {meta.icon}
          </motion.div>
          <div style={{ fontSize: 15, fontWeight: 800, color: arcade.colors.text, letterSpacing: '-0.01em' }}>
            SALLE DES JEUX
          </div>
          <div style={{ width: 1, height: 18, background: arcade.colors.border, margin: '0 8px' }} />
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: arcade.colors.textMuted,
              fontFamily: arcade.font.mono,
            }}
          >
            {room.code}
          </div>
          {room.gameHistory.length > 0 && (
            <div style={{ fontSize: 12, color: arcade.colors.textMuted }}>
              · {room.gameHistory.length} partie{room.gameHistory.length > 1 ? 's' : ''} jouée
              {room.gameHistory.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {room.gameHistory.length > 0 && (
            <ArcadeButton
              onClick={() => { trySound(playClick); setShowHistory(!showHistory); }}
              variant={showHistory ? 'secondary' : 'ghost'}
              size="sm"
            >
              HISTORIQUE
            </ArcadeButton>
          )}
          <ArcadeButton onClick={() => { trySound(playClick); leaveRoom(); }} variant="danger" size="sm">
            QUITTER
          </ArcadeButton>
        </div>
      </motion.header>

      {/* ── Body ── */}
      <div
        style={{
          flex: 1,
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: '32px',
          gap: 28,
          display: 'flex',
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Left sidebar ── */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Players */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedPanel accentColor={meta.color}>
              <div
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: arcade.colors.textMuted,
                  }}
                >
                  Joueurs
                </span>
                <span style={{ fontSize: 11, color: arcade.colors.textSubdued }}>
                  {room.players.length}/{room.maxPlayers}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {room.players.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: arcade.radius.md,
                      background: p.id === playerId ? arcade.colors.surfaceRaised : 'transparent',
                      border: p.id === playerId ? `1px solid ${meta.color}40` : '1px solid transparent',
                    }}
                  >
                    <PlayerAvatar
                      avatar={p.avatar}
                      name={p.name}
                      isHost={p.isHost}
                      isMe={p.id === playerId}
                      isConnected={p.isConnected}
                      accentColor={meta.color}
                      size="sm"
                      layout="horizontal"
                      onKick={isHost && p.id !== playerId ? () => { trySound(playClick); kickPlayer(p.id); } : undefined}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatedPanel>
          </motion.div>

          {/* Selected game + Launch */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06 }}
          >
            <AnimatedPanel accentColor={meta.color}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: arcade.colors.textMuted,
                  marginBottom: 14,
                }}
              >
                Jeu sélectionné
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>{selGame.icon}</span>
                <div>
                  <motion.div
                    animate={{ color: meta.color }}
                    transition={{ duration: 0.4 }}
                    style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}
                  >
                    {selGame.name}
                  </motion.div>
                  <div style={{ fontSize: 11, color: arcade.colors.textMuted, marginTop: 4 }}>
                    {selGame.players} · {selGame.duration}
                  </div>
                </div>
              </div>

              <ArcadeButton
                onClick={canStart ? () => { trySound(playGameStart); startGame(); } : undefined}
                disabled={!canStart}
                variant="primary"
                fullWidth
                glowColor={meta.color}
              >
                {canStart
                  ? 'LANCER LA PARTIE'
                  : !isHost
                    ? "EN ATTENTE DE L'HÔTE…"
                    : room.players.length < 2
                      ? 'EN ATTENTE DE JOUEURS…'
                      : 'INDISPONIBLE'}
              </ArcadeButton>
            </AnimatedPanel>
          </motion.div>

          {/* History */}
          <AnimatePresence>
            {showHistory && room.gameHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <AnimatedPanel accentColor={arcade.colors.accent.warning}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: arcade.colors.textMuted,
                      marginBottom: 12,
                    }}
                  >
                    Historique
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {[...room.gameHistory].reverse().map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '12px 0',
                          borderBottom:
                            i < room.gameHistory.length - 1
                              ? `1px solid ${arcade.colors.border}`
                              : 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: arcade.colors.accent.warning }}>
                            {entry.gameName}
                          </span>
                          <span style={{ fontSize: 10, color: arcade.colors.textMuted }}>
                            {new Date(entry.playedAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: arcade.colors.textMuted }}>
                          🏆 {entry.winnerName || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat */}
          <Chat messages={chatMessages} myId={playerId} />
        </div>

        {/* ── Right: Game catalogue ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: arcade.colors.textMuted,
              }}
            >
              Choisir le prochain jeu
            </div>
            {!isHost && (
              <div style={{ fontSize: 12, color: arcade.colors.textSubdued }}>
                Seul l'hôte peut changer le jeu
              </div>
            )}
          </div>

          <motion.div
            variants={staggerContainer(0, 0.05)}
            initial="initial"
            animate="animate"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
            }}
          >
            {GAMES.map((game) => {
              const isSelected = room.selectedGameId === game.id;
              return (
                <GameCard
                  key={game.id}
                  game={game}
                  selected={isSelected}
                  onClick={
                    isHost && game.available
                      ? () => {
                          trySound(playClick);
                          selectGame(game.id);
                        }
                      : undefined
                  }
                />
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
