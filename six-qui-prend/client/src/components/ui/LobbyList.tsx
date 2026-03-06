import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlayerAvatar from './PlayerAvatar';
import { staggerContainer, staggerItem } from '../../animations/variants';

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  isReady?: boolean;
  isHost?: boolean;
  isMe?: boolean;
  isConnected?: boolean;
}

interface LobbyListProps {
  players: LobbyPlayer[];
  accentColor?: string;
  maxPlayers?: number;
  onKick?: (playerId: string) => void;
  canKick?: boolean;
}

export default function LobbyList({
  players,
  accentColor = '#a78bfa',
  maxPlayers = 8,
  onKick,
  canKick = false,
}: LobbyListProps) {
  return (
    <motion.div
      variants={staggerContainer(0, 0.04)}
      initial="initial"
      animate="animate"
      className="flex flex-wrap gap-6 justify-center"
    >
      <AnimatePresence mode="popLayout">
        {players.map((p) => (
          <motion.div key={p.id} variants={staggerItem}>
            <PlayerAvatar
              avatar={p.avatar}
              name={p.name}
              isReady={p.isReady}
              isHost={p.isHost}
              isMe={p.isMe}
              isConnected={p.isConnected ?? true}
              accentColor={accentColor}
              size="md"
              onKick={canKick && onKick ? () => onKick(p.id) : undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty slots */}
      {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
        <motion.div
          key={`empty-${i}`}
          variants={staggerItem}
          className="flex flex-col items-center gap-2"
        >
          <div
            className="rounded-2xl flex items-center justify-center border-2 border-dashed"
            style={{
              width: 48,
              height: 48,
              borderColor: 'rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <span className="text-lg opacity-40">+</span>
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            En attente
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
