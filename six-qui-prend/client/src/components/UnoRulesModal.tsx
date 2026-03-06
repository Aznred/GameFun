import React from 'react';
import GameRulesModal, { RulesSection } from './GameRulesModal';

const SECTIONS: RulesSection[] = [
  {
    icon: '🃏',
    title: 'Le Jeu',
    color: '#f97316',
    content: [
      '108 cartes en tout : 4 couleurs (Rouge, Bleu, Vert, Jaune)',
      'Chaque joueur reçoit 7 cartes au départ',
      'Une carte est retournée face visible pour démarrer la défausse',
      'But : être le premier à se débarrasser de toutes ses cartes',
    ],
  },
  {
    icon: '🔄',
    title: 'Déroulement d\'un tour',
    color: '#22c55e',
    content: [
      'À votre tour, jouez une carte qui correspond à la couleur OU au symbole/chiffre de la défausse',
      'Si vous ne pouvez pas jouer, piochez une carte',
      'La carte piochée peut être jouée immédiatement si elle est compatible',
      'Si elle ne l\'est pas, votre tour se termine',
    ],
  },
  {
    icon: '🃏',
    title: 'Composition du deck',
    color: '#3b82f6',
    rows: [
      { label: '0 (×1 par couleur)', value: '4 cartes', badge: 'Chiffre', badgeColor: '#64748b' },
      { label: '1–9 (×2 par couleur)', value: '72 cartes', badge: 'Chiffre', badgeColor: '#64748b' },
      { label: 'Passe-ton-tour (×2/couleur)', value: '8 cartes', badge: 'Action', badgeColor: '#f59e0b' },
      { label: 'Inversion (×2/couleur)', value: '8 cartes', badge: 'Action', badgeColor: '#f59e0b' },
      { label: '+2 (×2 par couleur)', value: '8 cartes', badge: 'Action', badgeColor: '#f59e0b' },
      { label: 'Joker (Sauvage)', value: '4 cartes', badge: 'Spéciale', badgeColor: '#a855f7' },
      { label: 'Joker +4', value: '4 cartes', badge: 'Spéciale', badgeColor: '#a855f7' },
    ],
  },
  {
    icon: '⚡',
    title: 'Cartes spéciales',
    color: '#f59e0b',
    content: [
      '🚫 Passe-ton-tour — Le joueur suivant perd son tour.',
      '🔄 Inversion — Le sens du jeu s\'inverse (horaire → anti-horaire).',
      '➕ +2 Pioche — Le joueur suivant pioche 2 cartes et passe son tour.',
      '🌈 Joker — Choisissez librement la couleur active pour le prochain tour.',
      '🌈➕4 Joker +4 — Choisissez la couleur ET le joueur suivant pioche 4 cartes et passe.',
    ],
  },
  {
    icon: '📢',
    title: 'Règle UNO !',
    color: '#ef4444',
    content: [
      'Quand il ne vous reste plus qu\'UNE carte, criez "UNO !" avant de jouer !',
      'Si vous oubliez et qu\'un adversaire le remarque avant votre prochain tour, vous piochez 2 cartes de pénalité.',
      'Vous pouvez aussi crier "UNO !" sur un autre joueur s\'il n\'a pas annoncé avec une seule carte.',
      'Le bouton UNO ! dans le jeu gère cela automatiquement.',
    ],
  },
  {
    icon: '🏆',
    title: 'Scores & Victoire',
    color: '#a855f7',
    content: [
      'Le premier joueur à vider sa main gagne la manche et marque des points.',
      'Les points correspondent aux cartes restantes dans les mains adverses.',
      'Cartes 0–9 : valeur nominale — Passe/Inversion/+2 : 20 pts — Joker/Joker+4 : 50 pts',
      'Premier joueur à atteindre 500 points remporte la partie !',
    ],
  },
];

export default function UnoRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <GameRulesModal
      onClose={onClose}
      gameName="UNO"
      gameEmoji="🃏"
      headerGradient="linear-gradient(90deg, #dc2626 0%, #f97316 100%)"
      sections={SECTIONS}
    />
  );
}
