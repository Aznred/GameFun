import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export default function ToastList() {
  const toasts = useGameStore((s) => s.toasts);
  const dismiss = useGameStore((s) => s.dismissToast);

  useEffect(() => {
    toasts.forEach((t) => {
      const timer = setTimeout(() => dismiss(t.id), 4000);
      return () => clearTimeout(timer);
    });
  }, [toasts]);

  const styles = {
    error: { bg: 'from-red-800 to-red-900', border: 'border-red-500/50', icon: '❌' },
    info:  { bg: 'from-blue-800 to-blue-900', border: 'border-blue-500/50', icon: 'ℹ️' },
    success: { bg: 'from-green-800 to-green-900', border: 'border-green-500/50', icon: '✅' },
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = styles[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -30, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              onClick={() => dismiss(t.id)}
              className={`pointer-events-auto bg-gradient-to-r ${s.bg} text-white text-sm
                font-semibold font-nunito px-4 py-3 rounded-2xl border ${s.border}
                shadow-xl backdrop-blur-sm cursor-pointer flex items-center gap-2`}
            >
              <span className="text-lg">{s.icon}</span>
              <span className="flex-1">{t.message}</span>
              <span className="text-white/30 text-xs">✕</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
