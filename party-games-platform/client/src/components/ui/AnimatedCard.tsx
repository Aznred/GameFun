import { motion } from 'framer-motion';
import { arcade } from '../../themes/arcade';

interface AnimatedCardProps {
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export default function AnimatedCard({
  children,
  accentColor = arcade.colors.accent.purple,
  className = '',
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: arcade.duration.normal, ease: arcade.ease }}
      className={`rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
        border: '2px solid rgba(255,255,255,0.12)',
        boxShadow: arcade.shadow.card,
      }}
    >
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          boxShadow: `0 0 16px ${accentColor}50`,
        }}
      />
      <div className="p-6">{children}</div>
    </motion.div>
  );
}
