/**
 * Party arcade design system — Jackbox / Nintendo / Fall Guys
 * Bright, playful, bold. No SaaS dashboard look.
 */

export const arcade = {
  colors: {
    bg: '#1a0a2e',
    bgGradient: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 30%, #0f3460 60%, #1a0a2e 100%)',
    surface: 'rgba(255,255,255,0.08)',
    surfaceHover: 'rgba(255,255,255,0.12)',
    text: '#fef3c7',
    textMuted: 'rgba(254,243,199,0.7)',
    accent: {
      purple: '#a855f7',
      cyan: '#22d3ee',
      orange: '#fb923c',
      pink: '#ec4899',
      green: '#4ade80',
      yellow: '#facc15',
      danger: '#f87171',
    },
  },
  font: {
    display: '"Poppins", "Nunito", sans-serif',
    body: '"Nunito", "Poppins", sans-serif',
  },
  shadow: {
    glow: (color: string) => `0 0 30px ${color}40, 0 0 60px ${color}20`,
    card: '0 8px 0 0 rgba(0,0,0,0.25), 0 16px 40px rgba(0,0,0,0.35)',
    cardHover: '0 12px 0 0 rgba(0,0,0,0.2), 0 24px 48px rgba(0,0,0,0.4)',
    button: '0 6px 0 0 rgba(0,0,0,0.3)',
    buttonPress: '0 2px 0 0 rgba(0,0,0,0.3)',
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  duration: { fast: 0.15, normal: 0.25, slow: 0.4 },
  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};
