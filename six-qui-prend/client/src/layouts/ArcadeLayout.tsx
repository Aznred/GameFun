import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { arcade } from '../themes/arcade';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';

interface ArcadeLayoutProps {
  children: React.ReactNode;
  /** Accent color for logo/active state */
  accentColor?: string;
  /** Logo icon (emoji or game icon) */
  logoIcon?: string;
  /** Title next to logo */
  title?: string;
  /** Current user avatar (emoji) for profile */
  profileAvatar?: string;
  /** Right-side label e.g. "2 en ligne" */
  rightLabel?: string;
  /** Show settings dropdown (sound toggle) */
  showSettings?: boolean;
  /** Show profile/avatar in nav */
  showProfile?: boolean;
}

export default function ArcadeLayout({
  children,
  accentColor = arcade.colors.accent.primary,
  logoIcon = '🎮',
  title = 'GAME HUB',
  profileAvatar,
  rightLabel,
  showSettings = true,
  showProfile = true,
}: ArcadeLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    setSettingsOpen(false);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        color: arcade.colors.text,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: arcade.font.body,
      }}
    >
      {/* Top nav — Steam / Nintendo style */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          height: 64,
          borderBottom: `1px solid ${arcade.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px 0 28px',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(14px)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [1, 0.9, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: arcade.shadow.glow(accentColor),
            }}
          >
            {logoIcon}
          </motion.div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: arcade.colors.text,
              letterSpacing: '-0.02em',
              fontFamily: arcade.font.display,
            }}
          >
            {title}
          </span>
        </div>

        {/* Right: profile, settings, online */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {rightLabel && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: arcade.colors.textMuted,
                letterSpacing: '0.06em',
              }}
            >
              {rightLabel}
            </div>
          )}

          {showProfile && profileAvatar && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: arcade.colors.surface,
                border: `1px solid ${arcade.colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              {profileAvatar}
            </motion.div>
          )}

          {showSettings && (
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setSettingsOpen((o) => !o)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${arcade.colors.border}`,
                  background: settingsOpen ? arcade.colors.surfaceHover : arcade.colors.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ⚙️
              </motion.button>

              <AnimatePresence>
                {settingsOpen && (
                  <>
                    <motion.div
                      aria-hidden
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSettingsOpen(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 20,
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 8,
                        minWidth: 200,
                        padding: 12,
                        borderRadius: arcade.radius.lg,
                        background: 'rgba(15,13,26,0.98)',
                        border: `1px solid ${arcade.colors.border}`,
                        boxShadow: arcade.shadow.lg,
                        zIndex: 21,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: arcade.colors.textMuted,
                          marginBottom: 10,
                        }}
                      >
                        Paramètres
                      </div>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          padding: '8px 0',
                        }}
                      >
                        <span style={{ fontSize: 13, color: arcade.colors.text }}>Sons</span>
                        <button
                          onClick={handleToggleSound}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: soundOn ? accentColor : arcade.colors.surfaceRaised,
                            color: soundOn ? '#fff' : arcade.colors.textMuted,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {soundOn ? 'ON' : 'OFF'}
                        </button>
                      </label>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}
