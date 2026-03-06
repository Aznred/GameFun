import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playClick, playGameStart } from '../utils/sounds';
import { arcade } from '../themes/arcade';
import { staggerContainer } from '../animations/variants';
import GameCard3D from '../components/cards/GameCard3D';
import AnimatedPanel from '../components/ui/AnimatedPanel';
import ArcadeButton from '../components/ui/ArcadeButton';
import ArcadeLayout from '../layouts/ArcadeLayout';
import { ParticleClickEffect } from '../components/particles/ParticleClickEffect';
import { GAMES, AVATARS } from '../data/games';

function trySound(fn: () => void) {
  try { fn(); } catch (_) {}
}

export default function HomePage() {
  const {
    playerName, avatar, selectedGameId,
    setPlayerName, setAvatar, setSelectedGameId,
    createRoom, joinRoom, isConnected, toasts,
  } = useGameStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const selectedGame = GAMES.find((g) => g.id === selectedGameId) ?? GAMES[0];
  const accent = selectedGame?.color ?? arcade.colors.accent.primary;

  const handleSelect = (g: typeof GAMES[0]) => {
    if (!g.available) return;
    trySound(playClick);
    setSelectedGameId(g.id);
  };

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    trySound(playGameStart);
    setLoading(true);
    await createRoom();
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || joinCode.length < 6) return;
    trySound(playClick);
    setJoinError('');
    setLoading(true);
    const before = toasts.length;
    await joinRoom(joinCode);
    setLoading(false);
    const after = useGameStore.getState().toasts;
    if (after.length > before) setJoinError(after[after.length - 1].message);
  };

  const canCreate = !!playerName.trim() && !loading;
  const canJoin = !!playerName.trim() && joinCode.length === 6 && !loading;

  return (
    <ArcadeLayout
      accentColor={accent}
      logoIcon={selectedGame?.icon ?? '🎮'}
      title="GAME HUB"
      profileAvatar={avatar}
      rightLabel={isConnected ? 'EN LIGNE' : 'HORS LIGNE'}
      showSettings
      showProfile
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: '36px 32px 48px',
          gap: 40,
          boxSizing: 'border-box',
        }}
      >
        {/* ── LEFT: Game library (Steam/Nintendo style) ──────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: arcade.colors.textMuted, marginBottom: 20,
            }}>
              Bibliothèque — {GAMES.filter(g => g.available).length} jeux disponibles
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.05, 0.06)}
            initial="initial"
            animate="animate"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 18,
            }}
          >
            {GAMES.map((g) => (
              <GameCard3D
                key={g.id}
                game={g}
                selected={selectedGameId === g.id}
                onClick={() => handleSelect(g)}
              />
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Action panel ──────────────────────────────────────────── */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Selected game display */}
          <AnimatePresence mode="wait">
            {selectedGame && (
              <AnimatedPanel key={selectedGame.id} accentColor={accent}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <motion.div
                    animate={{ scale: 1 }}
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: `${accent}25`,
                      border: `1px solid ${accent}50`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                  >
                    {selectedGame.icon}
                  </motion.div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <motion.div
                      animate={{ color: accent }}
                      transition={{ duration: 0.3 }}
                      style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' }}
                    >
                      {selectedGame.name}
                    </motion.div>
                    <div style={{ fontSize: 12, color: arcade.colors.textMuted, marginTop: 4 }}>
                      {selectedGame.players} joueurs · {selectedGame.duration}
                    </div>
                    {selectedGame.desc && (
                      <div style={{ fontSize: 12, color: arcade.colors.textMuted, lineHeight: 1.6, marginTop: 10 }}>
                        {selectedGame.desc}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedPanel>
            )}
          </AnimatePresence>

          {/* Form panel */}
          <AnimatedPanel accentColor={accent} floating>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name */}
              <div>
                <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: arcade.colors.textMuted }}>
                  Pseudonyme
                </div>
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Votre nom…"
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && tab === 'create' && handleCreate()}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: arcade.colors.bg,
                    border: `1px solid ${arcade.colors.border}`,
                    borderRadius: arcade.radius.md,
                    color: arcade.colors.text,
                    fontSize: 14,
                    fontFamily: arcade.font.body,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = accent;
                    e.target.style.boxShadow = `0 0 0 2px ${accent}30`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = arcade.colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Avatar */}
              <div>
                <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: arcade.colors.textMuted }}>
                  Avatar
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {AVATARS.map((a) => {
                    const sel = avatar === a;
                    return (
                      <motion.button
                        key={a}
                        onClick={() => { trySound(playClick); setAvatar(a); }}
                        whileTap={{ scale: 0.88 }}
                        whileHover={{ scale: 1.05 }}
                        animate={{
                          background: sel ? `${accent}30` : arcade.colors.surface,
                          borderColor: sel ? accent : arcade.colors.border,
                          boxShadow: sel ? `0 0 0 2px ${accent}40` : 'none',
                        }}
                        transition={{ duration: 0.2 }}
                        style={{
                          all: 'unset',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20,
                          aspectRatio: '1',
                          borderRadius: arcade.radius.md,
                          border: `2px solid ${arcade.colors.border}`,
                          cursor: 'pointer',
                        }}
                      >
                        {a}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Tabs */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                background: arcade.colors.bg,
                borderRadius: arcade.radius.md,
                border: `1px solid ${arcade.colors.border}`,
                padding: 4,
                gap: 4,
              }}>
                {(['create', 'join'] as const).map((t) => (
                  <motion.button
                    key={t}
                    onClick={() => { setTab(t); trySound(playClick); }}
                    animate={{
                      background: tab === t ? accent : 'transparent',
                      color: tab === t ? '#0f0d1a' : arcade.colors.textMuted,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      all: 'unset',
                      textAlign: 'center',
                      padding: '10px 0',
                      borderRadius: arcade.radius.sm,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'create' ? 'Créer' : 'Rejoindre'}
                  </motion.button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {tab === 'create' ? (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ParticleClickEffect color={accent + 'dd'} disabled={!canCreate}>
                      <ArcadeButton
                        onClick={handleCreate}
                        disabled={!canCreate}
                        variant="primary"
                        fullWidth
                        glowColor={accent}
                        className="!py-6"
                      >
                        {loading ? 'Connexion…' : 'CRÉER UNE SALLE'}
                      </ArcadeButton>
                    </ParticleClickEffect>
                  </motion.div>
                ) : (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    <motion.div
                      animate={joinError ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                      <input
                        value={joinCode}
                        onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                        placeholder="XXXXXX"
                        maxLength={6}
                        onKeyDown={(e) => e.key === 'Enter' && canJoin && handleJoin()}
                        style={{
                          width: '100%', padding: '14px',
                          background: arcade.colors.bg,
                          border: `2px solid ${joinError ? arcade.colors.accent.danger : arcade.colors.border}`,
                          borderRadius: arcade.radius.md,
                          color: arcade.colors.text,
                          fontSize: 26,
                          fontWeight: 900,
                          letterSpacing: '0.4em',
                          textAlign: 'center',
                          fontFamily: arcade.font.mono,
                          outline: 'none',
                          boxSizing: 'border-box',
                          textTransform: 'uppercase',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => {
                          if (!joinError) {
                            e.target.style.borderColor = accent;
                            e.target.style.boxShadow = `0 0 0 2px ${accent}30`;
                          }
                        }}
                        onBlur={(e) => {
                          if (!joinError) {
                            e.target.style.borderColor = arcade.colors.border;
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                      />
                    </motion.div>

                    <AnimatePresence>
                      {joinError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{
                            fontSize: 12,
                            color: arcade.colors.accent.danger,
                            padding: '10px 14px',
                            background: arcade.colors.accent.danger + '15',
                            border: `1px solid ${arcade.colors.accent.danger}40`,
                            borderRadius: arcade.radius.sm,
                            lineHeight: 1.4,
                          }}
                        >
                          {joinError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ParticleClickEffect color={accent + 'dd'} disabled={!canJoin}>
                      <ArcadeButton
                        onClick={handleJoin}
                        disabled={!canJoin}
                        variant="primary"
                        fullWidth
                        glowColor={accent}
                        className="!py-6"
                      >
                        {loading ? 'Connexion…' : 'REJOINDRE LA SALLE'}
                      </ArcadeButton>
                    </ParticleClickEffect>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimatedPanel>
        </div>
      </div>
    </ArcadeLayout>
  );
}
