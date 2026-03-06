import type { GameCardData } from '../components/cards/GameCard';

export const GAMES: GameCardData[] = [
  { id: 'six-qui-prend', name: '6 Qui Prend !', icon: '🐄', tagline: 'Ne prenez pas la 6ème carte', players: '2–10', duration: '20 min', available: true, color: '#4ade80', tags: ['Famille', 'Stratégie'], desc: 'Évitez les têtes de bœuf ! Chaque tour, tous jouent une carte simultanément. Celui qui place la 6ème carte d\'une rangée ramasse les pénalités.' },
  { id: 'love-letter', name: 'Love Letter', icon: '💌', tagline: 'Livrez votre lettre à la Princesse', players: '2–6', duration: '15 min', available: true, color: '#c084fc', tags: ['Bluff', 'Déduction'], desc: 'Bluff et déduction en 16 cartes. Éliminez vos adversaires ou finissez avec la carte la plus haute pour gagner des jetons d\'affection.' },
  { id: 'uno', name: 'UNO', icon: '🃏', tagline: 'Videz votre main en premier', players: '2–10', duration: '30 min', available: true, color: '#f87171', tags: ['Famille', 'Action'], desc: 'Jouez des cartes de même couleur ou valeur. Utilisez les cartes spéciales et n\'oubliez pas de crier UNO quand il vous reste 1 carte !' },
  { id: 'wavelength', name: 'Wavelength', icon: '🌊', tagline: 'Devinez la position sur le spectre', players: '2–12', duration: '25 min', available: true, color: '#818cf8', tags: ['Social', 'Créatif'], desc: 'Le Psychique voit une cible secrète sur un spectre et donne un indice. Les autres tournent le cadran pour deviner l\'emplacement exact.' },
  { id: 'exploding-kittens', name: 'Exploding Kittens', icon: '💣', tagline: 'Survivez... ou explosez !', players: '2–10', duration: '15 min', available: true, color: '#fb923c', tags: ['Famille', 'Humour'], desc: 'Roulette russe en cartes ! Piochez sans tomber sur un Chaton Explosif. Nopez vos adversaires, voyez l\'avenir et soyez le dernier survivant.' },
  { id: 'skull', name: 'Skull', icon: '💀', tagline: 'Bluff pur, roses ou crânes', players: '3–6', duration: '20 min', available: false, color: '#64748b', tags: ['Bluff'], desc: 'Posez roses ou crânes face cachée, puis misez sur combien vous pouvez retourner sans toucher un crâne. Bluff psychologique pur.' },
  { id: 'hanabi', name: 'Hanabi', icon: '🎆', tagline: 'Coopérez sans voir vos cartes', players: '2–5', duration: '25 min', available: false, color: '#38bdf8', tags: ['Coopératif'], desc: 'Tout le monde voit les cartes des autres, sauf les siennes. Créez le feu d\'artifice parfait ensemble grâce aux indices.' },
  { id: 'sushi-go', name: 'Sushi Go !', icon: '🍣', tagline: 'Choisissez et passez', players: '2–5', duration: '15 min', available: false, color: '#f472b6', tags: ['Rapide', 'Famille'], desc: 'Chaque tour, gardez une carte et passez le reste. Collectez les meilleures combinaisons de sushis.' },
];

export const AVATARS = ['🐮', '🐂', '🐄', '🦬', '🐷', '🐑', '🦊', '🐺', '🦁', '🐯', '🐸', '🐧'];

export const GAME_META: Record<string, { name: string; color: string; icon: string }> = Object.fromEntries(
  GAMES.map((g) => [g.id, { name: g.name, color: g.color, icon: g.icon }])
);
