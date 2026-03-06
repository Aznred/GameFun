import React from 'react';
import GameRulesModal from '../GameRulesModal';
import { RulesSection } from '../GameRulesModal';

const SECTIONS: RulesSection[] = [
  {
    icon: '💣',
    title: 'Principe du jeu',
    color: '#ef4444',
    content: [
      "2 à 10 joueurs — gagnez en étant le dernier survivant.",
      "À votre tour : jouez des cartes d'action, puis piochez une carte.",
      "Si vous piochez un Chaton Explosif sans Désamorçage → vous êtes éliminé !",
      "Le dernier joueur en vie remporte la partie.",
    ],
  },
  {
    icon: '🎴',
    title: 'Distribution',
    color: '#06b6d4',
    content: [
      "Chaque joueur reçoit 4 cartes aléatoires + 1 carte Désamorçage.",
      "Le deck contient (N-1) Chatons Explosifs + 2 Désamorçages supplémentaires.",
      "Les cartes sont mélangées secrètement dans la pioche.",
      "Piochez depuis le dessus de la pile à chaque fin de tour.",
    ],
  },
  {
    icon: '⚡',
    title: 'Cartes action',
    color: '#f97316',
    rows: [
      { label: '⚔️ Attaque', value: 'Terminez sans piocher, le suivant prend 2 tours' },
      { label: '⏭ Passe', value: 'Terminez votre tour sans piocher' },
      { label: '🙏 Faveur', value: 'Un joueur cible vous donne une carte de son choix' },
      { label: '🔀 Mélange', value: 'Mélangez la pioche secrètement' },
      { label: '🔮 Voir l\'Avenir', value: 'Regardez les 3 cartes du dessus' },
      { label: '🚫 Non !', value: 'Annulez la carte d\'un autre joueur' },
    ],
  },
  {
    icon: '🐱',
    title: 'Cartes chats (paires)',
    color: '#a855f7',
    content: [
      "Les cartes chats ne se jouent pas seules.",
      "Jouez 2 cartes chats identiques → volez une carte aléatoire à un adversaire.",
      "5 types de chats : TacoCat 🌮, Patate 🥔, Barbu 🧔, Pastèque 🍉, Arc-en-ciel 🌈.",
      "La carte volée est aléatoire — le volé ne choisit pas.",
    ],
  },
  {
    icon: '💣',
    title: 'Chaton Explosif',
    color: '#dc2626',
    content: [
      "Si vous piochez un Chaton Explosif et avez un Désamorçage :",
      "→ Le Désamorçage se joue automatiquement.",
      "→ Vous choisissez où remettre le Chaton dans la pioche.",
      "Sans Désamorçage → vous explosez et êtes éliminé !",
    ],
  },
  {
    icon: '🚫',
    title: 'Règle du Nope',
    color: '#dc2626',
    content: [
      "N'importe quel joueur (sauf l'auteur) peut jouer Nope sur une carte.",
      "Un Nope annule l'effet. Un autre Nope annule le Nope (et ainsi de suite).",
      "Vous avez 3 secondes après la pose d'une carte pour Noper !",
      "Le Nope ne s'applique pas aux Chatons Explosifs ni aux Désamorçages.",
    ],
  },
];

interface Props {
  onClose: () => void;
}

export default function EKRulesModal({ onClose }: Props) {
  return (
    <GameRulesModal
      gameName="Exploding Kittens"
      gameEmoji="💣"
      headerGradient="linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)"
      sections={SECTIONS}
      onClose={onClose}
    />
  );
}
