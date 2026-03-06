import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GAMES, AVATARS } from '../data/games';
import GameTile from '../components/ui/GameTile';
import ArcadeButton from '../components/ui/ArcadeButton';
import FloatingModal from '../components/ui/FloatingModal';
import { arcade } from '../themes/arcade';

export default function HomePage() {
  const {
    playerName,
    avatar,
    selectedGameId,
    setPlayerName,
    setAvatar,
    setSelectedGameId,
    createRoom,
    joinRoom,
    isConnected,
  } = useGameStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedGame = GAMES.find((g) => g.id === selectedGameId) ?? GAMES[0];

  const handlePlayClick = (gameId: string) => {
    setSelectedGameId(gameId);
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    await createRoom();
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || joinCode.length < 6) return;
    setLoading(true);
    await joinRoom(joinCode);
    setLoading(false);
  };

  const canCreate = !!playerName.trim() && !loading;
  const canJoin = !!playerName.trim() && joinCode.length === 6 && !loading;

  return (
    <div className="min-h-dvh flex flex-col relative z-10">
      <header
        className="relative z-10 h-16 flex items-center justify-between px-6"
        style={{
          background: 'rgba(26,10,46,0.6)',
          borderBottom: '2px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{
              background: `linear-gradient(180deg, ${arcade.colors.accent.purple}, ${arcade.colors.accent.pink})`,
              boxShadow: arcade.shadow.glow(arcade.colors.accent.purple),
            }}
          >
            🎮
          </motion.div>
          <span
            className="font-black text-xl tracking-tight"
            style={{ fontFamily: arcade.font.display, color: arcade.colors.text }}
          >
            PARTY GAMES
          </span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', color: arcade.colors.textMuted }}
          >
            <span className="text-lg">👥</span>
            <span className="text-sm font-bold">0 friends</span>
          </motion.button>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.08)', color: arcade.colors.textMuted }}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`} style={isConnected ? { boxShadow: '0 0 10px #4ade80' } : {}} />
            <span className="text-sm font-bold">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
          <ArcadeButton variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
            ⚙️ Settings
          </ArcadeButton>
          <ArcadeButton variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
            Create or Join
          </ArcadeButton>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black mb-2"
          style={{ fontFamily: arcade.font.display, color: arcade.colors.text }}
        >
          Pick a game
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-sm mb-8"
          style={{ color: arcade.colors.textMuted }}
        >
          {GAMES.filter((g) => g.available).length} games ready to play
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((g) => (
            <GameTile
              key={g.id}
              game={g}
              selected={selectedGameId === g.id}
              onClick={() => g.available && setSelectedGameId(g.id)}
              onPlay={g.available ? () => handlePlayClick(g.id) : undefined}
            />
          ))}
        </div>
      </main>

      <FloatingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create or join a room"
        accentColor={selectedGame.color}
      >
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <span className="text-3xl">{selectedGame.icon}</span>
          <div>
            <div className="font-black" style={{ fontFamily: arcade.font.display, color: selectedGame.color }}>{selectedGame.name}</div>
            <div className="text-xs" style={{ color: arcade.colors.textMuted }}>{selectedGame.players} • {selectedGame.duration}</div>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: arcade.colors.textMuted }}>Name</label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderColor: 'rgba(255,255,255,0.15)',
              color: arcade.colors.text,
              fontFamily: arcade.font.body,
            }}
          />
        </div>
        <div className="mb-4">
          <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: arcade.colors.textMuted }}>Avatar</label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((a) => (
              <motion.button
                key={a}
                onClick={() => setAvatar(a)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl border-2 transition-colors ${
                  avatar === a ? '' : 'border-transparent'
                }`}
                style={{
                  background: avatar === a ? `${selectedGame.color}40` : 'rgba(255,255,255,0.06)',
                  borderColor: avatar === a ? selectedGame.color : 'transparent',
                }}
              >
                {a}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 p-1 rounded-xl mb-4" style={{ background: 'rgba(0,0,0,0.25)' }}>
          {(['create', 'join'] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm"
              style={{
                background: tab === t ? selectedGame.color : 'transparent',
                color: tab === t ? '#0f0d1a' : arcade.colors.textMuted,
                fontFamily: arcade.font.display,
              }}
            >
              {t === 'create' ? 'Create room' : 'Join room'}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {tab === 'create' ? (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ArcadeButton fullWidth size="lg" onClick={handleCreate} disabled={!canCreate} glowColor={selectedGame.color}>
                {loading ? 'Connecting…' : 'Create room'}
              </ArcadeButton>
            </motion.div>
          ) : (
            <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && canJoin && handleJoin()}
                className="w-full px-4 py-4 rounded-xl border-2 text-center text-2xl font-black tracking-[0.35em] uppercase outline-none"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: arcade.colors.text,
                  fontFamily: arcade.font.display,
                }}
              />
              <ArcadeButton fullWidth size="lg" variant="success" onClick={handleJoin} disabled={!canJoin}>
                {loading ? 'Connecting…' : 'Join room'}
              </ArcadeButton>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingModal>

      <FloatingModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        accentColor={arcade.colors.accent.cyan}
      >
        <div className="space-y-4 text-sm" style={{ color: arcade.colors.textMuted }}>
          <p>Settings coming soon.</p>
          <p className="text-xs">Sound, notifications, and more.</p>
        </div>
      </FloatingModal>
    </div>
  );
}
