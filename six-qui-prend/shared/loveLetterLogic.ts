import { LLCard, LLCardId, generateLLDeck, makeLLCard, getTokensToWin } from './loveLetterCards';
import {
  LLServerGameState, LLServerPlayerState, LLClientGameState,
  LLClientPlayerSummary, LLPlayedCard, LLActionLog, LLGamePhase,
} from './loveLetterTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function llShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initLLGameState(
  playerIds: string[],
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
): LLServerGameState {
  const tokens: Record<string, number> = {};
  const players: Record<string, LLServerPlayerState> = {};
  for (const id of playerIds) {
    tokens[id] = 0;
    players[id] = { hand: [], isEliminated: false, isProtected: false, discardPile: [] };
  }
  const base: LLServerGameState = {
    deck: [], removedCard: makeLLCard('guard'), exposedCards: [],
    players, playerOrder: [...playerIds], activePlayers: [...playerIds],
    currentPlayerIndex: 0, phase: 'drawing', roundNumber: 1,
    tokens, tokensToWin: getTokensToWin(playerIds.length),
    roundWinnerId: null, gameWinnerId: null, lastAction: null,
  };
  return llInitRound(base);
}

export function llInitRound(state: LLServerGameState): LLServerGameState {
  const deck = llShuffle(generateLLDeck());
  const removedCard = deck.pop()!;
  const exposedCards: LLCard[] = [];
  if (state.playerOrder.length === 2) {
    for (let i = 0; i < 3; i++) exposedCards.push(deck.pop()!);
  }
  const players: Record<string, LLServerPlayerState> = {};
  for (const id of state.playerOrder) {
    players[id] = { hand: [deck.pop()!], isEliminated: false, isProtected: false, discardPile: [] };
  }
  return {
    ...state,
    deck, removedCard, exposedCards, players,
    activePlayers: [...state.playerOrder],
    currentPlayerIndex: 0,
    phase: 'drawing',
    roundWinnerId: null, lastAction: null,
  };
}

// ─── Turn start: remove protection, draw card ─────────────────────────────────

export function llStartTurn(state: LLServerGameState): LLServerGameState {
  const currentId = state.activePlayers[state.currentPlayerIndex];
  if (!currentId) return state;

  // Remove protection from previous turn
  const players = {
    ...state.players,
    [currentId]: { ...state.players[currentId], isProtected: false },
  };

  // Draw a card
  if (state.deck.length === 0) return { ...state, players, phase: 'playing' };
  const drawn = state.deck[state.deck.length - 1];
  const newDeck = state.deck.slice(0, -1);
  players[currentId] = { ...players[currentId], hand: [...players[currentId].hand, drawn] };
  return { ...state, players, deck: newDeck, phase: 'playing' };
}

// ─── Play card ────────────────────────────────────────────────────────────────

export interface LLPlayResult {
  newState: LLServerGameState;
  actionLog: LLActionLog;
  peekCard?: LLCard;
  error?: string;
}

