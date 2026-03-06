import { Card, ServerGameState, ServerPlayerGameState, PlayResult, RoundResult } from './types';

// ─── Bull head scoring ────────────────────────────────────────────────────────

/**
 * Returns the number of bull heads for a given card number.
 * Official scoring rules:
 *  - 55      → 7 bull heads (special card)
 *  - mult 11 → 5 bull heads
 *  - mult 10 → 3 bull heads
 *  - mult 5  → 2 bull heads
 *  - other   → 1 bull head
 */
export function calculateBullHeads(n: number): number {
  if (n === 55) return 7;
  if (n % 11 === 0) return 5;
  if (n % 10 === 0) return 3;
  if (n % 5 === 0) return 2;
  return 1;
}

// ─── Deck ─────────────────────────────────────────────────────────────────────

/** Generates the full shuffled deck of 104 cards. */
export function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (let i = 1; i <= 104; i++) {
    deck.push({ number: i, bullHeads: calculateBullHeads(i) });
  }
  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Game initialisation ──────────────────────────────────────────────────────

/** Deals cards and places 4 initial row cards. Returns initial server game state. */
export function initGameState(playerIds: string[]): ServerGameState {
  const deck = generateDeck();
  let cursor = 0;

  const players: Record<string, ServerPlayerGameState> = {};
  for (const id of playerIds) {
    players[id] = {
      hand: deck.slice(cursor, cursor + 10).sort((a, b) => a.number - b.number),
      selectedCard: null,
      score: 0,
      takenCards: [],
    };
    cursor += 10;
  }

  const rows: Card[][] = [];
  for (let i = 0; i < 4; i++) {
    rows.push([deck[cursor++]]);
  }

  return {
    rows,
    players,
    round: 1,
    totalRounds: 10,
    phase: 'playing',
    awaitingRowSelection: null,
    lastRoundResult: null,
  };
}

// ─── Row placement logic ──────────────────────────────────────────────────────

/**
 * Finds the best row index for a card:
 * - the row whose top card has the highest value strictly below the played card.
 * Returns -1 if no row qualifies (card is lower than all row tops).
 */
export function findBestRowIndex(card: Card, rows: Card[][]): number {
  let bestRow = -1;
  let bestDiff = Infinity;

  for (let i = 0; i < rows.length; i++) {
    const rowTop = rows[i][rows[i].length - 1];
    const diff = card.number - rowTop.number;
    if (diff > 0 && diff < bestDiff) {
      bestDiff = diff;
      bestRow = i;
    }
  }
  return bestRow;
}

/**
 * Places a card in a row.
 * If the row reaches 6 cards the player collects the first 5 and starts the row with this card.
 * Returns { tookRow, pointsGained, rowCardsTaken }.
 */
export function placeCardInRow(
  card: Card,
  rowIndex: number,
  rows: Card[][],
  playerState: ServerPlayerGameState
): { tookRow: boolean; pointsGained: number; rowCardsTaken: Card[] } {
  const row = rows[rowIndex];
  row.push(card);

  if (row.length >= 6) {
    // Player takes the first 5 cards (the new card starts the row)
    const taken = row.splice(0, row.length - 1);
    const points = taken.reduce((s, c) => s + c.bullHeads, 0);
    playerState.score += points;
    playerState.takenCards.push(...taken);
    return { tookRow: true, pointsGained: points, rowCardsTaken: taken };
  }

  return { tookRow: false, pointsGained: 0, rowCardsTaken: [] };
}

/**
 * Player manually picks a row (when their card is lower than all row tops).
 * They collect ALL cards in that row and replace it with their card.
 */
export function takeRowWithCard(
  card: Card,
  rowIndex: number,
  rows: Card[][],
  playerState: ServerPlayerGameState
): { pointsGained: number; rowCardsTaken: Card[] } {
  const taken = rows[rowIndex].splice(0);
  const points = taken.reduce((s, c) => s + c.bullHeads, 0);
  playerState.score += points;
  playerState.takenCards.push(...taken);
  rows[rowIndex] = [card];
  return { pointsGained: points, rowCardsTaken: taken };
}

// ─── Round resolution (synchronous portion) ───────────────────────────────────

export interface PendingPlay {
  playerId: string;
  playerName: string;
  card: Card;
}

/**
 * Sorts plays ascending by card number.
 * Returns the sorted list ready for sequential processing.
 */
export function sortPlays(plays: PendingPlay[]): PendingPlay[] {
  return [...plays].sort((a, b) => a.card.number - b.card.number);
}

/**
 * Processes a single play synchronously.
 * Returns the PlayResult and whether row selection is required.
 * If row selection is required, the state is NOT yet mutated (caller must call
 * takeRowWithCard after receiving the player's choice).
 */
export function processPlay(
  play: PendingPlay,
  state: ServerGameState,
  playerNames: Record<string, string>
): { result: PlayResult; needsRowSelection: boolean } {
  const rowIndex = findBestRowIndex(play.card, state.rows);

  if (rowIndex === -1) {
    return {
      result: {
        playerId: play.playerId,
        playerName: playerNames[play.playerId] ?? play.playerId,
        card: play.card,
        rowIndex: -1,
        tookRow: false,
        pointsGained: 0,
        rowCardsTaken: [],
      },
      needsRowSelection: true,
    };
  }

  const playerState = state.players[play.playerId];
  const { tookRow, pointsGained, rowCardsTaken } = placeCardInRow(play.card, rowIndex, state.rows, playerState);

  return {
    result: {
      playerId: play.playerId,
      playerName: playerNames[play.playerId] ?? play.playerId,
      card: play.card,
      rowIndex,
      tookRow,
      pointsGained,
      rowCardsTaken,
    },
    needsRowSelection: false,
  };
}

// ─── Scoring summary ──────────────────────────────────────────────────────────

export function buildScoreSnapshot(state: ServerGameState): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const [id, p] of Object.entries(state.players)) {
    scores[id] = p.score;
  }
  return scores;
}

export function buildRoundResult(
  round: number,
  plays: PlayResult[],
  state: ServerGameState
): RoundResult {
  return {
    round,
    plays,
    scores: buildScoreSnapshot(state),
  };
}

// ─── Game-over check ─────────────────────────────────────────────────────────

export function isGameOver(state: ServerGameState): boolean {
  return Object.values(state.players).every((p) => p.hand.length === 0);
}
