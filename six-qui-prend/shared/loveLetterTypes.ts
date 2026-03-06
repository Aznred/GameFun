import { LLCard, LLCardId } from './loveLetterCards';

// ─── State types ─────────────────────────────────────────────────────────────

export type LLGamePhase = 'drawing' | 'playing' | 'round_end' | 'game_over';

export interface LLPlayedCard {
  card: LLCard;
  targetId?: string;
  targetCard?: LLCard;
  guess?: LLCardId;
  result: string;
}

export interface LLActionLog {
  playerId: string;
  playerName: string;
  card: LLCard;
  targetId?: string;
  targetName?: string;
  targetCard?: LLCard;
  guess?: LLCardId;
  result: string;
  eliminatedId?: string;
}

// ─── Server state ─────────────────────────────────────────────────────────────

export interface LLServerPlayerState {
  hand: LLCard[];
  isEliminated: boolean;
  isProtected: boolean;
  discardPile: LLPlayedCard[];
}

export interface LLServerGameState {
  deck: LLCard[];
  removedCard: LLCard;
  exposedCards: LLCard[];
  players: Record<string, LLServerPlayerState>;
  playerOrder: string[];
  activePlayers: string[];
  currentPlayerIndex: number;
  phase: LLGamePhase;
  roundNumber: number;
  tokens: Record<string, number>;
  tokensToWin: number;
  roundWinnerId: string | null;
  gameWinnerId: string | null;
  lastAction: LLActionLog | null;
}

// ─── Client state ─────────────────────────────────────────────────────────────

export interface LLClientPlayerSummary {
  id: string;
  name: string;
  avatar: string;
  isEliminated: boolean;
  isProtected: boolean;
  isCurrentPlayer: boolean;
  discardPile: LLPlayedCard[];
  handSize: number;
  tokens: number;
}

export interface LLClientGameState {
  hand: LLCard[];
  players: LLClientPlayerSummary[];
  deckSize: number;
  phase: LLGamePhase;
  roundNumber: number;
  currentPlayerId: string;
  isMyTurn: boolean;
  tokens: Record<string, number>;
  tokensToWin: number;
  roundWinnerId: string | null;
  gameWinnerId: string | null;
  lastAction: LLActionLog | null;
  removedCard: LLCard | null;
  peekCard: LLCard | null;
}
