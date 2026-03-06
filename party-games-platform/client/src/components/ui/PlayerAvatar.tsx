import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';

interface PlayerAvatarProps {
  avatar: string;
  name: string;
  isReady?: boolean;
  isHost?: boolean;
  isMe?: boolean;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 44, md: 56, lg: 72 };

export default function PlayerAvatar({
  avatar,
  name,
  isReady = false,
  isHost = false,
  isMe = false,
  accentColor = arcade.colors.accent.purple,
  size = 'md',
}: PlayerAvatarProps) {
  const s = sizes[size];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        whileHover={{ scale: 1.08 }}
        className="relative rounded-2xl flex items-center justify-center"
        style={{
          width: s,
          height: s,
          background: isMe ? `linear-gradient(180deg, ${accentColor}40, ${accentColor}20)` : 'rgba(255,255,255,0.08)',
          border: `3px solid ${isMe ? accentColor : isReady ? `${accentColor}80` : 'rgba(255,255,255,0.2)'}`,
          boxShadow: isReady ? `0 0 20px ${accentColor}40` : '0 6px 0 0 rgba(0,0,0,0.2)',
        }}
      >
        <span style={{ fontSize: s * 0.45 }}>{avatar}</span>
        {isHost && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 text-base"
          >
            👑
          </motion.span>
        )}
      </motion.div>
      <span
        className="font-bold text-sm truncate max-w-[90px] text-center"
        style={{ fontFamily: arcade.font.body, color: isMe ? accentColor : arcade.colors.text }}
      >
        {name}
      </span>
      {isReady && !isHost && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-black text-green-400"
        >
          ✓ Ready
        </motion.span>
      )}
    </motion.div>
  );
}
