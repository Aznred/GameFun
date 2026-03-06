// ─── Core domain types ───────────────────────────────────────────────────────

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

export interface GameHistoryEntry {
  gameId: string;
  gameName: string;
  playedAt: number;
  winnerId: string;
  winnerName: string;
  scores: Record<string, number>;
}

// ─── Game IDs (all mini-games) ───────────────────────────────────────────────

export const GAME_IDS = [
  'reaction',
  'meme-battle',
  'truth-lie',
  'drawing-telephone',
  'fake-answer',
  'secret-word-impostor',
  'trivia-battle',
  'bluff-battle',
  'betting-game',
  'chaos-dice',
  'puzzle-race',
  'guess-the-rank',
  'bomb-game',
  'fast-werewolf',
] as const;

export type GameId = (typeof GAME_IDS)[number];

// ─── Generic game end result ──────────────────────────────────────────────────

export interface GameEndResult {
  players: Array<{ id: string; name: string; avatar: string; score: number; rank: number }>;
  winnerId: string;
  gameId: string;
  gameName: string;
}

// ─── Reaction Game ───────────────────────────────────────────────────────────

export interface ReactionGameState {
  phase: 'waiting' | 'countdown' | 'go' | 'results';
  countdown?: number;
  winnerId?: string;
  results: Array<{ playerId: string; playerName: string; avatar: string; reactionMs: number }>;
}

// ─── Meme Battle ──────────────────────────────────────────────────────────────

export interface MemeBattleState {
  phase: 'prompt' | 'writing' | 'voting' | 'results';
  imageUrl: string;
  prompt?: string;
  captions: Array<{ playerId: string; playerName: string; caption: string }>;
  votes: Record<string, string>;
  scores: Record<string, number>;
}

// ─── Truth / Lie ──────────────────────────────────────────────────────────────

export interface TruthLieState {
  phase: 'story' | 'voting' | 'results';
  storytellerId: string;
  story: string;
  truth: 'true' | 'false' | 'partial';
  votes: Record<string, 'true' | 'false' | 'partial'>;
  scores: Record<string, number>;
}

// ─── Socket events ───────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  room_state: (room: RoomState) => void;
  error: (message: string) => void;
  kicked: (reason: string) => void;
  chat_message: (message: ChatMessage) => void;
  player_disconnected: (playerId: string) => void;
  player_reconnected: (playerId: string) => void;
  // Game-specific
  reaction_game_state: (state: ReactionGameState) => void;
  meme_battle_state: (state: MemeBattleState) => void;
  truth_lie_state: (state: TruthLieState) => void;
  game_end: (result: GameEndResult) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { playerName: string; avatar: string; selectedGameId?: string }, cb: (res: { roomCode: string; playerId: string } | { error: string }) => void) => void;
  join_room: (data: { roomCode: string; playerName: string; avatar: string }, cb: (res: { ok: boolean; playerId: string } | { error: string }) => void) => void;
  leave_room: () => void;
  ready_player: (isReady: boolean) => void;
  start_game: () => void;
  kick_player: (playerId: string) => void;
  send_chat: (message: string) => void;
  select_game: (gameId: string) => void;
  return_to_hub: () => void;
  // Reaction game
  reaction_click: () => void;
  // Meme battle
  meme_submit_caption: (caption: string) => void;
  meme_vote: (playerId: string) => void;
  // Truth / Lie
  truth_lie_submit_vote: (vote: 'true' | 'false' | 'partial') => void;
}

export interface InterServerEvents {}
export interface SocketData {
  playerId: string;
  roomCode: string | null;
  playerName: string;
  avatar: string;
}
