import { UnoCard, UnoColor, UnoCardValue, generateUnoDeck, getCardScore } from './unoCards';
import {
  UnoServerGameState, UnoServerPlayerState, UnoClientGameState, UnoActionLog, UnoGamePhase,
} from './unoTypes';

// ─── Shuffle ──────────────────────────────────────────────────────────────────

export function unoShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Deck helpers ─────────────────────────────────────────────────────────────

function drawCards(
  state: UnoServerGameState,
  count: number,
): { state: UnoServerGameState; drawn: UnoCard[] } {
  let deck = [...state.deck];
  let discard = [...state.discardPile];
  const drawn: UnoCard[] = [];

  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      if (discard.length <= 1) break;
      const top = discard[discard.length - 1];
      deck = unoShuffle(discard.slice(0, -1));
      discard = [top];
    }
    drawn.push(deck.pop()!);
  }

  return { state: { ...state, deck, discardPile: discard }, drawn };
}

// ─── Index helpers ────────────────────────────────────────────────────────────

export function nextIdx(count: number, current: number, dir: 1 | -1): number {
  return ((current + dir) % count + count) % count;
}

// ─── Card play validation ─────────────────────────────────────────────────────

export function canPlayCard(card: UnoCard, topCard: UnoCard, currentColor: UnoColor): boolean {
  if (card.value === 'wild' || card.value === 'wild_draw_four') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

export function getPlayableCards(
  hand: UnoCard[],
  topCard: UnoCard,
  currentColor: UnoColor,
): UnoCard[] {
  return hand.filter((c) => canPlayCard(c, topCard, currentColor));
}

// ─── Init new round ───────────────────────────────────────────────────────────

export function initUnoRound(
  playerIds: string[],
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
  existingScores?: Record<string, number>,
  roundNumber = 1,
  targetScore = 500,
): UnoServerGameState {
  let deck = unoShuffle(generateUnoDeck());

  const players: Record<string, UnoServerPlayerState> = {};
  for (const id of playerIds) {
    players[id] = {
      hand: deck.splice(0, 7),
      score: existingScores?.[id] ?? 0,
      hasCalledUno: false,
      isConnected: true,
    };
  }

  // Find a non-wild starting card
  let startCard: UnoCard | undefined;
  while (!startCard) {
    const card = deck.pop()!;
    if (card.value !== 'wild' && card.value !== 'wild_draw_four') {
      startCard = card;
    } else {
      deck.unshift(card);
    }
  }

  let state: UnoServerGameState = {
    deck,
    discardPile: [startCard],
    currentColor: startCard.color as UnoColor,
    players,
    playerOrder: playerIds,
    currentPlayerIndex: 0,
    direction: 1,
    phase: 'playing',
    pendingDrawCount: 0,
    pendingColorPickBy: null,
    drawnCardId: null,
    lastAction: null,
    roundNumber,
    unoCallPendingFor: null,
    gameWinnerId: null,
    roundWinnerId: null,
    targetScore,
  };

  // Apply first card effect
  state = applyStartCardEffect(state, startCard);
  return state;
}

function applyStartCardEffect(state: UnoServerGameState, card: UnoCard): UnoServerGameState {
  let s = { ...state };
  switch (card.value) {
    case 'skip':
      s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      break;
    case 'reverse':
      if (s.playerOrder.length === 2) {
        // Acts as Skip with 2 players
        s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      } else {
        s.direction = -1;
        s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      }
      break;
    case 'draw_two': {
      // Force first player to draw 2 and skip
      const targetId = s.playerOrder[s.currentPlayerIndex];
      const { state: afterDraw, drawn } = drawCards(s, 2);
      s = {
        ...afterDraw,
        players: {
          ...afterDraw.players,
          [targetId]: {
            ...afterDraw.players[targetId],
            hand: [...afterDraw.players[targetId].hand, ...drawn],
          },
        },
        currentPlayerIndex: nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction),
      };
      break;
    }
  }
  return s;
}

// ─── Play a card ──────────────────────────────────────────────────────────────

export type UnoPlayResult =
  | { ok: true; newState: UnoServerGameState; actionLog: UnoActionLog; needsColorPick: boolean }
  | { ok: false; error: string };

