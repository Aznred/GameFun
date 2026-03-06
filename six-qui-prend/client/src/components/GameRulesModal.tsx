import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface RulesSection {
  icon: string;
  title: string;
  color: string;
  content?: string[];
  rows?: { label: string; value: string; badge?: string; badgeColor?: string }[];
}

interface GameRulesModalProps {
  onClose: () => void;
  gameName: string;
  gameEmoji: string;
  headerGradient: string;
  sections: RulesSection[];
}

export default function GameRulesModal({
  onClose, gameName, gameEmoji, headerGradient, sections,
}: GameRulesModalProps) {
  const [active, setActive] = useState(0);
  const section = sections[active];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid rgba(255,255,255,0.1)',
            maxHeight: '90dvh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* ── Header ── */}
          <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: headerGradient }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{gameEmoji}</span>
              <div>
                <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 22, color: 'white', lineHeight: 1.1 }}>
                  Règles du jeu
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Nunito, sans-serif' }}>
                  {gameName}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xl"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              ✕
            </motion.button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex overflow-x-auto gap-1 px-4 py-3 scrollbar-hide shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {sections.map((s, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActive(i)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all shrink-0"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  background: active === i ? s.color : 'rgba(255,255,255,0.06)',
                  color: active === i ? 'white' : 'rgba(255,255,255,0.55)',
                  border: active === i ? `2px solid ${s.color}88` : '2px solid transparent',
                }}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.title.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="p-6 overflow-y-auto min-h-[220px]" style={{ flex: '1 1 0' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Section title */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg shrink-0"
                    style={{ background: section.color }}
                  >
                    {section.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: section.color }}>
                    {section.title}
                  </h3>
                </div>

                {/* List content */}
                {section.content && (
                  <div className="space-y-3">
                    {section.content.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 rounded-xl p-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black text-white mt-0.5"
                          style={{ background: section.color }}
                        >
                          {i + 1}
                        </div>
                        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Table rows */}
                {section.rows && (
                  <div className="space-y-2">
                    {section.rows.map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                          {row.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {row.badge && (
                            <span
                              className="text-xs font-black px-2 py-0.5 rounded-full"
                              style={{
                                background: (row.badgeColor ?? section.color) + '22',
                                color: row.badgeColor ?? section.color,
                                border: `1px solid ${(row.badgeColor ?? section.color)}44`,
                                fontFamily: 'Nunito, sans-serif',
                              }}
                            >
                              {row.badge}
                            </span>
                          )}
                          <span style={{
                            fontFamily: 'Fredoka One, cursive',
                            fontSize: 14,
                            color: section.color,
                            minWidth: 60,
                            textAlign: 'right',
                          }}>
                            {row.value}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer nav ── */}
          <div className="flex items-center justify-between px-6 pb-5 pt-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(Math.max(0, active - 1))}
              disabled={active === 0}
              className="px-4 py-2 rounded-xl font-bold text-sm"
              style={{
                fontFamily: 'Nunito, sans-serif',
                background: active === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                color: active === 0 ? 'rgba(255,255,255,0.25)' : 'white',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              ← Précédent
            </motion.button>

            <div className="flex gap-1.5">
              {sections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    width: active === i ? 20 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: active === i ? section.color : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => active < sections.length - 1 ? setActive(active + 1) : onClose()}
              className="px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{
                fontFamily: 'Nunito, sans-serif',
                background: active === sections.length - 1
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : `linear-gradient(90deg, ${section.color}, ${section.color}cc)`,
                border: 'none',
              }}
            >
              {active === sections.length - 1 ? 'Jouer ! 🎮' : 'Suivant →'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