export function llResolvePlay(
  state: LLServerGameState,
  playerId: string,
  cardId: LLCardId,
  targetId?: string,
  guess?: LLCardId,
  playerNames?: Record<string, string>,
): LLPlayResult {
  const getName = (id: string) => playerNames?.[id] ?? id;
  const currentId = state.activePlayers[state.currentPlayerIndex];

  if (currentId !== playerId)
    return { newState: state, actionLog: makeLog(playerId, getName(playerId), state.players[playerId]?.hand[0] ?? makeLLCard('guard'), 'Pas votre tour'), error: 'Pas votre tour' };

  const pState = state.players[playerId];
  if (!pState) return { newState: state, actionLog: makeLog(playerId, getName(playerId), makeLLCard('guard'), 'Joueur introuvable'), error: 'Joueur introuvable' };

  const cardIdx = pState.hand.findIndex((c) => c.id === cardId);
  if (cardIdx === -1) return { newState: state, actionLog: makeLog(playerId, getName(playerId), makeLLCard(cardId), 'Carte introuvable'), error: 'Carte introuvable' };

  const playedCard = pState.hand[cardIdx];

  // Countess rule
  if (cardId !== 'countess') {
    const hasCountess = pState.hand.some((c) => c.id === 'countess');
    const hasKingOrPrince = pState.hand.some((c) => c.id === 'king' || c.id === 'prince');
    if (hasCountess && hasKingOrPrince)
      return { newState: state, actionLog: makeLog(playerId, getName(playerId), playedCard, 'Vous devez jouer la Comtesse !'), error: 'Vous devez jouer la Comtesse !' };
  }

  // Remove played card from hand
  let players = {
    ...state.players,
    [playerId]: { ...pState, hand: pState.hand.filter((_, i) => i !== cardIdx) },
  };
  let deck = [...state.deck];

  let result = '';
  let eliminatedId: string | undefined;
  let peekCard: LLCard | undefined;
  let targetCard: LLCard | undefined;

  switch (cardId) {
    case 'guard': {
      if (!targetId || !guess) { result = 'Cible ou devinette manquante'; break; }
      const tgt = players[targetId];
      if (!tgt || tgt.isEliminated) { result = 'Cible invalide'; break; }
      if (tgt.isProtected) { result = `${getName(targetId)} est protégé(e) !`; break; }
      if (tgt.hand[0]?.id === guess) {
        targetCard = tgt.hand[0];
        players = { ...players, [targetId]: { ...tgt, isEliminated: true, hand: [] } };
        eliminatedId = targetId;
        result = `${getName(targetId)} avait le/la ${tgt.hand[0].nameFr} — éliminé(e) !`;
      } else {
        result = `${getName(targetId)} n'avait pas cette carte.`;
      }
      break;
    }
    case 'priest': {
      if (!targetId) { result = 'Cible manquante'; break; }
      const tgt = players[targetId];
      if (!tgt || tgt.isEliminated) { result = 'Cible invalide'; break; }
      if (tgt.isProtected) { result = `${getName(targetId)} est protégé(e) !`; break; }
      peekCard = tgt.hand[0];
      result = `${getName(playerId)} regarde la main de ${getName(targetId)}.`;
      break;
    }
    case 'baron': {
      if (!targetId) { result = 'Cible manquante'; break; }
      const tgt = players[targetId];
      if (!tgt || tgt.isEliminated) { result = 'Cible invalide'; break; }
      if (tgt.isProtected) { result = `${getName(targetId)} est protégé(e) !`; break; }
      const myVal = players[playerId].hand[0]?.value ?? 0;
      const theirVal = tgt.hand[0]?.value ?? 0;
      targetCard = tgt.hand[0];
      if (myVal > theirVal) {
        players = { ...players, [targetId]: { ...tgt, isEliminated: true, hand: [] } };
        eliminatedId = targetId;
        result = `Comparaison : ${myVal} > ${theirVal} — ${getName(targetId)} éliminé(e) !`;
      } else if (theirVal > myVal) {
        players = { ...players, [playerId]: { ...players[playerId], isEliminated: true, hand: [] } };
        eliminatedId = playerId;
        result = `Comparaison : ${theirVal} > ${myVal} — ${getName(playerId)} éliminé(e) !`;
      } else {
        result = `Égalité (${myVal}) — personne n'est éliminé(e).`;
      }
      break;
    }
    case 'handmaid': {
      players = { ...players, [playerId]: { ...players[playerId], isProtected: true } };
      result = `${getName(playerId)} est protégé(e) jusqu'au prochain tour.`;
      break;
    }
    case 'prince': {
      if (!targetId) { result = 'Cible manquante'; break; }
      const tgt = players[targetId];
      if (!tgt || tgt.isEliminated) { result = 'Cible invalide'; break; }
      if (tgt.isProtected && targetId !== playerId) { result = `${getName(targetId)} est protégé(e) !`; break; }
      const discardedCard = tgt.hand[0];
      targetCard = discardedCard;
      if (discardedCard?.id === 'princess') {
        players = { ...players, [targetId]: { ...tgt, isEliminated: true, hand: [], discardPile: [...tgt.discardPile, { card: discardedCard, result: 'Défaussé par le Prince' }] } };
        eliminatedId = targetId;
        result = `${getName(targetId)} défausse la 💌 Princesse — éliminé(e) !`;
      } else {
        let newCard: LLCard;
        if (deck.length > 0) { newCard = deck[deck.length - 1]; deck = deck.slice(0, -1); }
        else newCard = state.removedCard;
        players = { ...players, [targetId]: { ...tgt, hand: [newCard], discardPile: discardedCard ? [...tgt.discardPile, { card: discardedCard, result: 'Défaussé par le Prince' }] : tgt.discardPile } };
        result = `${getName(targetId)} défausse ${discardedCard?.nameFr ?? '?'} et pioche une nouvelle carte.`;
      }
      break;
    }
    case 'king': {
      if (!targetId) { result = 'Cible manquante'; break; }
      const tgt = players[targetId];
      if (!tgt || tgt.isEliminated) { result = 'Cible invalide'; break; }
      if (tgt.isProtected) { result = `${getName(targetId)} est protégé(e) !`; break; }
      const myH = players[playerId].hand;
      const thH = tgt.hand;
      players = { ...players, [playerId]: { ...players[playerId], hand: thH }, [targetId]: { ...tgt, hand: myH } };
      result = `${getName(playerId)} échange sa main avec ${getName(targetId)}.`;
      break;
    }
    case 'countess': {
      result = `${getName(playerId)} joue la Comtesse.`;
      break;
    }
    case 'princess': {
      players = { ...players, [playerId]: { ...players[playerId], isEliminated: true, hand: [] } };
      eliminatedId = playerId;
      result = `${getName(playerId)} défausse la 💌 Princesse — éliminé(e) !`;
      break;
    }
  }

  // Add to discard pile
  players = {
    ...players,
    [playerId]: { ...players[playerId], discardPile: [...players[playerId].discardPile, { card: playedCard, targetId, targetCard, guess, result }] },
  };

  const activePlayers = state.playerOrder.filter((id) => !players[id].isEliminated);
  const actionLog: LLActionLog = { playerId, playerName: getName(playerId), card: playedCard, targetId, targetName: targetId ? getName(targetId) : undefined, targetCard, guess, result, eliminatedId };

  let newState: LLServerGameState = { ...state, players, deck, activePlayers, lastAction: actionLog };

  // Check round end
  const ended = llCheckRoundEnd(newState);
  if (ended) return { newState: ended, actionLog, peekCard };

  // Advance turn
  newState = llAdvanceTurn(newState);
  return { newState, actionLog, peekCard };
}

