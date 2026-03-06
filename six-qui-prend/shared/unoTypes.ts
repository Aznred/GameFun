import { UnoCard, UnoColor } from './unoCards';

// ─── Game phases ──────────────────────────────────────────────────────────────

export type UnoGamePhase =
  | 'playing'             // Normal turn, current player acts
  | 'awaiting_draw'       // Player drew a playable card – decide to play or pass
  | 'color_pick'          // Player played wild – must choose color
  | 'round_end'           // A player emptied hand – round over
  | 'game_over';          // A player reached target score

// ─── Action log ───────────────────────────────────────────────────────────────

export interface UnoActionLog {
  playerId: string;
  playerName: string;
  action: 'play' | 'draw' | 'play_drawn' | 'pass' | 'uno' | 'uno_penalty' | 'color_chosen';
  card?: UnoCard;
  chosenColor?: UnoColor;
  drawCount?: number;
}

// ─── Server state ─────────────────────────────────────────────────────────────

export interface UnoServerPlayerState {
  hand: UnoCard[];
  score: number;
  hasCalledUno: boolean;
  isConnected: boolean;
}

export interface UnoServerGameState {
  deck: UnoCard[];
  discardPile: UnoCard[];
  currentColor: UnoColor;
  players: Record<string, UnoServerPlayerState>;
  playerOrder: string[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  phase: UnoGamePhase;
  pendingDrawCount: number;       // set for wild_draw_four awaiting color
  pendingColorPickBy: string | null;
  drawnCardId: string | null;     // during awaiting_draw phase
  lastAction: UnoActionLog | null;
  roundNumber: number;
  unoCallPendingFor: string | null;
  gameWinnerId: string | null;
  roundWinnerId: string | null;
  targetScore: number;
}

// ─── Client state ─────────────────────────────────────────────────────────────

export interface UnoClientPlayerSummary {
  id: string;
  name: string;
  avatar: string;
  handSize: number;
  score: number;
  hasCalledUno: boolean;
  isCurrentPlayer: boolean;
  isConnected: boolean;
}

export interface UnoClientGameState {
  hand: UnoCard[];
  players: UnoClientPlayerSummary[];
  topCard: UnoCard;
  currentColor: UnoColor;
  currentPlayerId: string;
  isMyTurn: boolean;
  phase: UnoGamePhase;
  direction: 1 | -1;
  deckSize: number;
  pendingDrawCount: number;
  drawnCardId: string | null;
  lastAction: UnoActionLog | null;
  roundNumber: number;
  gameWinnerId: string | null;
  roundWinnerId: string | null;
  targetScore: number;
  canCallUno: boolean;
  playableCardIds: string[];
}
