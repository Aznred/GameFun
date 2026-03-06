import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import AnimatedBackground from './components/background/AnimatedBackground';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import HubPage from './pages/HubPage';
import ReactionPage from './pages/ReactionPage';
import MemeBattlePage from './pages/MemeBattlePage';
import TruthLiePage from './pages/TruthLiePage';
import ResultsPage from './pages/ResultsPage';
import ToastList from './components/ToastList';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

export default function App() {
  const page = useGameStore((s) => s.page);

  return (
    <div className="min-h-dvh text-white font-sans relative">
      <AnimatedBackground />
      <AnimatePresence mode="wait">
        {page === 'home' && (
          <motion.div key="home" {...pageTransition}>
            <HomePage />
          </motion.div>
        )}
        {page === 'lobby' && (
          <motion.div key="lobby" {...pageTransition}>
            <LobbyPage />
          </motion.div>
        )}
        {page === 'hub' && (
          <motion.div key="hub" {...pageTransition}>
            <HubPage />
          </motion.div>
        )}
        {page === 'reaction' && (
          <motion.div key="reaction" {...pageTransition}>
            <ReactionPage />
          </motion.div>
        )}
        {page === 'meme-battle' && (
          <motion.div key="meme-battle" {...pageTransition}>
            <MemeBattlePage />
          </motion.div>
        )}
        {page === 'truth-lie' && (
          <motion.div key="truth-lie" {...pageTransition}>
            <TruthLiePage />
          </motion.div>
        )}
        {page === 'results' && (
          <motion.div key="results" {...pageTransition}>
            <ResultsPage />
          </motion.div>
        )}
      </AnimatePresence>
      <ToastList />
    </div>
  );
}
