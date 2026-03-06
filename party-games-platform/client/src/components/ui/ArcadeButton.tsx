import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

interface ArcadeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glowColor?: string;
  className?: string;
}

const variants: Record<Variant, { bg: string; color: string; hoverGlow: string }> = {
  primary: { bg: 'linear-gradient(180deg, #a855f7, #7c3aed)', color: '#fff', hoverGlow: '#a855f7' },
  secondary: { bg: 'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))', color: '#fef3c7', hoverGlow: 'rgba(255,255,255,0.3)' },
  danger: { bg: 'linear-gradient(180deg, #f87171, #ef4444)', color: '#fff', hoverGlow: '#f87171' },
  success: { bg: 'linear-gradient(180deg, #4ade80, #22c55e)', color: '#0f0d1a', hoverGlow: '#4ade80' },
  ghost: { bg: 'transparent', color: 'rgba(254,243,199,0.9)', hoverGlow: 'transparent' },
};

const sizes = { sm: 'py-2 px-4 text-sm', md: 'py-3 px-6 text-base', lg: 'py-4 px-8 text-lg' };

export default function ArcadeButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth,
  glowColor,
  className = '',
}: ArcadeButtonProps) {
  const v = variants[variant];
  const color = glowColor ?? v.hoverGlow;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, boxShadow: `0 0 24px ${color}50` } : undefined}
      whileTap={!disabled ? { scale: 0.96, boxShadow: arcade.shadow.buttonPress } : undefined}
      transition={{ duration: arcade.duration.fast, ease: arcade.ease }}
      className={`
        rounded-2xl font-bold font-[family-name:var(--font-display)] select-none border-0
        ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      style={{
        fontFamily: arcade.font.display,
        background: disabled ? 'rgba(255,255,255,0.06)' : v.bg,
        color: disabled ? 'rgba(254,243,199,0.4)' : v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : arcade.shadow.button,
        border: variant === 'ghost' ? '2px solid rgba(255,255,255,0.2)' : 'none',
      }}
    >
      {children}
    </motion.button>
  );
}
