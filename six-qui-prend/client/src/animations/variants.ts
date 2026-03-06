/**
 * Shared Framer Motion variants — 200–300ms micro-animations
 * GPU-accelerated (transform, opacity)
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = (delayChildren = 0.05, staggerChildren = 0.06) => ({
  initial: {},
  animate: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

// Button press — quick scale down
export const tapScale = {
  scale: 0.96,
  transition: { duration: 0.1 },
};

// Hover lift
export const hoverLift = {
  y: -4,
  transition: { duration: 0.2 },
};

// Card tilt on hover (subtle)
export const cardTilt = {
  rotateX: 2,
  rotateY: -2,
  transition: { duration: 0.2 },
};
