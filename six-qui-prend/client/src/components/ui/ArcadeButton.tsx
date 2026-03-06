import React from 'react';
import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';
import { playClick, playHover } from '../../utils/sounds';

function trySound(fn: () => void) { try { fn(); } catch (_) {} }

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

interface ArcadeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glowColor?: string;
  className?: string;
  type?: 'button' | 'submit';
}

const variantStyles: Record<Variant, { bg: string; hoverBg: string; color: string; shadow: string }> = {
  primary: {
    bg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
    hoverBg: 'linear-gradient(135deg, #c4b5fd, #a78bfa)',
    color: '#fff',
    shadow: arcade.shadow.glow('#a78bfa'),
  },
  secondary: {
    bg: 'rgba(255,255,255,0.08)',
    hoverBg: 'rgba(255,255,255,0.12)',
    color: '#f8f6ff',
    shadow: 'none',
  },
  ghost: {
    bg: 'transparent',
    hoverBg: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.8)',
    shadow: 'none',
  },
  danger: {
    bg: 'linear-gradient(135deg, #f87171, #ef4444)',
    hoverBg: 'linear-gradient(135deg, #fca5a5, #f87171)',
    color: '#fff',
    shadow: arcade.shadow.glow('#ef4444'),
  },
  success: {
    bg: 'linear-gradient(135deg, #4ade80, #22c55e)',
    hoverBg: 'linear-gradient(135deg, #86efac, #4ade80)',
    color: '#0f0d1a',
    shadow: arcade.shadow.glow('#4ade80'),
  },
};

const sizeStyles = {
  sm: { px: 12, py: 8, text: 12 },
  md: { px: 20, py: 12, text: 14 },
  lg: { px: 28, py: 16, text: 16 },
};

export default function ArcadeButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth,
  glowColor,
  className = '',
  type = 'button',
}: ArcadeButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <motion.button
      type={type}
      onClick={() => {
        if (!disabled) trySound(playClick);
        onClick?.();
      }}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, boxShadow: glowColor ? arcade.shadow.glow(glowColor) : v.shadow } : undefined}
      whileTap={!disabled ? { scale: 0.96, transition: { duration: 0.1 } } : undefined}
      transition={{ duration: 0.2, ease: arcade.ease }}
      className={`rounded-xl font-bold select-none outline-none border-0 ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: `${s.py}px ${s.px}px`,
        fontSize: s.text,
        fontFamily: arcade.font.body,
        background: disabled ? 'rgba(255,255,255,0.05)' : v.bg,
        color: disabled ? 'rgba(255,255,255,0.3)' : v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : arcade.shadow.button,
        boxSizing: 'border-box',
        letterSpacing: '0.03em',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        trySound(playHover);
        (e.currentTarget as HTMLButtonElement).style.background = v.hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.background = v.bg;
      }}
    >
      {children}
    </motion.button>
  );
}
