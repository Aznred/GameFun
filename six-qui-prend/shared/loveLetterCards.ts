// ─── Love Letter — Définitions des cartes ────────────────────────────────────

export type LLCardId =
  | 'guard' | 'priest' | 'baron' | 'handmaid'
  | 'prince' | 'king' | 'countess' | 'princess';

export interface LLCardDef {
  id: LLCardId;
  value: number;
  nameFr: string;
  emoji: string;
  count: number;
  description: string;
  requiresTarget: boolean;
  requiresGuess: boolean;
  canTargetSelf: boolean;
  color: string;
  bg: string;
}

export const LL_CARD_DEFS: LLCardDef[] = [
  {
    id: 'guard', value: 1, nameFr: 'Garde', emoji: '⚔️', count: 5,
    description: 'Devinez la carte d\'un joueur (pas le Garde). S\'il la tient, il est éliminé.',
    requiresTarget: true, requiresGuess: true, canTargetSelf: false,
    color: '#94a3b8', bg: 'linear-gradient(145deg, #1e293b, #334155)',
  },
  {
    id: 'priest', value: 2, nameFr: 'Prêtre', emoji: '🕊️', count: 2,
    description: 'Regardez secrètement la main d\'un autre joueur.',
    requiresTarget: true, requiresGuess: false, canTargetSelf: false,
    color: '#60a5fa', bg: 'linear-gradient(145deg, #1e3a5f, #1e40af)',
  },
  {
    id: 'baron', value: 3, nameFr: 'Baron', emoji: '🛡️', count: 2,
    description: 'Comparez vos mains. La carte la plus basse est éliminée.',
    requiresTarget: true, requiresGuess: false, canTargetSelf: false,
    color: '#4ade80', bg: 'linear-gradient(145deg, #14532d, #166534)',
  },
  {
    id: 'handmaid', value: 4, nameFr: 'Suivante', emoji: '💐', count: 2,
    description: 'Vous êtes protégé(e) des effets jusqu\'à votre prochain tour.',
    requiresTarget: false, requiresGuess: false, canTargetSelf: false,
    color: '#c084fc', bg: 'linear-gradient(145deg, #4a1d96, #6d28d9)',
  },
  {
    id: 'prince', value: 5, nameFr: 'Prince', emoji: '🤴', count: 2,
    description: 'Un joueur (ou vous) défausse sa main et en pioche une nouvelle.',
    requiresTarget: true, requiresGuess: false, canTargetSelf: true,
    color: '#fb923c', bg: 'linear-gradient(145deg, #7c2d12, #c2410c)',
  },
  {
    id: 'king', value: 6, nameFr: 'Roi', emoji: '👑', count: 1,
    description: 'Échangez votre main avec celle d\'un autre joueur.',
    requiresTarget: true, requiresGuess: false, canTargetSelf: false,
    color: '#fbbf24', bg: 'linear-gradient(145deg, #78350f, #b45309)',
  },
  {
    id: 'countess', value: 7, nameFr: 'Comtesse', emoji: '👸', count: 1,
    description: 'Doit être jouée si vous tenez le Roi ou le Prince en main.',
    requiresTarget: false, requiresGuess: false, canTargetSelf: false,
    color: '#f472b6', bg: 'linear-gradient(145deg, #831843, #9d174d)',
  },
  {
    id: 'princess', value: 8, nameFr: 'Princesse', emoji: '💌', count: 1,
    description: 'Si vous la défaussez pour quelque raison que ce soit, vous êtes éliminé(e).',
    requiresTarget: false, requiresGuess: false, canTargetSelf: false,
    color: '#f87171', bg: 'linear-gradient(145deg, #7f1d1d, #991b1b)',
  },
];

export function getLLCardDef(id: LLCardId): LLCardDef {
  return LL_CARD_DEFS.find((c) => c.id === id)!;
}

export interface LLCard {
  id: LLCardId;
  value: number;
  nameFr: string;
  emoji: string;
}

export function makeLLCard(id: LLCardId): LLCard {
  const d = getLLCardDef(id);
  return { id: d.id, value: d.value, nameFr: d.nameFr, emoji: d.emoji };
}

export function generateLLDeck(): LLCard[] {
  const deck: LLCard[] = [];
  for (const def of LL_CARD_DEFS) {
    for (let i = 0; i < def.count; i++) deck.push(makeLLCard(def.id));
  }
  return deck;
}

export function getTokensToWin(playerCount: number): number {
  if (playerCount <= 2) return 7;
  if (playerCount === 3) return 5;
  if (playerCount === 4) return 4;
  return 3;
}
