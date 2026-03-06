import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GAMES } from '../data/games';
import GameTile from '../components/ui/GameTile';
import ArcadeButton from '../components/ui/ArcadeButton';
import PlayerAvatar from '../components/ui/PlayerAvatar';
import AnimatedCard from '../components/ui/AnimatedCard';
import { arcade } from '../themes/arcade';

export default function HubPage() {
  const { room, playerId, selectGame, startGame, leaveRoom } = useGameStore();

  if (!room) return null;

  const me = room.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const gameId = room.selectedGameId ?? 'reaction';
  const game = GAMES.find((g) => g.id === gameId) ?? GAMES[0];
  const canStart = isHost && game.available && room.players.length >= 2;

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
        <div className="flex items-center gap-3">
          <span className="text-2xl">{game.icon}</span>
          <span className="font-black text-lg" style={{ fontFamily: arcade.font.display, color: arcade.colors.text }}>Game hub</span>
          <span className="font-mono text-sm px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', color: arcade.colors.textMuted }}>{room.code}</span>
        </div>
        <ArcadeButton variant="danger" size="sm" onClick={leaveRoom}>
          Leave
        </ArcadeButton>
      </header>

      <div className="flex-1 flex max-w-5xl mx-auto w-full p-8 gap-8">
        <div className="w-64 flex flex-col gap-4 shrink-0">
          <AnimatedCard accentColor={game.color}>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: arcade.colors.textMuted }}>Players</div>
            <div className="flex flex-col gap-3">
              {room.players.map((p) => (
                <PlayerAvatar
                  key={p.id}
                  avatar={p.avatar}
                  name={p.name}
                  isHost={p.isHost}
                  isMe={p.id === playerId}
                  accentColor={game.color}
                  size="sm"
                />
              ))}
            </div>
          </AnimatedCard>
          <AnimatedCard accentColor={game.color}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: arcade.colors.textMuted }}>Selected</div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{game.icon}</span>
              <span className="font-bold" style={{ color: arcade.colors.text }}>{game.name}</span>
            </div>
            <ArcadeButton
              fullWidth
              onClick={() => canStart && startGame()}
              disabled={!canStart}
              glowColor={game.color}
            >
              {canStart ? 'Start game' : !isHost ? 'Wait for host' : 'Need 2+ players'}
            </ArcadeButton>
          </AnimatedCard>
        </div>

        <div className="flex-1 min-w-0">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: arcade.colors.textMuted }}
          >
            Choose next game
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {GAMES.map((g) => (
              <GameTile
                key={g.id}
                game={g}
                selected={gameId === g.id}
                onClick={() => isHost && g.available && selectGame(g.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
