import { getRandomSpectrum } from './wavelengthSpectrums';
import { WlServerState, WlClientState, WlRoundResult } from './wavelengthTypes';

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function calculateWlScore(target: number, guess: number): number {
  const diff = Math.abs(target - guess);
  if (diff <= 4)  return 4;
  if (diff <= 12) return 3;
  if (diff <= 22) return 2;
  if (diff <= 34) return 1;
  return 0;
}

export const WL_SCORE_ZONES = [4, 12, 22, 34] as const;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initWlGame(
  playerIds: string[],
  playerNames: Record<string, string>,
): WlServerState {
  const scores: Record<string, number> = {};
  for (const id of playerIds) scores[id] = 0;

  return {
    phase: 'psychic_clue',
    playerOrder: [...playerIds],
    currentPsychicIndex: 0,
    spectrum: getRandomSpectrum(),
    targetPosition: Math.floor(Math.random() * 81) + 10, // 10–90
    psychicId: playerIds[0],
    clue: null,
    playerGuesses: Object.fromEntries(playerIds.map((id) => [id, null])),
    playerScores: scores,
    roundNumber: 1,
    totalRounds: playerIds.length,
    lastRoundResult: null,
    winnerIds: [],
    usedSpectrums: [],
  };
}

// ─── Submit clue ──────────────────────────────────────────────────────────────

export function wlSubmitClue(
  state: WlServerState,
  psychicId: string,
  clue: string,
): { ok: boolean; newState: WlServerState; error?: string } {
  if (state.phase !== 'psychic_clue') return { ok: false, newState: state, error: 'Phase incorrecte.' };
  if (state.psychicId !== psychicId) return { ok: false, newState: state, error: 'Vous n\'êtes pas le Psychique.' };
  if (!clue.trim()) return { ok: false, newState: state, error: 'Entrez un indice.' };

  // Reset guesses for all non-psychics
  const playerGuesses: Record<string, number | null> = {};
  for (const id of state.playerOrder) {
    playerGuesses[id] = null;
  }

  return {
    ok: true,
    newState: { ...state, phase: 'player_guess', clue: clue.trim(), playerGuesses },
  };
}

// ─── Submit a player's guess ──────────────────────────────────────────────────

export function wlSubmitPlayerGuess(
  state: WlServerState,
  playerId: string,
  position: number,
  playerNames: Record<string, string>,
): { ok: boolean; newState: WlServerState; autoReveal: boolean; error?: string } {
  if (state.phase !== 'player_guess') return { ok: false, newState: state, autoReveal: false, error: 'Phase incorrecte.' };
  if (state.psychicId === playerId) return { ok: false, newState: state, autoReveal: false, error: 'Le psychique ne joue pas.' };

  const pos = Math.max(0, Math.min(100, Math.round(position)));
  const playerGuesses = { ...state.playerGuesses, [playerId]: pos };

  // Check if all non-psychics submitted
  const guessers = state.playerOrder.filter((id) => id !== state.psychicId);
  const allSubmitted = guessers.every((id) => playerGuesses[id] !== null);

  let newState: WlServerState = { ...state, playerGuesses };

  if (allSubmitted) {
    newState = resolveRound(newState, playerNames);
  }

  return { ok: true, newState, autoReveal: allSubmitted };
}

// ─── Force reveal (host) ──────────────────────────────────────────────────────

export function wlForceReveal(
  state: WlServerState,
  playerNames: Record<string, string>,
): WlServerState {
  if (state.phase !== 'player_guess') return state;
  // Fill missing guesses with 50 (neutral)
  const playerGuesses = { ...state.playerGuesses };
  for (const id of state.playerOrder) {
    if (id !== state.psychicId && playerGuesses[id] === null) {
      playerGuesses[id] = 50;
    }
  }
  return resolveRound({ ...state, playerGuesses }, playerNames);
}

// ─── Resolve round ────────────────────────────────────────────────────────────

