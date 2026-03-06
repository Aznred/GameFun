import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ResultsPage from './pages/ResultsPage';
import GameHubPage from './pages/GameHubPage';
import LoveLetterPage from './pages/LoveLetterPage';
import UnoPage from './pages/UnoPage';
import WavelengthPage from './pages/WavelengthPage';
import ExplodingKittensPage from './pages/ExplodingKittensPage';
import ToastList from './components/ToastList';
import AnimatedBackground from './components/background/AnimatedBackground';

const transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

const pageTransition = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
  transition,
};

export default function App() {
  const page = useGameStore((s) => s.page);

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh' }}>
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div key="home" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <HomePage />
            </motion.div>
          )}
          {page === 'lobby' && (
            <motion.div key="lobby" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <LobbyPage />
            </motion.div>
          )}
          {page === 'game' && (
            <motion.div key="game" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <GamePage />
            </motion.div>
          )}
          {page === 'results' && (
            <motion.div key="results" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <ResultsPage />
            </motion.div>
          )}
          {page === 'hub' && (
            <motion.div key="hub" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <GameHubPage />
            </motion.div>
          )}
          {page === 'love-letter' && (
            <motion.div key="love-letter" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <LoveLetterPage />
            </motion.div>
          )}
          {page === 'uno' && (
            <motion.div key="uno" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <UnoPage />
            </motion.div>
          )}
          {page === 'wavelength' && (
            <motion.div key="wavelength" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <WavelengthPage />
            </motion.div>
          )}
          {page === 'exploding-kittens' && (
            <motion.div key="exploding-kittens" {...pageTransition} style={{ minHeight: '100dvh' }}>
              <ExplodingKittensPage />
            </motion.div>
          )}
        </AnimatePresence>

        <ToastList />
      </div>
    </div>
  );
}