export function unoPlayCard(
  state: UnoServerGameState,
  playerId: string,
  cardId: string,
  playerNames: Record<string, string>,
): UnoPlayResult {
  const currentPlayerId = state.playerOrder[state.currentPlayerIndex];

  // In awaiting_draw, only the current player can play and only the drawn card
  if (state.phase === 'awaiting_draw') {
    if (playerId !== currentPlayerId) return { ok: false, error: 'Ce n\'est pas votre tour.' };
    if (state.drawnCardId !== cardId) return { ok: false, error: 'Jouez la carte piochée ou passez.' };
  } else {
    if (state.phase !== 'playing') return { ok: false, error: 'Impossible de jouer maintenant.' };
    if (playerId !== currentPlayerId) return { ok: false, error: 'Ce n\'est pas votre tour.' };
  }

  const player = state.players[playerId];
  const cardIdx = player.hand.findIndex((c) => c.id === cardId);
  if (cardIdx === -1) return { ok: false, error: 'Vous n\'avez pas cette carte.' };

  const card = player.hand[cardIdx];
  const topCard = state.discardPile[state.discardPile.length - 1];

  // Validate card playability (except in awaiting_draw where it was already validated)
  if (state.phase !== 'awaiting_draw') {
    if (!canPlayCard(card, topCard, state.currentColor)) {
      return { ok: false, error: 'Cette carte ne peut pas être jouée maintenant.' };
    }
  }

  const newHand = player.hand.filter((c) => c.id !== cardId);

  let s: UnoServerGameState = {
    ...state,
    players: {
      ...state.players,
      [playerId]: {
        ...player,
        hand: newHand,
        hasCalledUno: newHand.length === 1 ? player.hasCalledUno : false,
      },
    },
    discardPile: [...state.discardPile, card],
    phase: 'playing',
    drawnCardId: null,
    unoCallPendingFor: null,
    lastAction: null,
  };

  // UNO pending check: player just reached 1 card
  if (newHand.length === 1 && !player.hasCalledUno) {
    s = { ...s, unoCallPendingFor: playerId };
  }

  const actionLog: UnoActionLog = {
    playerId,
    playerName: playerNames[playerId] ?? 'Joueur',
    action: state.phase === 'awaiting_draw' ? 'play_drawn' : 'play',
    card,
  };

  // Round win
  if (newHand.length === 0) {
    const { updatedPlayers, gameWinner } = resolveRoundEnd(s, playerId);
    s = {
      ...s,
      players: updatedPlayers,
      roundWinnerId: playerId,
      gameWinnerId: gameWinner ?? null,
      phase: gameWinner ? 'game_over' : 'round_end',
      lastAction: actionLog,
    };
    return { ok: true, newState: s, actionLog, needsColorPick: false };
  }

  // Apply card effect
  const effect = applyCardEffect(s, card, playerId);
  return { ok: true, newState: { ...effect.state, lastAction: actionLog }, actionLog, needsColorPick: effect.needsColorPick };
}

function applyCardEffect(
  state: UnoServerGameState,
  card: UnoCard,
  playerId: string,
): { state: UnoServerGameState; needsColorPick: boolean } {
  let s: UnoServerGameState = { ...state, currentColor: card.color as UnoColor };

  switch (card.value) {
    case 'skip': {
      const skipped = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      s.currentPlayerIndex = nextIdx(s.playerOrder.length, skipped, s.direction);
      return { state: s, needsColorPick: false };
    }

    case 'reverse': {
      s.direction = s.direction === 1 ? -1 : 1;
      if (s.playerOrder.length === 2) {
        // Reverse acts like Skip in 2-player
        s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
        s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      } else {
        s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      }
      return { state: s, needsColorPick: false };
    }

    case 'draw_two': {
      const nextPlayer = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      const nextId = s.playerOrder[nextPlayer];
      const { state: afterDraw, drawn } = drawCards(s, 2);
      s = {
        ...afterDraw,
        players: {
          ...afterDraw.players,
          [nextId]: {
            ...afterDraw.players[nextId],
            hand: [...afterDraw.players[nextId].hand, ...drawn],
          },
        },
        currentPlayerIndex: nextIdx(s.playerOrder.length, nextPlayer, s.direction),
      };
      return { state: s, needsColorPick: false };
    }

    case 'wild': {
      s.phase = 'color_pick';
      s.pendingColorPickBy = playerId;
      s.currentColor = 'wild';
      return { state: s, needsColorPick: true };
    }

    case 'wild_draw_four': {
      s.phase = 'color_pick';
      s.pendingColorPickBy = playerId;
      s.pendingDrawCount = 4;
      s.currentColor = 'wild';
      return { state: s, needsColorPick: true };
    }

    default: {
      // Number card
      s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
      return { state: s, needsColorPick: false };
    }
  }
}

// ─── Choose color (after wild) ────────────────────────────────────────────────

