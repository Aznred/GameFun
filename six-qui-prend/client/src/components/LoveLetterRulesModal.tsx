import React from 'react';
import GameRulesModal, { RulesSection } from './GameRulesModal';

const SECTIONS: RulesSection[] = [
  {
    icon: '💌',
    title: 'Le Jeu',
    color: '#c084fc',
    content: [
      '16 cartes en tout, numérotées de 1 (Garde) à 8 (Princesse)',
      'Chaque joueur commence avec UNE carte en main',
      'Au début de la partie, une carte est retirée du jeu (face cachée)',
      'But : avoir la carte la plus haute à la fin de la manche, ou éliminer tous vos adversaires',
    ],
  },
  {
    icon: '🔄',
    title: 'Déroulement d\'un tour',
    color: '#f472b6',
    content: [
      'À votre tour, vous piochez UNE carte (vous en avez maintenant 2)',
      'Vous choisissez laquelle jouer et l\'autre reste en main',
      'La carte jouée déclenche son effet (voir le tableau des cartes)',
      'La manche se termine quand le deck est vide OU qu\'un seul joueur est encore en jeu',
    ],
  },
  {
    icon: '🃏',
    title: 'Les 8 cartes',
    color: '#e879f9',
    rows: [
      { label: '1 · Garde (×5)', value: 'Devinez', badge: 'Très courant', badgeColor: '#94a3b8' },
      { label: '2 · Prêtre (×2)', value: 'Espionner', badge: 'Courant', badgeColor: '#64748b' },
      { label: '3 · Baron (×2)', value: 'Comparer', badge: 'Courant', badgeColor: '#64748b' },
      { label: '4 · Servante (×2)', value: 'Protection', badge: 'Courant', badgeColor: '#64748b' },
      { label: '5 · Prince (×2)', value: 'Défausser', badge: 'Rare', badgeColor: '#f59e0b' },
      { label: '6 · Roi (×1)', value: 'Échanger', badge: 'Rare', badgeColor: '#f59e0b' },
      { label: '7 · Comtesse (×1)', value: 'Contrainte', badge: 'Unique', badgeColor: '#ef4444' },
      { label: '8 · Princesse (×1)', value: 'Perdre si jouée', badge: 'Unique', badgeColor: '#ef4444' },
    ],
  },
  {
    icon: '⚔️',
    title: 'Effets des cartes',
    color: '#f43f5e',
    content: [
      '1 Garde — Devinez la carte d\'un adversaire (pas le 1). Si correct : il est éliminé.',
      '2 Prêtre — Regardez secrètement la main d\'un autre joueur.',
      '3 Baron — Comparez votre carte avec un adversaire. Celui avec la valeur la plus basse est éliminé.',
      '4 Servante — Vous êtes protégé(e) des effets adverses jusqu\'à votre prochain tour.',
      '5 Prince — Forcez un joueur (vous inclus) à se défausser et à piocher une nouvelle carte.',
      '6 Roi — Échangez votre main avec un adversaire.',
      '7 Comtesse — Doit être jouée si vous avez aussi le Roi (6) ou le Prince (5) en main.',
      '8 Princesse — Si vous jouez ou perdez cette carte, vous êtes immédiatement éliminé(e).',
    ],
  },
  {
    icon: '🏆',
    title: 'Victoire',
    color: '#f59e0b',
    content: [
      'La manche se termine : deck vide ou 1 seul joueur en jeu',
      'Si le deck est vide : le joueur avec la carte la plus haute gagne',
      'En cas d\'égalité : celui qui a la somme la plus haute des cartes défaussées',
      'Le vainqueur gagne un Jeton d\'Affection 💎',
      'Premier à avoir assez de jetons (varie selon le nombre de joueurs) remporte la partie',
    ],
  },
  {
    icon: '💎',
    title: 'Jetons d\'Affection',
    color: '#06b6d4',
    rows: [
      { label: '2 joueurs', value: '7 jetons' },
      { label: '3 joueurs', value: '5 jetons' },
      { label: '4 joueurs', value: '4 jetons' },
      { label: '5 joueurs', value: '3 jetons' },
      { label: '6+ joueurs', value: '3 jetons' },
    ],
  },
];

export default function LoveLetterRulesModal({ onClose }: { onClose: () => void }) {
  return (
    <GameRulesModal
      onClose={onClose}
      gameName="Love Letter"
      gameEmoji="💌"
      headerGradient="linear-gradient(90deg, #7c3aed 0%, #db2777 100%)"
      sections={SECTIONS}
    />
  );
}
