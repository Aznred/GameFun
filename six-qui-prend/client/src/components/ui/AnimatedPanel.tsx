import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn } from '../../animations/variants';
import { arcade } from '../../themes/arcade';

interface AnimatedPanelProps {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
  floating?: boolean;
}

export default function AnimatedPanel({
  children,
  accentColor = arcade.colors.accent.primary,
  className = '',
  floating = false,
}: AnimatedPanelProps) {
  return (
    <motion.div
      {...scaleIn}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: floating
          ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
          : arcade.shadow.md,
        backdropFilter: floating ? 'blur(16px)' : 'none',
      }}
    >
      {/* Top accent strip */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          boxShadow: `0 0 20px ${accentColor}40`,
        }}
      />
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
