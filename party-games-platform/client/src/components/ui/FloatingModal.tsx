import { motion, AnimatePresence } from 'framer-motion';
import { arcade } from '../../themes/arcade';

interface FloatingModalProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}

export default function FloatingModal({
  open,
  onClose,
  title,
  children,
  accentColor = arcade.colors.accent.purple,
}: FloatingModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(26,10,46,0.98) 0%, rgba(15,52,96,0.95) 100%)',
                border: `3px solid ${accentColor}60`,
                boxShadow: `${arcade.shadow.glow(accentColor)}, 0 24px 60px rgba(0,0,0,0.5)`,
              }}
            >
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                  boxShadow: `0 0 24px ${accentColor}60`,
                }}
              />
              <div className="p-6 flex items-center justify-between border-b border-white/10">
                <h2
                  className="text-xl font-black"
                  style={{ fontFamily: arcade.font.display, color: arcade.colors.text }}
                >
                  {title}
                </h2>
                {onClose && (
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border-0 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.1)', color: arcade.colors.text }}
                  >
                    ×
                  </motion.button>
                )}
              </div>
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
