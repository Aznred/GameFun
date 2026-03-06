import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import Chat from '../components/Chat';
import { playClick, playPlayerJoin, playGameStart } from '../utils/sounds';
import { arcade } from '../themes/arcade';
import { GAME_META } from '../data/games';
import LobbyList, { type LobbyPlayer } from '../components/ui/LobbyList';
import ArcadeButton from '../components/ui/ArcadeButton';
import AnimatedPanel from '../components/ui/AnimatedPanel';

function trySound(fn: () => void) { try { fn(); } catch (_) {} }

export default function LobbyPage() {
  const { room, playerId, chatMessages, setReady, startGame, leaveRoom, kickPlayer } = useGameStore();
  const [copied, setCopied] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!room) return;
    if (room.players.length > prevCountRef.current && prevCountRef.current > 0) {
      trySound(playPlayerJoin);
    }
    prevCountRef.current = room.players.length;
  }, [room?.players.length]);

  if (!room) return null;

  const me = room.players.find((p) => p.id === playerId);
  const isHost = room.hostId === playerId;
  const allReady = room.players.every((p) => p.isReady || p.isHost);
  const canStart = isHost && room.players.length >= 2 && allReady;
  const gameId = room.selectedGameId ?? 'six-qui-prend';
  const meta = GAME_META[gameId] ?? { name: gameId, color: arcade.colors.accent.primary, icon: '🎮' };

  const lobbyPlayers: LobbyPlayer[] = room.players.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    isReady: p.isReady || p.isHost,
    isHost: p.isHost,
    isMe: p.id === playerId,
    isConnected: p.isConnected,
  }));

  const copyCode = () => {
    navigator.clipboard.writeText(room.code).catch(() => {});
    trySound(playClick);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
        <ArcadeButton
          onClick={() => { trySound(playClick); leaveRoom(); }}
          variant="ghost"
          size="sm"
        >
          ← QUITTER
        </ArcadeButton>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div
            animate={{ background: meta.color }}
            transition={{ duration: 0.4 }}
            style={{
              width: 36, height: 36, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: arcade.shadow.glow(meta.color),
            }}
          >
            {meta.icon}
          </motion.div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: arcade.colors.text }}>
              Salon
            </span>
            <span style={{ fontSize: 14, color: arcade.colors.textMuted, margin: '0 8px' }}>·</span>
            <motion.span
              animate={{ color: meta.color }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 14, fontWeight: 800 }}
            >
              {meta.name}
            </motion.span>
          </div>
        </div>

        <div style={{ fontSize: 12, color: arcade.colors.textMuted, fontWeight: 600 }}>
          {room.players.length}/{room.maxPlayers} joueurs
        </div>
      </motion.header>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          maxWidth: 700,
          width: '100%',
          margin: '0 auto',
          padding: '36px 28px 56px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          boxSizing: 'border-box',
        }}
      >
        {/* ── Room code ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedPanel accentColor={meta.color}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: arcade.colors.textMuted, marginBottom: 8,
                  }}
                >
                  Code de la salle
                </div>
                <div
                  style={{
                    fontSize: 36, fontWeight: 900, letterSpacing: '0.35em',
                    color: arcade.colors.text,
                    fontFamily: arcade.font.mono,
                  }}
                >
                  {room.code}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArcadeButton
                  onClick={copyCode}
                  variant={copied ? 'success' : 'secondary'}
                  size="md"
                >
                  {copied ? '✓ COPIÉ' : 'COPIER'}
                </ArcadeButton>
              </motion.div>
            </div>
          </AnimatedPanel>
        </motion.div>

        {/* ── Players (party room style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
        >
          <AnimatedPanel accentColor={meta.color}>
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: arcade.colors.textMuted,
                }}
              >
                Joueurs
              </div>
              <div style={{ fontSize: 11, color: arcade.colors.textSubdued, marginTop: 4 }}>
                {room.players.filter(p => p.isConnected).length} connecté{room.players.filter(p => p.isConnected).length > 1 ? 's' : ''}
              </div>
            </div>
            <LobbyList
              players={lobbyPlayers}
              accentColor={meta.color}
              maxPlayers={room.maxPlayers}
              onKick={(id) => { trySound(playClick); kickPlayer(id); }}
              canKick={isHost}
            />
          </AnimatedPanel>
        </motion.div>

        {/* ── Status hint ── */}
        <AnimatePresence>
          {room.players.length < 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', fontSize: 13, color: arcade.colors.textMuted }}
            >
              En attente d'autres joueurs (minimum 2)…
            </motion.div>
          )}
          {room.players.length >= 2 && !canStart && isHost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', fontSize: 13, color: arcade.colors.textMuted }}
            >
              En attente que tous les joueurs soient prêts…
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
        >
          {!isHost ? (
            <ArcadeButton
              onClick={() => { trySound(playClick); setReady(!me?.isReady); }}
              variant={me?.isReady ? 'success' : 'primary'}
              fullWidth
              glowColor={meta.color}
              className="!py-6"
            >
              {me?.isReady ? '✓  PRÊT — cliquer pour annuler' : 'JE SUIS PRÊT'}
            </ArcadeButton>
          ) : (
            <motion.div
              animate={{
                scale: canStart ? [1, 1.02, 1] : 1,
                boxShadow: canStart ? [arcade.shadow.glow(meta.color), arcade.shadow.glowStrong(meta.color), arcade.shadow.glow(meta.color)] : 'none',
              }}
              transition={{ duration: 1.5, repeat: canStart ? Infinity : 0 }}
            >
              <ArcadeButton
                onClick={() => { trySound(playGameStart); startGame(); }}
                disabled={!canStart}
                variant="primary"
                fullWidth
                glowColor={meta.color}
                className="!py-6"
              >
                {canStart ? 'LANCER LA PARTIE' : 'EN ATTENTE…'}
              </ArcadeButton>
            </motion.div>
          )}
        </motion.div>

        {/* ── Chat ── */}
        <Chat messages={chatMessages} myId={playerId} />
      </div>
    </div>
  );
}
