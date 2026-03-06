import { EKCard } from './ekCards';

export type EKPhase =
  | 'playing'             // Current player's turn (can play cards or draw)
  | 'nope_window'         // Action card played — 3s window for Nope
  | 'awaiting_target'     // Favor or cat-pair played — choose a target player
  | 'awaiting_favor_give' // Target of Favor must choose a card to give
  | 'awaiting_insert'     // Drew EK + played Defuse — choose where to insert kitten
  | 'game_over';

export interface EKServerState {
  phase: EKPhase;
  playerOrder: string[];           // All players (alive + eliminated), fixed order
  currentPlayerIndex: number;
  turnsRemaining: number;          // How many draws current player still needs to make
  hands: Record<string, EKCard[]>;
  deck: EKCard[];                  // Index 0 = bottom, last index = top (draw from end)
  discardPile: EKCard[];
  // Pending action state
  pendingCard: EKCard | null;
  pendingPairCard: EKCard | null;  // second cat card when playing pair
  pendingCardPlayerId: string | null;
  pendingTargetPlayerId: string | null;
  // See the future (private per player)
  seeTheFutureCards: Record<string, EKCard[]>;
  // Elimination
  eliminatedPlayerIds: string[];
  // End state
  winnerIds: string[];
  lastAction: string;
  nopeCount: number;
}

export interface EKPlayerInfo {
  id: string;
  name: string;
  avatar: string;
  handSize: number;
  isAlive: boolean;
  isConnected: boolean;
}

export interface EKClientState {
  phase: EKPhase;
  players: EKPlayerInfo[];
  currentPlayerId: string | null;
  turnsRemaining: number;
  myHand: EKCard[];
  deckSize: number;
  topDiscard: EKCard | null;
  pendingCard: EKCard | null;
  pendingCardPlayerName: string | null;
  pendingTargetPlayerId: string | null;
  seeTheFutureCards: EKCard[] | null;   // Only set for the viewer who played See the Future
  winnerIds: string[];
  winnerNames: string[];
  lastAction: string;
  isMyTurn: boolean;
  amIEliminated: boolean;
  canDrawCard: boolean;
  canPlayNope: boolean;
  isAwaitingMyFavorGive: boolean;
  isSelectingTarget: boolean;
  nopeCount: number;
  nopeWindowSeq: number;              // Increments on each nope window open (for timers)
}