function makeLog(playerId: string, playerName: string, card: LLCard, result: string): LLActionLog {
  return { playerId, playerName, card, result };
}

function llCheckRoundEnd(state: LLServerGameState): LLServerGameState | null {
  if (state.activePlayers.length === 1) {
    const winnerId = state.activePlayers[0];
    return llAwardToken({ ...state, phase: 'round_end', roundWinnerId: winnerId });
  }
  if (state.deck.length === 0) {
    // Compare hands
    let best = -1; let winnerId: string | null = null;
    for (const id of state.activePlayers) {
      const v = state.players[id].hand[0]?.value ?? 0;
      if (v > best) { best = v; winnerId = id; }
    }
    // Tie-break: sum of discards
    const tied = state.activePlayers.filter((id) => (state.players[id].hand[0]?.value ?? 0) === best);
    if (tied.length > 1) {
      let bestSum = -1;
      for (const id of tied) {
        const s = state.players[id].discardPile.reduce((a, p) => a + p.card.value, 0);
        if (s > bestSum) { bestSum = s; winnerId = id; }
      }
    }
    return llAwardToken({ ...state, phase: 'round_end', roundWinnerId: winnerId });
  }
  return null;
}

function llAwardToken(state: LLServerGameState): LLServerGameState {
  if (!state.roundWinnerId) return state;
  const tokens = { ...state.tokens, [state.roundWinnerId]: (state.tokens[state.roundWinnerId] ?? 0) + 1 };
  const gameWinnerId = tokens[state.roundWinnerId] >= state.tokensToWin ? state.roundWinnerId : null;
  return { ...state, tokens, phase: gameWinnerId ? 'game_over' : 'round_end', gameWinnerId };
}

function llAdvanceTurn(state: LLServerGameState): LLServerGameState {
  const next = (state.currentPlayerIndex + 1) % state.activePlayers.length;
  return { ...state, currentPlayerIndex: next, phase: 'drawing' };
}

// ─── Build client state ───────────────────────────────────────────────────────

export function buildLLClientState(
  state: LLServerGameState,
  playerId: string,
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
): LLClientGameState {
  const isEnd = state.phase === 'round_end' || state.phase === 'game_over';
  const currentPlayerId = state.activePlayers[state.currentPlayerIndex] ?? '';

  const players: LLClientPlayerSummary[] = state.playerOrder.map((id) => ({
    id,
    name: playerNames[id] ?? id,
    avatar: playerAvatars[id] ?? '🐮',
    isEliminated: state.players[id]?.isEliminated ?? false,
    isProtected: state.players[id]?.isProtected ?? false,
    isCurrentPlayer: currentPlayerId === id && !isEnd,
    discardPile: state.players[id]?.discardPile ?? [],
    handSize: state.players[id]?.hand.length ?? 0,
    tokens: state.tokens[id] ?? 0,
  }));

  return {
    hand: state.players[playerId]?.hand ?? [],
    players,
    deckSize: state.deck.length,
    phase: state.phase,
    roundNumber: state.roundNumber,
    currentPlayerId,
    isMyTurn: currentPlayerId === playerId && state.phase === 'playing',
    tokens: state.tokens,
    tokensToWin: state.tokensToWin,
    roundWinnerId: state.roundWinnerId,
    gameWinnerId: state.gameWinnerId,
    lastAction: state.lastAction,
    removedCard: isEnd ? state.removedCard : null,
    peekCard: null,
  };
}