export function unoChooseColor(
  state: UnoServerGameState,
  playerId: string,
  color: UnoColor,
  playerNames: Record<string, string>,
): { ok: boolean; newState: UnoServerGameState; error?: string } {
  if (state.phase !== 'color_pick') return { ok: false, newState: state, error: 'Pas en phase de choix de couleur.' };
  if (state.pendingColorPickBy !== playerId) return { ok: false, newState: state, error: 'Ce n\'est pas à vous de choisir.' };
  if (color === 'wild') return { ok: false, newState: state, error: 'Choisissez rouge, bleu, vert ou jaune.' };

  let s: UnoServerGameState = {
    ...state,
    currentColor: color,
    phase: 'playing',
    pendingColorPickBy: null,
    lastAction: {
      playerId,
      playerName: playerNames[playerId] ?? 'Joueur',
      action: 'color_chosen',
      chosenColor: color,
    },
  };

  if (s.pendingDrawCount > 0) {
    // Wild Draw Four: apply draw + skip to next player
    const nextPlayer = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
    const nextId = s.playerOrder[nextPlayer];
    const { state: afterDraw, drawn } = drawCards(s, s.pendingDrawCount);
    s = {
      ...afterDraw,
      players: {
        ...afterDraw.players,
        [nextId]: {
          ...afterDraw.players[nextId],
          hand: [...afterDraw.players[nextId].hand, ...drawn],
        },
      },
      currentPlayerIndex: nextIdx(s.playerOrder.length, nextPlayer, s.direction),
      pendingDrawCount: 0,
    };
  } else {
    s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
  }

  return { ok: true, newState: s };
}

// ─── Draw a card ──────────────────────────────────────────────────────────────

export type UnoDrawResult =
  | { ok: true; newState: UnoServerGameState; drawnCards: UnoCard[]; canPlay: boolean }
  | { ok: false; error: string };

export function unoDrawCard(
  state: UnoServerGameState,
  playerId: string,
  playerNames: Record<string, string>,
): UnoDrawResult {
  if (state.phase !== 'playing') return { ok: false, error: 'Impossible de piocher maintenant.' };
  if (state.playerOrder[state.currentPlayerIndex] !== playerId) return { ok: false, error: 'Ce n\'est pas votre tour.' };

  const drawCount = 1;
  const { state: afterDraw, drawn } = drawCards(state, drawCount);

  let s: UnoServerGameState = {
    ...afterDraw,
    players: {
      ...afterDraw.players,
      [playerId]: {
        ...afterDraw.players[playerId],
        hand: [...afterDraw.players[playerId].hand, ...drawn],
      },
    },
    lastAction: {
      playerId,
      playerName: playerNames[playerId] ?? 'Joueur',
      action: 'draw',
      drawCount,
    },
  };

  if (drawn.length === 0) {
    // Empty deck, auto-pass
    s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
    return { ok: true, newState: s, drawnCards: drawn, canPlay: false };
  }

  const topCard = s.discardPile[s.discardPile.length - 1];
  const drawnCard = drawn[0];
  const canPlay = canPlayCard(drawnCard, topCard, s.currentColor);

  if (canPlay) {
    // Enter awaiting_draw phase so player can choose to play or pass
    s = { ...s, phase: 'awaiting_draw', drawnCardId: drawnCard.id };
  } else {
    // No valid play — automatically advance turn
    s.currentPlayerIndex = nextIdx(s.playerOrder.length, s.currentPlayerIndex, s.direction);
  }

  return { ok: true, newState: s, drawnCards: drawn, canPlay };
}

// ─── Pass after drawing (decline to play drawn card) ─────────────────────────

export function unoPassTurn(
  state: UnoServerGameState,
  playerId: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: UnoServerGameState; error?: string } {
  if (state.phase !== 'awaiting_draw') return { ok: false, newState: state, error: 'Rien à passer.' };
  if (state.playerOrder[state.currentPlayerIndex] !== playerId) return { ok: false, newState: state, error: 'Ce n\'est pas votre tour.' };

  const s: UnoServerGameState = {
    ...state,
    phase: 'playing',
    drawnCardId: null,
    currentPlayerIndex: nextIdx(state.playerOrder.length, state.currentPlayerIndex, state.direction),
    lastAction: {
      playerId,
      playerName: playerNames[playerId] ?? 'Joueur',
      action: 'pass',
    },
  };
  return { ok: true, newState: s };
}

// ─── UNO call ─────────────────────────────────────────────────────────────────

