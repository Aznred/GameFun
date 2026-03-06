import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RulesModalProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    icon: '🃏',
    title: 'Le Jeu',
    color: '#3b82f6',
    content: [
      '104 cartes numérotées de 1 à 104',
      'Chaque carte a des têtes de bœuf (points de pénalité)',
      'Chaque joueur reçoit 10 cartes au début',
      '4 rangées de départ sont posées sur la table (1 carte chacune)',
    ],
  },
  {
    icon: '🔄',
    title: 'Déroulement d\'un tour',
    color: '#10b981',
    content: [
      'Tous les joueurs choisissent une carte secrètement',
      'Toutes les cartes sont révélées simultanément',
      'Les cartes sont placées de la plus petite à la plus grande',
      'Chaque carte va dans la rangée dont la dernière carte est la plus proche (en dessous)',
    ],
  },
  {
    icon: '💥',
    title: 'Rangée pleine',
    color: '#f59e0b',
    content: [
      'Quand une rangée atteint 6 cartes, elle est pleine',
      'Le joueur qui pose la 6ème carte récupère les 5 premières',
      'Ces cartes = leurs têtes de bœuf = vos points de pénalité',
      'Sa carte démarre une nouvelle rangée',
    ],
  },
  {
    icon: '😱',
    title: 'Carte trop petite',
    color: '#ef4444',
    content: [
      'Si votre carte est plus petite que la dernière carte de TOUTES les rangées…',
      'Vous devez choisir UNE rangée à récupérer',
      'Vous prenez toutes les cartes de cette rangée (= pénalités)',
      'Votre carte démarre la rangée vide',
    ],
  },
  {
    icon: '🐂',
    title: 'Valeur des cartes (têtes de bœuf)',
    color: '#8b5cf6',
    rows: [
      { label: 'Carte normale', value: '1 tête', bullets: 1 },
      { label: 'Multiple de 5 (sauf 55)', value: '2 têtes', bullets: 2 },
      { label: 'Multiple de 10', value: '3 têtes', bullets: 3 },
      { label: 'Multiple de 11', value: '5 têtes', bullets: 5 },
      { label: 'Carte 55 (×5 ET ×11)', value: '7 têtes', bullets: 7 },
    ],
  },
  {
    icon: '🏆',
    title: 'Fin de partie',
    color: '#f59e0b',
    content: [
      'La partie se termine quand tous les joueurs ont joué leurs 10 cartes',
      'Les points de pénalité s\'accumulent à chaque rangée capturée',
      'Le joueur avec LE MOINS de têtes de bœuf gagne',
      'En cas d\'égalité, les deux joueurs partagent la victoire',
    ],
  },
];

function BullDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        margin: '0 1px',
        verticalAlign: 'middle',
      }}
    />
  );
}

export default function RulesModal({ onClose }: RulesModalProps) {
  const [activeSection, setActiveSection] = useState(0);
  const section = SECTIONS[activeSection];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)', border: '2px solid rgba(255,255,255,0.1)' }}
        >
          {/* ── Header ── */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg, #1d4ed8 0%, #7c3aed 100%)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <div>
                <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 22, color: 'white', lineHeight: 1.1 }}>
                  Règles du jeu
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Nunito, sans-serif' }}>
                  6 Qui Prend !
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

          {/* ── Tabs de navigation ── */}
          <div className="flex overflow-x-auto gap-1 px-4 py-3 scrollbar-hide" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {SECTIONS.map((s, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection(i)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all shrink-0"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  background: activeSection === i ? s.color : 'rgba(255,255,255,0.06)',
                  color: activeSection === i ? 'white' : 'rgba(255,255,255,0.55)',
                  border: activeSection === i ? `2px solid ${s.color}88` : '2px solid transparent',
                }}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.title.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>

          {/* ── Contenu ── */}
          <div className="p-6 min-h-[260px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Titre section */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
                    style={{ background: section.color }}
                  >
                    {section.icon}
                  </div>
                  <h3 style={{
                    fontFamily: 'Fredoka One, cursive',
                    fontSize: 20,
                    color: section.color,
                  }}>
                    {section.title}
                  </h3>
                </div>

                {/* Contenu liste */}
                {section.content && (
                  <div className="space-y-3">
                    {section.content.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3 rounded-xl p-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black text-white mt-0.5"
                          style={{ background: section.color }}
                        >
                          {i + 1}
                        </div>
                        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tableau des valeurs de cartes */}
                {section.rows && (
                  <div className="space-y-2">
                    {section.rows.map((row, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                          {row.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: row.bullets }).map((_, j) => (
                              <BullDot key={j} color={section.color} />
                            ))}
                          </div>
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

          {/* ── Footer navigation ── */}
          <div className="flex items-center justify-between px-6 pb-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="px-4 py-2 rounded-xl font-bold text-sm transition-all"
              style={{
                fontFamily: 'Nunito, sans-serif',
                background: activeSection === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                color: activeSection === 0 ? 'rgba(255,255,255,0.25)' : 'white',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              ← Précédent
            </motion.button>

            {/* Indicateurs de page */}
            <div className="flex gap-1.5">
              {SECTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSection(i)}
                  style={{
                    width: activeSection === i ? 20 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: activeSection === i ? section.color : 'rgba(255,255,255,0.2)',
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
              onClick={() => {
                if (activeSection < SECTIONS.length - 1) setActiveSection(activeSection + 1);
                else onClose();
              }}
              className="px-4 py-2 rounded-xl font-bold text-sm text-white"
              style={{
                fontFamily: 'Nunito, sans-serif',
                background: activeSection === SECTIONS.length - 1
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : `linear-gradient(90deg, ${section.color}, ${section.color}cc)`,
                border: 'none',
              }}
            >
              {activeSection === SECTIONS.length - 1 ? 'Jouer ! 🎮' : 'Suivant →'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
