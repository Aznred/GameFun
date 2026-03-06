import { WlSpectrum } from './wavelengthSpectrums';

export type WlPhase =
  | 'psychic_clue'   // Psychic sees target, types a clue
  | 'player_guess'   // All other players submit their own guess independently
  | 'reveal'         // Target revealed, all guesses shown, points awarded
  | 'game_over';     // All rounds done, winner announced

// ─── Per-round result ─────────────────────────────────────────────────────────

export interface WlRoundResult {
  targetPosition: number;
  guesses: Record<string, number>;   // playerId → guess position
  points: Record<string, number>;    // playerId → points earned this round
  spectrum: WlSpectrum;
  clue: string;
  psychicId: string;
  psychicName: string;
}

// ─── Server state ─────────────────────────────────────────────────────────────

export interface WlServerState {
  phase: WlPhase;
  playerOrder: string[];              // rotation order for psychic
  currentPsychicIndex: number;        // index into playerOrder
  spectrum: WlSpectrum | null;
  targetPosition: number | null;      // hidden from non-psychics
  psychicId: string | null;
  clue: string | null;
  playerGuesses: Record<string, number | null>; // null = not submitted yet
  playerScores: Record<string, number>;         // cumulative
  roundNumber: number;
  totalRounds: number;                // = playerOrder.length (each player psychic once)
  lastRoundResult: WlRoundResult | null;
  winnerIds: string[];
  usedSpectrums: string[];
}

// ─── Client state ─────────────────────────────────────────────────────────────

export interface WlPlayerInfo {
  id: string;
  name: string;
  avatar: string;
  score: number;
  hasSubmitted: boolean;  // in current round
}

export interface WlClientState {
  phase: WlPhase;
  players: WlPlayerInfo[];
  psychicId: string | null;
  psychicName: string | null;
  spectrum: WlSpectrum | null;
  targetPosition: number | null;   // only set for the psychic
  clue: string | null;
  submittedCount: number;          // how many non-psychics have submitted
  totalGuessers: number;           // total non-psychic players
  roundNumber: number;
  totalRounds: number;
  lastRoundResult: WlRoundResult | null;
  winnerIds: string[];
  amIPsychic: boolean;
  hasSubmitted: boolean;           // did I already submit this round?
}