export function unoCallUno(
  state: UnoServerGameState,
  callerId: string,
  targetId: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: UnoServerGameState; penalized: boolean; error?: string } {
  const target = state.players[targetId];
  if (!target) return { ok: false, newState: state, penalized: false, error: 'Joueur introuvable.' };

  if (callerId === targetId) {
    // Player calling UNO for themselves
    if (target.hand.length !== 1) return { ok: false, newState: state, penalized: false, error: 'Vous n\'avez pas 1 carte.' };
    const s: UnoServerGameState = {
      ...state,
      players: { ...state.players, [callerId]: { ...target, hasCalledUno: true } },
      unoCallPendingFor: null,
    };
    return { ok: true, newState: s, penalized: false };
  }

  // Calling UNO on another player (catching them without calling)
  if (state.unoCallPendingFor === targetId && target.hand.length === 1) {
    const { state: afterDraw, drawn } = drawCards(state, 2);
    const s: UnoServerGameState = {
      ...afterDraw,
      players: {
        ...afterDraw.players,
        [targetId]: {
          ...afterDraw.players[targetId],
          hand: [...afterDraw.players[targetId].hand, ...drawn],
          hasCalledUno: false,
        },
      },
      unoCallPendingFor: null,
      lastAction: {
        playerId: callerId,
        playerName: playerNames[callerId] ?? 'Joueur',
        action: 'uno_penalty',
        drawCount: 2,
      },
    };
    return { ok: true, newState: s, penalized: true };
  }

  return { ok: false, newState: state, penalized: false, error: 'Pas applicable.' };
}

// ─── Round end scoring ────────────────────────────────────────────────────────

function resolveRoundEnd(
  state: UnoServerGameState,
  winnerId: string,
): { updatedPlayers: Record<string, UnoServerPlayerState>; gameWinner: string | null } {
  let winnerPoints = 0;
  for (const [id, p] of Object.entries(state.players)) {
    if (id !== winnerId) {
      winnerPoints += p.hand.reduce((sum, c) => sum + getCardScore(c), 0);
    }
  }

  const updatedPlayers: Record<string, UnoServerPlayerState> = {};
  for (const id of state.playerOrder) {
    const p = state.players[id];
    updatedPlayers[id] = { ...p, score: p.score + (id === winnerId ? winnerPoints : 0) };
  }

  const gameWinner = state.playerOrder.find((id) => updatedPlayers[id].score >= state.targetScore) ?? null;
  return { updatedPlayers, gameWinner };
}

// ─── Build client-specific view ───────────────────────────────────────────────

export function buildUnoClientState(
  state: UnoServerGameState,
  viewerId: string,
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
): UnoClientGameState {
  const currentPlayerId = state.playerOrder[state.currentPlayerIndex];
  const isMyTurn = viewerId === currentPlayerId;
  const viewer = state.players[viewerId];
  const topCard = state.discardPile[state.discardPile.length - 1];

  const playableCardIds: string[] =
    isMyTurn && state.phase === 'playing'
      ? getPlayableCards(viewer?.hand ?? [], topCard, state.currentColor).map((c) => c.id)
      : isMyTurn && state.phase === 'awaiting_draw' && state.drawnCardId
        ? [state.drawnCardId]
        : [];

  return {
    hand: viewer?.hand ?? [],
    players: state.playerOrder.map((id) => ({
      id,
      name: playerNames[id] ?? id,
      avatar: playerAvatars[id] ?? '🃏',
      handSize: state.players[id].hand.length,
      score: state.players[id].score,
      hasCalledUno: state.players[id].hasCalledUno,
      isCurrentPlayer: id === currentPlayerId,
      isConnected: state.players[id].isConnected,
    })),
    topCard,
    currentColor: state.currentColor,
    currentPlayerId,
    isMyTurn,
    phase: state.phase,
    direction: state.direction,
    deckSize: state.deck.length,
    pendingDrawCount: state.pendingDrawCount,
    drawnCardId: state.drawnCardId,
    lastAction: state.lastAction,
    roundNumber: state.roundNumber,
    gameWinnerId: state.gameWinnerId,
    roundWinnerId: state.roundWinnerId,
    targetScore: state.targetScore,
    canCallUno: viewerId === state.unoCallPendingFor,
    playableCardIds,
  };
}

// ─── Next round ───────────────────────────────────────────────────────────────

export function unoNextRound(
  state: UnoServerGameState,
  playerIds: string[],
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
): UnoServerGameState {
  const scores: Record<string, number> = {};
  for (const id of playerIds) scores[id] = state.players[id]?.score ?? 0;
  return initUnoRound(playerIds, playerNames, playerAvatars, scores, state.roundNumber + 1, state.targetScore);
}