function resolveRound(
  state: WlServerState,
  playerNames: Record<string, string>,
): WlServerState {
  const target = state.targetPosition!;
  const guesses: Record<string, number> = {};
  const points: Record<string, number> = {};

  for (const id of state.playerOrder) {
    if (id !== state.psychicId && state.playerGuesses[id] !== null) {
      guesses[id] = state.playerGuesses[id] as number;
      points[id] = calculateWlScore(target, guesses[id]);
    }
  }

  const newScores: Record<string, number> = { ...state.playerScores };
  for (const [id, pts] of Object.entries(points)) {
    newScores[id] = (newScores[id] ?? 0) + pts;
  }

  const lastRoundResult: WlRoundResult = {
    targetPosition: target,
    guesses,
    points,
    spectrum: state.spectrum!,
    clue: state.clue ?? '',
    psychicId: state.psychicId ?? '',
    psychicName: playerNames[state.psychicId ?? ''] ?? '?',
  };

  // Check game over
  const isLastRound = state.roundNumber >= state.totalRounds;
  if (isLastRound) {
    const maxScore = Math.max(...Object.values(newScores));
    const winners = state.playerOrder.filter((id) => newScores[id] === maxScore);
    return {
      ...state,
      phase: 'game_over',
      playerScores: newScores,
      lastRoundResult,
      winnerIds: winners,
    };
  }

  return {
    ...state,
    phase: 'reveal',
    playerScores: newScores,
    lastRoundResult,
  };
}

// ─── Next round ───────────────────────────────────────────────────────────────

export function wlNextRound(
  state: WlServerState,
): WlServerState {
  if (state.phase !== 'reveal') return state;

  const nextPsychicIndex = (state.currentPsychicIndex + 1) % state.playerOrder.length;
  const nextPsychicId = state.playerOrder[nextPsychicIndex];

  // Pick a new spectrum (avoid immediate repeat)
  const spectrum = getRandomSpectrum(state.spectrum ?? undefined);

  const usedSpectrums = [...state.usedSpectrums, spectrum.left];
  if (usedSpectrums.length > 10) usedSpectrums.shift();

  // Reset guesses
  const playerGuesses: Record<string, number | null> = {};
  for (const id of state.playerOrder) playerGuesses[id] = null;

  return {
    ...state,
    phase: 'psychic_clue',
    currentPsychicIndex: nextPsychicIndex,
    psychicId: nextPsychicId,
    spectrum,
    targetPosition: Math.floor(Math.random() * 81) + 10,
    clue: null,
    playerGuesses,
    roundNumber: state.roundNumber + 1,
    lastRoundResult: null,
    usedSpectrums,
  };
}

// ─── Build client state ───────────────────────────────────────────────────────

export function buildWlClientState(
  state: WlServerState,
  viewerId: string,
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
): WlClientState {
  const amIPsychic = state.psychicId === viewerId;
  const guessers = state.playerOrder.filter((id) => id !== state.psychicId);
  const submittedCount = guessers.filter((id) => state.playerGuesses[id] !== null).length;

  const players: WlClientState['players'] = state.playerOrder.map((id) => ({
    id,
    name: playerNames[id] ?? id,
    avatar: playerAvatars[id] ?? '🎭',
    score: state.playerScores[id] ?? 0,
    hasSubmitted: id === state.psychicId ? true : state.playerGuesses[id] !== null,
  }));

  return {
    phase: state.phase,
    players,
    psychicId: state.psychicId,
    psychicName: state.psychicId ? (playerNames[state.psychicId] ?? '?') : null,
    spectrum: state.spectrum,
    targetPosition: amIPsychic ? state.targetPosition : null,
    clue: state.clue,
    submittedCount,
    totalGuessers: guessers.length,
    roundNumber: state.roundNumber,
    totalRounds: state.totalRounds,
    lastRoundResult: state.lastRoundResult,
    winnerIds: state.winnerIds,
    amIPsychic,
    hasSubmitted: amIPsychic ? true : state.playerGuesses[viewerId] !== null,
  };
}
