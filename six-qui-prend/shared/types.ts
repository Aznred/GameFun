// ─── Core domain types ───────────────────────────────────────────────────────

export interface Card {
  number: number;
  bullHeads: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  isConnected: boolean;
  score: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

// ─── Room / Lobby ─────────────────────────────────────────────────────────────

export type RoomPhase = 'lobby' | 'playing' | 'hub' | 'finished';

export interface RoomState {
  code: string;
  hostId: string;
  players: Player[];
  phase: RoomPhase;
  maxPlayers: number;
  chat: ChatMessage[];
  selectedGameId: string | null;
  gameHistory: GameHistoryEntry[];
}

// ─── Game ─────────────────────────────────────────────────────────────────────

export type GamePhase = 'playing' | 'row_selection' | 'round_complete' | 'game_over';

export interface ServerPlayerGameState {
  hand: Card[];
  selectedCard: Card | null;
  score: number;
  takenCards: Card[];
}

export interface ServerGameState {
  rows: Card[][];
  players: Record<string, ServerPlayerGameState>;
  round: number;
  totalRounds: number;
  phase: GamePhase;
  awaitingRowSelection: string | null;
  lastRoundResult: RoundResult | null;
}

/** State sent to each individual client (hand is per-player) */
export interface ClientGameState {
  rows: Card[][];
  myHand: Card[];
  mySelectedCard: Card | null;
  myScore: number;
  players: ClientPlayerSummary[];
  round: number;
  totalRounds: number;
  phase: GamePhase;
  lastRoundResult: RoundResult | null;
}

export interface ClientPlayerSummary {
  id: string;
  name: string;
  avatar: string;
  score: number;
  hasPlayed: boolean;
  isChoosingRow: boolean;
  isConnected: boolean;
}

// ─── Round resolution ────────────────────────────────────────────────────────

export interface PlayResult {
  playerId: string;
  playerName: string;
  card: Card;
  rowIndex: number;
  tookRow: boolean;
  pointsGained: number;
  rowCardsTaken: Card[];
}

export interface RoundResult {
  round: number;
  plays: PlayResult[];
  scores: Record<string, number>;
}

export interface GameEndResult {
  players: Array<{
    id: string;
    name: string;
    avatar: string;
    score: number;
    rank: number;
  }>;
  winnerId: string;
  gameId: string;
}

export interface GameHistoryEntry {
  gameId: string;
  gameName: string;
  playedAt: number;
  winnerId: string;
  winnerName: string;
  scores: Record<string, number>;
}

// ─── Socket events ───────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  room_state: (room: RoomState) => void;
  game_start: (state: ClientGameState) => void;
  game_state: (state: ClientGameState) => void;
  round_result: (result: RoundResult) => void;
  choose_row: (data: { card: Card; round: number }) => void;
  game_end: (result: GameEndResult) => void;
  error: (message: string) => void;
  kicked: (reason: string) => void;
  chat_message: (message: ChatMessage) => void;
  player_disconnected: (playerId: string) => void;
  player_reconnected: (playerId: string) => void;
  // ── Love Letter ──────────────────────────────────────────────────────────────
  ll_game_state: (state: import('./loveLetterTypes').LLClientGameState) => void;
  ll_peek: (card: import('./loveLetterCards').LLCard) => void;
  // ── UNO ──────────────────────────────────────────────────────────────────────
  uno_game_state: (state: import('./unoTypes').UnoClientGameState) => void;
  // ── Wavelength ───────────────────────────────────────────────────────────────
  wl_game_state: (state: import('./wavelengthTypes').WlClientState) => void;
  // ── Exploding Kittens ────────────────────────────────────────────────────────
  ek_game_state: (state: import('./ekTypes').EKClientState) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { playerName: string; avatar: string; selectedGameId?: string }, cb: (res: { roomCode: string; playerId: string } | { error: string }) => void) => void;
  join_room: (data: { roomCode: string; playerName: string; avatar: string }, cb: (res: { ok: boolean; playerId: string } | { error: string }) => void) => void;
  leave_room: () => void;
  ready_player: (isReady: boolean) => void;
  start_game: () => void;
  play_card: (cardNumber: number) => void;
  select_row: (rowIndex: number) => void;
  kick_player: (playerId: string) => void;
  send_chat: (message: string) => void;
  reconnect_player: (data: { roomCode: string; playerId: string }) => void;
  select_game: (gameId: string) => void;
  return_to_hub: () => void;
  // ── Love Letter ──────────────────────────────────────────────────────────────
  ll_play_card: (data: { cardId: import('./loveLetterCards').LLCardId; targetId?: string; guess?: import('./loveLetterCards').LLCardId }) => void;
  ll_next_round: () => void;
  // ── UNO ──────────────────────────────────────────────────────────────────────
  uno_play_card: (cardId: string) => void;
  uno_draw_card: () => void;
  uno_pass_turn: () => void;
  uno_choose_color: (color: import('./unoCards').UnoColor) => void;
  uno_call_uno: (targetId: string) => void;
  uno_next_round: () => void;
  // ── Wavelength ───────────────────────────────────────────────────────────────
  wl_submit_clue: (clue: string) => void;
  wl_submit_guess: (position: number) => void;
  wl_next_round: () => void;
  wl_start_round: () => void;
  // ── Exploding Kittens ────────────────────────────────────────────────────────
  ek_play_card: (cardId: string) => void;
  ek_play_pair: (data: { cardId1: string; cardId2: string }) => void;
  ek_play_nope: (cardId: string) => void;
  ek_draw_card: () => void;
  ek_select_target: (targetPlayerId: string) => void;
  ek_favor_give: (cardId: string) => void;
  ek_insert_kitten: (position: number) => void;
}

export interface InterServerEvents {}
export interface SocketData {
  playerId: string;
  roomCode: string | null;
  playerName: string;
  avatar: string;
}
