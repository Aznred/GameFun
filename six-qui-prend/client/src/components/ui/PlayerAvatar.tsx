import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PlayerAvatarProps {
  avatar: string;
  name: string;
  isReady?: boolean;
  isHost?: boolean;
  isMe?: boolean;
  isConnected?: boolean;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  onKick?: () => void;
  layout?: 'vertical' | 'horizontal';
}

const sizeMap = { sm: 36, md: 48, lg: 64 };

export default function PlayerAvatar({
  avatar,
  name,
  isReady = false,
  isHost = false,
  isMe = false,
  isConnected = true,
  accentColor = '#a78bfa',
  size = 'md',
  onKick,
  layout = 'vertical',
}: PlayerAvatarProps) {
  const s = sizeMap[size];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={layout === 'horizontal' ? 'flex flex-row items-center gap-3' : 'flex flex-col items-center gap-2'}
    >
      <div className="relative">
        {/* Glow ring when ready */}
        {isReady && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `radial-gradient(circle, ${accentColor}40, transparent)`,
              filter: 'blur(8px)',
            }}
          />
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{
            width: s,
            height: s,
            background: isMe ? `${accentColor}25` : 'rgba(255,255,255,0.06)',
            border: `2px solid ${isMe ? accentColor : isReady ? `${accentColor}60` : 'rgba(255,255,255,0.1)'}`,
            boxShadow: isReady ? `0 0 20px ${accentColor}30` : '0 4px 12px rgba(0,0,0,0.3)',
            fontSize: s * 0.5,
          }}
        >
          {avatar}
        </motion.div>

        {/* Host crown */}
        {isHost && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 text-sm"
          >
            👑
          </motion.div>
        )}

        {/* Kick button (host only, on hover) */}
        {onKick && !isHost && !isMe && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            whileHover={{ scale: 1.1 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer border-0"
            style={{
              background: '#ef4444',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
              pointerEvents: hovered ? 'auto' : 'none',
            }}
            onClick={(e) => { e.stopPropagation(); onKick(); }}
          >
            ✕
          </motion.button>
        )}

        {/* Disconnected overlay */}
        {!isConnected && (
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <span className="text-lg">💤</span>
          </div>
        )}
      </div>

      <div className={layout === 'horizontal' ? 'text-left min-w-0 flex-1' : 'text-center max-w-[80px]'}>
        <div
          className="font-bold text-sm truncate"
          style={{
            color: isMe ? accentColor : '#f8f6ff',
            fontFamily: '"Outfit", system-ui, sans-serif',
          }}
        >
          {name}
        </div>
        {isReady && !isHost && layout === 'vertical' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-bold"
            style={{ color: '#4ade80' }}
          >
            ✓ Prêt
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
