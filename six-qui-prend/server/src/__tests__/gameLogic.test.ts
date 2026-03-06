import {
  calculateBullHeads,
  generateDeck,
  initGameState,
  findBestRowIndex,
  placeCardInRow,
  takeRowWithCard,
  sortPlays,
  isGameOver,
} from '../../../shared/gameLogic';
import { Card, ServerPlayerGameState } from '../../../shared/types';

// ─── Bull heads ───────────────────────────────────────────────────────────────

describe('calculateBullHeads', () => {
  test('card 55 gets 7 bull heads', () => {
    expect(calculateBullHeads(55)).toBe(7);
  });

  test('multiples of 11 (except 55) get 5 bull heads', () => {
    [11, 22, 33, 44, 66, 77, 88, 99].forEach((n) => {
      expect(calculateBullHeads(n)).toBe(5);
    });
  });

  test('multiples of 10 get 3 bull heads', () => {
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((n) => {
      expect(calculateBullHeads(n)).toBe(3);
    });
  });

  test('multiples of 5 (not 10) get 2 bull heads', () => {
    [5, 15, 25, 35, 45, 65, 75, 85, 95].forEach((n) => {
      expect(calculateBullHeads(n)).toBe(2);
    });
  });

  test('regular cards get 1 bull head', () => {
    [1, 2, 3, 7, 13, 57, 103].forEach((n) => {
      expect(calculateBullHeads(n)).toBe(1);
    });
  });
});

// ─── Deck generation ─────────────────────────────────────────────────────────

describe('generateDeck', () => {
  test('generates 104 cards', () => {
    const deck = generateDeck();
    expect(deck).toHaveLength(104);
  });

  test('cards are numbered 1 to 104', () => {
    const deck = generateDeck();
    const numbers = deck.map((c) => c.number).sort((a, b) => a - b);
    for (let i = 0; i < 104; i++) {
      expect(numbers[i]).toBe(i + 1);
    }
  });

  test('each card has correct bull heads', () => {
    const deck = generateDeck();
    for (const card of deck) {
      expect(card.bullHeads).toBe(calculateBullHeads(card.number));
    }
  });

  test('deck is shuffled (not in order)', () => {
    const deck = generateDeck();
    const isOrdered = deck.every((c, i) => c.number === i + 1);
    // Statistically almost impossible to be ordered
    expect(isOrdered).toBe(false);
  });
});

// ─── Game init ────────────────────────────────────────────────────────────────

describe('initGameState', () => {
  test('each player gets 10 cards', () => {
    const state = initGameState(['p1', 'p2', 'p3']);
    for (const pid of ['p1', 'p2', 'p3']) {
      expect(state.players[pid].hand).toHaveLength(10);
    }
  });

  test('4 rows each with 1 card', () => {
    const state = initGameState(['p1', 'p2']);
    expect(state.rows).toHaveLength(4);
    state.rows.forEach((row) => expect(row).toHaveLength(1));
  });

  test('no card duplicates between players and rows', () => {
    const state = initGameState(['p1', 'p2', 'p3', 'p4']);
    const allCards: number[] = [];
    for (const p of Object.values(state.players)) {
      allCards.push(...p.hand.map((c) => c.number));
    }
    for (const row of state.rows) {
      allCards.push(...row.map((c) => c.number));
    }
    const unique = new Set(allCards);
    expect(unique.size).toBe(allCards.length);
  });

  test('starts at round 1 with playing phase', () => {
    const state = initGameState(['p1', 'p2']);
    expect(state.round).toBe(1);
    expect(state.phase).toBe('playing');
    expect(state.totalRounds).toBe(10);
  });
});

// ─── Row placement ────────────────────────────────────────────────────────────

