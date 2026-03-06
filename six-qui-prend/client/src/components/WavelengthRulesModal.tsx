import React from 'react';
import GameRulesModal, { RulesSection } from './GameRulesModal';

const SECTIONS: RulesSection[] = [
  {
    icon: '🌊',
    title: 'Le Jeu',
    color: '#a855f7',
    content: [
      'Jeu de devinettes basé sur un spectre entre deux extrêmes (ex : CHAUD ↔ FROID)',
      'Les joueurs jouent chacun pour soi — celui avec le plus de points gagne',
      'Chaque joueur sera Psychique UNE fois (rotation automatique)',
      'La partie dure exactement autant de manches qu\'il y a de joueurs',
    ],
  },
  {
    icon: '🔮',
    title: 'Rôle du Psychique',
    color: '#7c3aed',
    content: [
      'Le Psychique voit une position secrète sur le spectre (ex : 72% vers CHAUD)',
      'Il doit donner UN seul indice (un mot, une phrase courte) qui pointe vers cette position',
      'L\'indice ne peut pas être l\'un des deux extrêmes du spectre',
      'L\'objectif est d\'aider les autres joueurs à deviner le plus précisément possible',
    ],
  },
  {
    icon: '🎯',
    title: 'Rôle des Devineurs',
    color: '#06b6d4',
    content: [
      'Les devineurs voient le spectre et l\'indice du Psychique',
      'Chacun fait tourner son propre cadran indépendamment pour placer son curseur',
      'Une fois satisfait de votre position, cliquez "Confirmer"',
      'Impossible de modifier après avoir confirmé — vos coéquipiers ne voient pas votre curseur avant la révélation',
    ],
  },
  {
    icon: '📊',
    title: 'Système de score',
    color: '#f59e0b',
    rows: [
      { label: 'Zone centrale (diff ≤ 4%)', value: '4 points', badge: '🎯 Parfait', badgeColor: '#f59e0b' },
      { label: 'Zone proche (diff ≤ 12%)', value: '3 points', badge: '✅ Excellent', badgeColor: '#22c55e' },
      { label: 'Zone éloignée (diff ≤ 22%)', value: '2 points', badge: '👍 Bien', badgeColor: '#3b82f6' },
      { label: 'Zone limite (diff ≤ 34%)', value: '1 point', badge: '😐 Passable', badgeColor: '#94a3b8' },
      { label: 'Raté (diff > 34%)', value: '0 point', badge: '❌ Raté', badgeColor: '#ef4444' },
    ],
  },
  {
    icon: '🔄',
    title: 'Déroulement d\'une manche',
    color: '#10b981',
    content: [
      '1. Le Psychique est désigné automatiquement (rotation dans l\'ordre des joueurs)',
      '2. Un spectre aléatoire est généré et la cible secrète est placée sur le cadran',
      '3. Le Psychique saisit son indice et le soumet',
      '4. Tous les autres joueurs positionnent indépendamment leur curseur sur le cadran',
      '5. Quand tout le monde a soumis → révélation automatique',
      '6. Les scores sont affichés, puis la manche suivante commence',
    ],
  },
  {
    icon: '🏆',
    title: 'Fin de partie',
    color: '#f59e0b',
    content: [
      'La partie se termine quand chaque joueur a été Psychique une fois',
      'Le joueur avec le PLUS de points gagne',
      'En cas d\'égalité, plusieurs joueurs peuvent être co-gagnants',
      'Le Psychique ne marque pas de points pendant sa manche — il aide uniquement les autres',
    ],
  },
];

export default function WavelengthRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <GameRulesModal
      onClose={onClose}
      gameName="Wavelength"
      gameEmoji="🌊"
      headerGradient="linear-gradient(90deg, #4c1d95 0%, #7c3aed 100%)"
      sections={SECTIONS}
    />
  );
}
