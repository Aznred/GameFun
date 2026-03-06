/**
 * Arcade design system — premium gaming platform aesthetic
 * Inspired by Jackbox, Supercell, Nintendo Switch, Fall Guys
 */

export const arcade = {
  // Colors — bright accents, soft shadows
  colors: {
    bg: '#0f0d1a',
    bgGradient: 'linear-gradient(135deg, #0f0d1a 0%, #1a1628 50%, #0f0d1a 100%)',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    surfaceRaised: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.1)',
    borderGlow: 'rgba(255,255,255,0.2)',
    text: '#f8f6ff',
    textMuted: 'rgba(255,255,255,0.6)',
    textSubdued: 'rgba(255,255,255,0.4)',

    // Accent palette — vibrant, playful
    accent: {
      primary: '#a78bfa',
      secondary: '#f472b6',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#38bdf8',
    },

    // Game-specific accents
    game: {
      'six-qui-prend': '#4ade80',
      'love-letter': '#c084fc',
      uno: '#f87171',
      wavelength: '#818cf8',
      'exploding-kittens': '#fb923c',
    },
  },

  // Typography — Inter for UI, Poppins for headings (Nintendo/Steam style)
  font: {
    body: '"Inter", system-ui, sans-serif',
    display: '"Poppins", "Inter", system-ui, sans-serif',
    mono: 'ui-monospace, "Cascadia Code", monospace',
  },

  // Shadows — soft, glowing
  shadow: {
    sm: '0 2px 8px rgba(0,0,0,0.3)',
    md: '0 4px 20px rgba(0,0,0,0.4)',
    lg: '0 8px 40px rgba(0,0,0,0.5)',
    glow: (color: string) => `0 0 24px ${color}40, 0 0 48px ${color}20`,
    glowStrong: (color: string) => `0 0 32px ${color}60, 0 0 64px ${color}30`,
    card: '0 4px 0 0 rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.35)',
    cardHover: '0 6px 0 0 rgba(0,0,0,0.15), 0 12px 32px rgba(0,0,0,0.4)',
    button: '0 4px 0 0 rgba(0,0,0,0.25)',
    buttonPress: '0 1px 0 0 rgba(0,0,0,0.25)',
  },

  // Radii — rounded, playful
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Animation timing
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
  },

  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export type ArcadeTheme = typeof arcade;