describe('findBestRowIndex', () => {
  const makeCard = (n: number): Card => ({ number: n, bullHeads: calculateBullHeads(n) });

  test('finds row with closest lower value', () => {
    const rows: Card[][] = [
      [makeCard(10)],
      [makeCard(20)],
      [makeCard(30)],
      [makeCard(40)],
    ];
    expect(findBestRowIndex(makeCard(25), rows)).toBe(1); // closest is 20
    expect(findBestRowIndex(makeCard(35), rows)).toBe(2); // closest is 30
    expect(findBestRowIndex(makeCard(45), rows)).toBe(3); // closest is 40
  });

  test('returns -1 when card is lower than all row tops', () => {
    const rows: Card[][] = [
      [makeCard(10)],
      [makeCard(20)],
      [makeCard(30)],
      [makeCard(40)],
    ];
    expect(findBestRowIndex(makeCard(5), rows)).toBe(-1);
  });

  test('places in row with top card exactly 1 below', () => {
    const rows: Card[][] = [
      [makeCard(50)],
      [makeCard(30)],
      [makeCard(10)],
      [makeCard(5)],
    ];
    expect(findBestRowIndex(makeCard(51), rows)).toBe(0);
  });
});

// ─── Row capture ─────────────────────────────────────────────────────────────

describe('placeCardInRow', () => {
  const makeCard = (n: number): Card => ({ number: n, bullHeads: calculateBullHeads(n) });
  const emptyPlayer = (): ServerPlayerGameState => ({
    hand: [],
    selectedCard: null,
    score: 0,
    takenCards: [],
  });

  test('adds card to row without triggering capture below 6', () => {
    const rows: Card[][] = [[makeCard(5), makeCard(10), makeCard(15)]];
    const player = emptyPlayer();
    const result = placeCardInRow(makeCard(20), 0, rows, player);
    expect(result.tookRow).toBe(false);
    expect(rows[0]).toHaveLength(4);
    expect(player.score).toBe(0);
  });

  test('triggers capture when row reaches 6 cards', () => {
    const rows: Card[][] = [[makeCard(5), makeCard(10), makeCard(15), makeCard(20), makeCard(25)]];
    const player = emptyPlayer();
    const result = placeCardInRow(makeCard(30), 0, rows, player);
    expect(result.tookRow).toBe(true);
    expect(rows[0]).toHaveLength(1); // Only the new card remains
    expect(rows[0][0].number).toBe(30);
    expect(result.rowCardsTaken).toHaveLength(5);
    expect(player.score).toBeGreaterThan(0);
  });
});

describe('takeRowWithCard', () => {
  const makeCard = (n: number): Card => ({ number: n, bullHeads: calculateBullHeads(n) });
  const emptyPlayer = (): ServerPlayerGameState => ({
    hand: [],
    selectedCard: null,
    score: 0,
    takenCards: [],
  });

  test('player takes all cards from chosen row', () => {
    const card = makeCard(3);
    const rows: Card[][] = [
      [makeCard(20), makeCard(30), makeCard(40)],
      [makeCard(50)],
    ];
    const player = emptyPlayer();
    const { pointsGained, rowCardsTaken } = takeRowWithCard(card, 0, rows, player);
    expect(rowCardsTaken).toHaveLength(3);
    expect(rows[0]).toHaveLength(1);
    expect(rows[0][0].number).toBe(3);
    expect(pointsGained).toBeGreaterThan(0);
    expect(player.score).toBe(pointsGained);
  });
});

// ─── Sort plays ───────────────────────────────────────────────────────────────

describe('sortPlays', () => {
  const makeCard = (n: number): Card => ({ number: n, bullHeads: 1 });

  test('sorts plays ascending by card number', () => {
    const plays = [
      { playerId: 'p3', playerName: 'C', card: makeCard(50) },
      { playerId: 'p1', playerName: 'A', card: makeCard(10) },
      { playerId: 'p2', playerName: 'B', card: makeCard(30) },
    ];
    const sorted = sortPlays(plays);
    expect(sorted[0].card.number).toBe(10);
    expect(sorted[1].card.number).toBe(30);
    expect(sorted[2].card.number).toBe(50);
  });
});

// ─── Game over ────────────────────────────────────────────────────────────────

describe('isGameOver', () => {
  test('returns false if any player has cards', () => {
    const state = initGameState(['p1', 'p2']);
    expect(isGameOver(state)).toBe(false);
  });

  test('returns true when all hands are empty', () => {
    const state = initGameState(['p1', 'p2']);
    state.players['p1'].hand = [];
    state.players['p2'].hand = [];
    expect(isGameOver(state)).toBe(true);
  });
});
