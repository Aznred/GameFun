import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GAMES } from '../data/games';
import ArcadeButton from '../components/ui/ArcadeButton';
import PlayerAvatar from '../components/ui/PlayerAvatar';
import AnimatedCard from '../components/ui/AnimatedCard';
import { arcade } from '../themes/arcade';

export default function LobbyPage() {
  const { room, playerId, setReady, startGame, leaveRoom, kickPlayer } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const me = room.players.find((p) => p.id === playerId);
  const isHost = room.hostId === playerId;
  const allReady = room.players.every((p) => p.isReady || p.isHost);
  const canStart = isHost && room.players.length >= 2 && allReady;
  const gameId = room.selectedGameId ?? 'reaction';
  const game = GAMES.find((g) => g.id === gameId) ?? GAMES[0];

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-dvh flex flex-col relative z-10">
      <header
        className="h-16 flex items-center justify-between px-6"
        style={{
          background: 'rgba(26,10,46,0.6)',
          borderBottom: '2px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <ArcadeButton variant="ghost" size="sm" onClick={leaveRoom}>
          ← Leave
        </ArcadeButton>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{game.icon}</span>
          <span className="font-black text-lg" style={{ fontFamily: arcade.font.display, color: arcade.colors.text }}>{game.name}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <span className="text-sm font-bold" style={{ color: arcade.colors.textMuted }}>{room.players.length}/{room.maxPlayers}</span>
        </div>
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full p-8 flex flex-col gap-6">
        <AnimatedCard accentColor={game.color}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: arcade.colors.textMuted }}>Room code</div>
          <div className="flex items-center justify-between gap-4">
            <span
              className="text-4xl font-black tracking-[0.3em] font-mono"
              style={{ color: arcade.colors.text, fontFamily: arcade.font.display }}
            >
              {room.code}
            </span>
            <ArcadeButton size="sm" onClick={copyCode} glowColor={game.color}>
              {copied ? '✓ Copied' : 'Copy'}
            </ArcadeButton>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: arcade.colors.textMuted }}>Players</div>
          <div className="flex flex-wrap gap-8 justify-center">
            {room.players.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <PlayerAvatar
                  avatar={p.avatar}
                  name={p.name}
                  isReady={p.isReady}
                  isHost={p.isHost}
                  isMe={p.id === playerId}
                  accentColor={game.color}
                  size="lg"
                />
                {isHost && !p.isHost && (
                  <motion.button
                    onClick={() => kickPlayer(p.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-xs font-bold mt-1 border-0 bg-transparent cursor-pointer"
                    style={{ color: arcade.colors.accent.danger }}
                  >
                    Kick
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </AnimatedCard>

        {room.players.length < 2 && (
          <p className="text-center text-sm" style={{ color: arcade.colors.textMuted }}>Waiting for players (min 2)…</p>
        )}
        {room.players.length >= 2 && !canStart && isHost && (
          <p className="text-center text-sm" style={{ color: arcade.colors.textMuted }}>Waiting for everyone to be ready…</p>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!isHost ? (
            <ArcadeButton
              fullWidth
              size="lg"
              variant={me?.isReady ? 'success' : 'primary'}
              onClick={() => setReady(!me?.isReady)}
              glowColor={me?.isReady ? undefined : game.color}
            >
              {me?.isReady ? '✓ Ready — click to cancel' : "I'm ready"}
            </ArcadeButton>
          ) : (
            <ArcadeButton
              fullWidth
              size="lg"
              onClick={startGame}
              disabled={!canStart}
              glowColor={game.color}
            >
              {canStart ? 'Start game' : 'Waiting…'}
            </ArcadeButton>
          )}
        </motion.div>
      </div>
    </div>
  );
}
