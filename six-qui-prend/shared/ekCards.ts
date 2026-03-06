export type EKCardType =
  | 'exploding_kitten'
  | 'defuse'
  | 'attack'
  | 'skip'
  | 'favor'
  | 'shuffle'
  | 'see_the_future'
  | 'nope'
  | 'cat_tacocat'
  | 'cat_potato'
  | 'cat_beard'
  | 'cat_watermelon'
  | 'cat_rainbow';

export interface EKCard {
  id: string;
  type: EKCardType;
}

export const EK_CARD_LABELS: Record<EKCardType, string> = {
  exploding_kitten: 'Chaton Explosif',
  defuse: 'Désamorçage',
  attack: 'Attaque',
  skip: 'Passe',
  favor: 'Faveur',
  shuffle: 'Mélange',
  see_the_future: "Voir l'Avenir",
  nope: 'Non !',
  cat_tacocat: 'TacoCat',
  cat_potato: 'Patate',
  cat_beard: 'Barbu',
  cat_watermelon: 'Pastèque',
  cat_rainbow: 'Arc-en-ciel',
};

export const EK_CARD_EMOJIS: Record<EKCardType, string> = {
  exploding_kitten: '💣',
  defuse: '🔧',
  attack: '⚔️',
  skip: '⏭',
  favor: '🙏',
  shuffle: '🔀',
  see_the_future: '🔮',
  nope: '🚫',
  cat_tacocat: '🌮',
  cat_potato: '🥔',
  cat_beard: '🧔',
  cat_watermelon: '🍉',
  cat_rainbow: '🌈',
};

export const EK_CARD_COLORS: Record<EKCardType, string> = {
  exploding_kitten: '#ef4444',
  defuse: '#22c55e',
  attack: '#f97316',
  skip: '#3b82f6',
  favor: '#ec4899',
  shuffle: '#a855f7',
  see_the_future: '#06b6d4',
  nope: '#dc2626',
  cat_tacocat: '#f59e0b',
  cat_potato: '#84cc16',
  cat_beard: '#8b5cf6',
  cat_watermelon: '#10b981',
  cat_rainbow: '#f472b6',
};

export const EK_CARD_DESC: Record<EKCardType, string> = {
  exploding_kitten: 'Vous explosez ! Sauf si vous avez un Désamorçage.',
  defuse: 'Annule un Chaton Explosif. Remettez-le où vous voulez dans le deck.',
  attack: 'Terminez votre tour sans piocher. Le joueur suivant prend 2 tours.',
  skip: 'Terminez votre tour sans piocher.',
  favor: 'Un adversaire doit vous donner une carte de son choix.',
  shuffle: 'Mélangez la pioche.',
  see_the_future: 'Regardez les 3 prochaines cartes du deck.',
  nope: 'Annulez une carte jouée par un autre joueur.',
  cat_tacocat: 'Jouez en paire pour voler une carte aléatoire à un adversaire.',
  cat_potato: 'Jouez en paire pour voler une carte aléatoire à un adversaire.',
  cat_beard: 'Jouez en paire pour voler une carte aléatoire à un adversaire.',
  cat_watermelon: 'Jouez en paire pour voler une carte aléatoire à un adversaire.',
  cat_rainbow: 'Jouez en paire pour voler une carte aléatoire à un adversaire.',
};

export const EK_CAT_TYPES: EKCardType[] = [
  'cat_tacocat', 'cat_potato', 'cat_beard', 'cat_watermelon', 'cat_rainbow',
];

export function isActionCard(type: EKCardType): boolean {
  return ['attack', 'skip', 'favor', 'shuffle', 'see_the_future'].includes(type);
}

export function isCatCard(type: EKCardType): boolean {
  return EK_CAT_TYPES.includes(type);
}

let _ekIdCounter = 0;
function mkId(prefix = 'ek'): string {
  return `${prefix}-${++_ekIdCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

function card(type: EKCardType): EKCard {
  return { id: mkId(type.slice(0, 4)), type };
}

/** Generate the base deck (no exploding kittens, no defuses) */
export function generateEKBaseDeck(): EKCard[] {
  return [
    // Action cards
    card('attack'), card('attack'), card('attack'), card('attack'),
    card('skip'), card('skip'), card('skip'), card('skip'),
    card('shuffle'), card('shuffle'), card('shuffle'), card('shuffle'),
    card('see_the_future'), card('see_the_future'), card('see_the_future'),
    card('see_the_future'), card('see_the_future'),
    card('favor'), card('favor'), card('favor'), card('favor'), card('favor'),
    card('nope'), card('nope'), card('nope'), card('nope'), card('nope'),
    // Cat cards (4 of each)
    card('cat_tacocat'), card('cat_tacocat'), card('cat_tacocat'), card('cat_tacocat'),
    card('cat_potato'), card('cat_potato'), card('cat_potato'), card('cat_potato'),
    card('cat_beard'), card('cat_beard'), card('cat_beard'), card('cat_beard'),
    card('cat_watermelon'), card('cat_watermelon'), card('cat_watermelon'), card('cat_watermelon'),
    card('cat_rainbow'), card('cat_rainbow'), card('cat_rainbow'), card('cat_rainbow'),
  ];
}
