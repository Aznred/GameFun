// ─── UNO Card types ───────────────────────────────────────────────────────────

export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoCardValue =
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 'skip' | 'reverse' | 'draw_two'
  | 'wild' | 'wild_draw_four';

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoCardValue;
}

// ─── Visual helpers ───────────────────────────────────────────────────────────

export const UNO_COLOR_HEX: Record<UnoColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#ca8a04',
  wild: '#1e1b4b',
};

export const UNO_COLOR_LABEL: Record<UnoColor, string> = {
  red: '🔴 Rouge',
  blue: '🔵 Bleu',
  green: '🟢 Vert',
  yellow: '🟡 Jaune',
  wild: '🌈 Sauvage',
};

export function getCardLabel(value: UnoCardValue): string {
  switch (value) {
    case 'skip': return '⊘';
    case 'reverse': return '⇄';
    case 'draw_two': return '+2';
    case 'wild': return '🌈';
    case 'wild_draw_four': return '+4';
    default: return String(value);
  }
}

export function getCardScore(card: UnoCard): number {
  if (typeof card.value === 'number') return card.value;
  if (card.value === 'skip' || card.value === 'reverse' || card.value === 'draw_two') return 20;
  return 50; // wild, wild_draw_four
}

// ─── Deck generation (108 cards) ─────────────────────────────────────────────

function make(color: UnoColor, value: UnoCardValue, idx: number): UnoCard {
  return { id: `${color}_${value}_${idx}`, color, value };
}

export function generateUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];

  for (const color of colors) {
    deck.push(make(color, 0, 0));                         // 0 × 1
    for (let n = 1; n <= 9; n++) {
      deck.push(make(color, n as UnoCardValue, 0));       // 1–9 × 2
      deck.push(make(color, n as UnoCardValue, 1));
    }
    for (let i = 0; i < 2; i++) {
      deck.push(make(color, 'skip', i));                  // Skip × 2
      deck.push(make(color, 'reverse', i));               // Reverse × 2
      deck.push(make(color, 'draw_two', i));              // Draw Two × 2
    }
  }

  for (let i = 0; i < 4; i++) {
    deck.push(make('wild', 'wild', i));                   // Wild × 4
    deck.push(make('wild', 'wild_draw_four', i));         // Wild Draw Four × 4
  }

  return deck; // 108 cards total
}
