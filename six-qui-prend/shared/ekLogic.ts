import {
  EKCard, EKCardType, generateEKBaseDeck, isActionCard, isCatCard,
} from './ekCards';
import { EKServerState, EKPhase, EKClientState } from './ekTypes';

// ─── Utils ────────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getAlivePlayers(state: EKServerState): string[] {
  return state.playerOrder.filter((id) => !state.eliminatedPlayerIds.includes(id));
}

function currentPlayer(state: EKServerState): string {
  return state.playerOrder[state.currentPlayerIndex];
}

function clearPending(s: EKServerState): Partial<EKServerState> {
  return { pendingCard: null, pendingPairCard: null, pendingCardPlayerId: null, pendingTargetPlayerId: null, nopeCount: 0 };
}

/** Advance to the next alive player */
function advanceTurn(state: EKServerState, turnsRemaining = 1): EKServerState {
  const alive = getAlivePlayers(state);
  if (alive.length <= 1) {
    return { ...state, ...clearPending(state), phase: 'game_over', winnerIds: alive };
  }
  const curId = currentPlayer(state);
  const curAliveIdx = alive.indexOf(curId);
  const nextAliveIdx = (curAliveIdx + 1) % alive.length;
  const nextPlayerId = alive[nextAliveIdx];
  const nextIdx = state.playerOrder.indexOf(nextPlayerId);
  return {
    ...state,
    ...clearPending(state),
    phase: 'playing',
    currentPlayerIndex: nextIdx,
    turnsRemaining,
    seeTheFutureCards: {},
  };
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initEKGame(
  playerIds: string[],
  _playerNames: Record<string, string>,
  _playerAvatars: Record<string, string>,
): EKServerState {
  let baseDeck = shuffle(generateEKBaseDeck());

  // Give each player 4 cards + 1 defuse
  const hands: Record<string, EKCard[]> = {};
  for (const pid of playerIds) {
    const dealt = baseDeck.slice(0, 4);
    baseDeck = baseDeck.slice(4);
    dealt.push({ id: `defuse-init-${pid}`, type: 'defuse' });
    hands[pid] = dealt;
  }

  // Add (N-1) exploding kittens + 2 extra defuses to remaining deck
  const ekCards: EKCard[] = Array.from({ length: playerIds.length - 1 }, (_, i) => ({
    id: `ek-main-${i}`,
    type: 'exploding_kitten' as EKCardType,
  }));
  const extraDefuses: EKCard[] = [
    { id: 'defuse-extra-1', type: 'defuse' },
    { id: 'defuse-extra-2', type: 'defuse' },
  ];

  const finalDeck = shuffle([...baseDeck, ...ekCards, ...extraDefuses]);

  return {
    phase: 'playing',
    playerOrder: [...playerIds],
    currentPlayerIndex: 0,
    turnsRemaining: 1,
    hands,
    deck: finalDeck,
    discardPile: [],
    pendingCard: null,
    pendingPairCard: null,
    pendingCardPlayerId: null,
    pendingTargetPlayerId: null,
    seeTheFutureCards: {},
    eliminatedPlayerIds: [],
    winnerIds: [],
    lastAction: 'La partie commence !',
    nopeCount: 0,
  };
}

// ─── Play a single action card ────────────────────────────────────────────────

export function ekPlayCard(
  state: EKServerState,
  playerId: string,
  cardId: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: EKServerState; enterNope?: boolean; error?: string } {
  if (state.phase !== 'playing') return { ok: false, newState: state, error: 'Pas la bonne phase.' };
  if (currentPlayer(state) !== playerId) return { ok: false, newState: state, error: "Ce n'est pas votre tour." };

  const hand = state.hands[playerId];
  const card = hand?.find((c) => c.id === cardId);
  if (!card) return { ok: false, newState: state, error: 'Carte introuvable.' };
  if (card.type === 'exploding_kitten' || card.type === 'defuse') {
    return { ok: false, newState: state, error: 'Vous ne pouvez pas jouer cette carte directement.' };
  }
  if (isCatCard(card.type)) {
    return { ok: false, newState: state, error: 'Les cartes chats se jouent en paire.' };
  }
  if (card.type === 'nope') {
    return { ok: false, newState: state, error: 'Utilisez le bouton Nope ! pour jouer cette carte.' };
  }

  const newHand = hand.filter((c) => c.id !== cardId);
  const pname = playerNames[playerId] ?? '?';

  return {
    ok: true,
    enterNope: true,
    newState: {
      ...state,
      hands: { ...state.hands, [playerId]: newHand },
      discardPile: [...state.discardPile, card],
      pendingCard: card,
      pendingPairCard: null,
      pendingCardPlayerId: playerId,
      pendingTargetPlayerId: null,
      phase: 'nope_window',
      nopeCount: 0,
      lastAction: `${pname} joue ${card.type.replace(/_/g, ' ')}`,
    },
  };
}

// ─── Play a cat pair ──────────────────────────────────────────────────────────

export function ekPlayPair(
  state: EKServerState,
  playerId: string,
  cardId1: string,
  cardId2: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: EKServerState; enterNope?: boolean; error?: string } {
  if (state.phase !== 'playing') return { ok: false, newState: state, error: 'Pas la bonne phase.' };
  if (currentPlayer(state) !== playerId) return { ok: false, newState: state, error: "Ce n'est pas votre tour." };

  const hand = state.hands[playerId];
  const c1 = hand?.find((c) => c.id === cardId1);
  const c2 = hand?.find((c) => c.id === cardId2);
  if (!c1 || !c2) return { ok: false, newState: state, error: 'Cartes introuvables.' };
  if (c1.type !== c2.type) return { ok: false, newState: state, error: 'Les deux cartes doivent être identiques.' };
  if (!isCatCard(c1.type)) return { ok: false, newState: state, error: 'Seules les cartes chats peuvent être jouées en paire.' };

  const newHand = hand.filter((c) => c.id !== cardId1 && c.id !== cardId2);
  const pname = playerNames[playerId] ?? '?';

  return {
    ok: true,
    enterNope: true,
    newState: {
      ...state,
      hands: { ...state.hands, [playerId]: newHand },
      discardPile: [...state.discardPile, c1, c2],
      pendingCard: c1,
      pendingPairCard: c2,
      pendingCardPlayerId: playerId,
      pendingTargetPlayerId: null,
      phase: 'nope_window',
      nopeCount: 0,
      lastAction: `${pname} joue une paire de ${c1.type.replace(/_/g, ' ')}`,
    },
  };
}

// ─── Play Nope ────────────────────────────────────────────────────────────────

export function ekPlayNope(
  state: EKServerState,
  playerId: string,
  cardId: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: EKServerState; error?: string } {
  if (state.phase !== 'nope_window') return { ok: false, newState: state, error: 'Rien à annuler pour le moment.' };
  if (state.pendingCardPlayerId === playerId) return { ok: false, newState: state, error: 'Vous ne pouvez pas Nope votre propre carte.' };
  if (state.eliminatedPlayerIds.includes(playerId)) return { ok: false, newState: state, error: 'Vous êtes éliminé.' };

  const hand = state.hands[playerId];
  const nopeCard = hand?.find((c) => c.id === cardId && c.type === 'nope');
  if (!nopeCard) return { ok: false, newState: state, error: "Vous n'avez pas de carte Nope." };

  const newHand = hand.filter((c) => c.id !== cardId);
  const pname = playerNames[playerId] ?? '?';
  const newNopeCount = state.nopeCount + 1;
  const isNoped = newNopeCount % 2 === 1;

  return {
    ok: true,
    newState: {
      ...state,
      hands: { ...state.hands, [playerId]: newHand },
      discardPile: [...state.discardPile, nopeCard],
      nopeCount: newNopeCount,
      lastAction: isNoped
        ? `🚫 ${pname} NOPE ! La carte est annulée.`
        : `🚫 ${pname} NOPE le Nope ! La carte se résout quand même.`,
    },
  };
}

// ─── Resolve nope window (called when timer expires) ─────────────────────────

export function ekResolveNope(
  state: EKServerState,
  playerNames: Record<string, string>,
): { newState: EKServerState; needsTarget: boolean } {
  if (state.phase !== 'nope_window' || !state.pendingCard) {
    return { newState: state, needsTarget: false };
  }

  // Card was nopped (odd count) → cancel
  if (state.nopeCount % 2 === 1) {
    const pname = state.pendingCardPlayerId ? (playerNames[state.pendingCardPlayerId] ?? '?') : '?';
    return {
      newState: {
        ...state,
        ...clearPending(state),
        phase: 'playing',
        lastAction: `${pname}'s card was noped!`,
      },
      needsTarget: false,
    };
  }

  const card = state.pendingCard;
  const isPair = state.pendingPairCard !== null;
  const playerId = state.pendingCardPlayerId!;

  // Cards that need a target: favor + cat pair
  if (card.type === 'favor' || isPair) {
    return {
      newState: {
        ...state,
        phase: 'awaiting_target',
        nopeCount: 0,
        lastAction: `${playerNames[playerId] ?? '?'} doit choisir une cible`,
      },
      needsTarget: true,
    };
  }

  // Apply effect immediately
  return { newState: applyCardEffect(state, card, playerId, playerNames), needsTarget: false };
}

// ─── Apply a card's effect ────────────────────────────────────────────────────

function applyCardEffect(
  state: EKServerState,
  card: EKCard,
  playerId: string,
  playerNames: Record<string, string>,
): EKServerState {
  const pname = playerNames[playerId] ?? '?';
  const base = { ...state, ...clearPending(state) };

  switch (card.type) {
    case 'attack': {
      // End current turn, next player takes turnsRemaining+1 turns
      const nextTurns = state.turnsRemaining + 1;
      return {
        ...advanceTurn(base, nextTurns),
        lastAction: `⚔️ ${pname} attaque ! Le joueur suivant doit jouer ${nextTurns} fois.`,
      };
    }
    case 'skip': {
      const remaining = state.turnsRemaining - 1;
      if (remaining <= 0) {
        return { ...advanceTurn(base), lastAction: `⏭ ${pname} passe son tour.` };
      }
      return { ...base, phase: 'playing', turnsRemaining: remaining, lastAction: `⏭ ${pname} passe (${remaining} restant).` };
    }
    case 'shuffle': {
      return {
        ...base,
        deck: shuffle(state.deck),
        phase: 'playing',
        lastAction: `🔀 ${pname} mélange le deck !`,
      };
    }
    case 'see_the_future': {
      const top3 = [...state.deck].slice(-3).reverse();
      return {
        ...base,
        seeTheFutureCards: { ...state.seeTheFutureCards, [playerId]: top3 },
        phase: 'playing',
        lastAction: `🔮 ${pname} voit l'avenir...`,
      };
    }
    default:
      return { ...base, phase: 'playing' };
  }
}

// ─── Select target (for Favor or cat pair) ────────────────────────────────────

export function ekSelectTarget(
  state: EKServerState,
  playerId: string,
  targetPlayerId: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: EKServerState; error?: string } {
  if (state.phase !== 'awaiting_target') return { ok: false, newState: state, error: 'Pas la bonne phase.' };
  if (state.pendingCardPlayerId !== playerId) return { ok: false, newState: state, error: "Ce n'est pas à vous." };
  if (state.eliminatedPlayerIds.includes(targetPlayerId)) return { ok: false, newState: state, error: 'Ce joueur est éliminé.' };
  if (targetPlayerId === playerId) return { ok: false, newState: state, error: 'Vous ne pouvez pas vous cibler.' };
  if ((state.hands[targetPlayerId]?.length ?? 0) === 0) return { ok: false, newState: state, error: "Ce joueur n'a pas de cartes." };

  const isPair = state.pendingPairCard !== null;
  const pname = playerNames[playerId] ?? '?';
  const tname = playerNames[targetPlayerId] ?? '?';

  if (isPair) {
    // Steal a random card
    const targetHand = state.hands[targetPlayerId];
    const idx = Math.floor(Math.random() * targetHand.length);
    const stolen = targetHand[idx];
    return {
      ok: true,
      newState: {
        ...state,
        ...clearPending(state),
        phase: 'playing',
        hands: {
          ...state.hands,
          [playerId]: [...state.hands[playerId], stolen],
          [targetPlayerId]: targetHand.filter((_, i) => i !== idx),
        },
        lastAction: `🐱 ${pname} vole une carte à ${tname} !`,
      },
    };
  }

  // Favor: target must choose which card to give
  return {
    ok: true,
    newState: {
      ...state,
      phase: 'awaiting_favor_give',
      pendingTargetPlayerId: targetPlayerId,
      lastAction: `🙏 ${pname} demande une faveur à ${tname}`,
    },
  };
}

// ─── Give a card for Favor ────────────────────────────────────────────────────

export function ekFavorGive(
  state: EKServerState,
  giverId: string,
  cardId: string,
  playerNames: Record<string, string>,
): { ok: boolean; newState: EKServerState; error?: string } {
  if (state.phase !== 'awaiting_favor_give') return { ok: false, newState: state, error: 'Pas la bonne phase.' };
  if (state.pendingTargetPlayerId !== giverId) return { ok: false, newState: state, error: "Ce n'est pas à vous." };

  const hand = state.hands[giverId];
  const card = hand?.find((c) => c.id === cardId);
  if (!card) return { ok: false, newState: state, error: 'Carte introuvable.' };

  const requesterId = state.pendingCardPlayerId!;
  const gname = playerNames[giverId] ?? '?';
  const rname = playerNames[requesterId] ?? '?';

  return {
    ok: true,
    newState: {
      ...state,
      ...clearPending(state),
      phase: 'playing',
      hands: {
        ...state.hands,
        [giverId]: hand.filter((c) => c.id !== cardId),
        [requesterId]: [...state.hands[requesterId], card],
      },
      lastAction: `🙏 ${gname} donne une carte à ${rname}.`,
    },
  };
}

// ─── Draw a card ──────────────────────────────────────────────────────────────

export type DrawResult =
  | { ok: true; newState: EKServerState; drewEK: false }
  | { ok: true; newState: EKServerState; drewEK: true; hasDefuse: boolean }
  | { ok: false; newState: EKServerState; error: string };

export function ekDrawCard(
  state: EKServerState,
  playerId: string,
  playerNames: Record<string, string>,
): DrawResult {
  if (state.phase !== 'playing') return { ok: false, newState: state, error: 'Pas la bonne phase.' };
  if (currentPlayer(state) !== playerId) return { ok: false, newState: state, error: "Ce n'est pas votre tour." };
  if (state.deck.length === 0) return { ok: false, newState: state, error: 'Le deck est vide.' };

  const pname = playerNames[playerId] ?? '?';
  const drawn = state.deck[state.deck.length - 1];
  const newDeck = state.deck.slice(0, -1);

  if (drawn.type === 'exploding_kitten') {
    const defuse = state.hands[playerId]?.find((c) => c.type === 'defuse');
    if (defuse) {
      const newHand = state.hands[playerId].filter((c) => c.id !== defuse.id);
      return {
        ok: true,
        drewEK: true,
        hasDefuse: true,
        newState: {
          ...state,
          deck: newDeck,
          discardPile: [...state.discardPile, defuse],
          hands: { ...state.hands, [playerId]: newHand },
          phase: 'awaiting_insert',
          pendingCard: drawn,
          pendingCardPlayerId: playerId,
          lastAction: `💣 ${pname} a pioché un Chaton Explosif ! Désamorçage...`,
        },
      };
    } else {
      // Eliminated
      const newElim = [...state.eliminatedPlayerIds, playerId];
      const alive = state.playerOrder.filter((id) => !newElim.includes(id));
      const newDiscard = [...state.discardPile, drawn];

      if (alive.length <= 1) {
        return {
          ok: true, drewEK: true, hasDefuse: false,
          newState: {
            ...state,
            deck: newDeck,
            discardPile: newDiscard,
            eliminatedPlayerIds: newElim,
            phase: 'game_over',
            winnerIds: alive,
            lastAction: `💥 ${pname} EXPLOSE !`,
          },
        };
      }

      const nextState = advanceTurn({
        ...state,
        deck: newDeck,
        discardPile: newDiscard,
        eliminatedPlayerIds: newElim,
        lastAction: `💥 ${pname} EXPLOSE !`,
      });
      return { ok: true, drewEK: true, hasDefuse: false, newState: nextState };
    }
  }

  // Normal card — add to hand
  const newHand = [...state.hands[playerId], drawn];
  const newTurns = state.turnsRemaining - 1;

  if (newTurns <= 0) {
    const next = advanceTurn({ ...state, deck: newDeck, hands: { ...state.hands, [playerId]: newHand }, lastAction: `${pname} pioche.` });
    return { ok: true, drewEK: false, newState: next };
  }

  return {
    ok: true, drewEK: false,
    newState: {
      ...state,
      deck: newDeck,
      hands: { ...state.hands, [playerId]: newHand },
      turnsRemaining: newTurns,
      lastAction: `${pname} pioche (${newTurns} tour${newTurns > 1 ? 's' : ''} restant).`,
    },
  };
}

// ─── Insert kitten back into deck ─────────────────────────────────────────────

export function ekInsertKitten(
  state: EKServerState,
  playerId: string,
  position: number,
  playerNames: Record<string, string>,
): { ok: boolean; newState: EKServerState; error?: string } {
  if (state.phase !== 'awaiting_insert') return { ok: false, newState: state, error: 'Pas la bonne phase.' };
  if (state.pendingCardPlayerId !== playerId) return { ok: false, newState: state, error: "Ce n'est pas à vous." };

  const ek = state.pendingCard!;
  const clampedPos = Math.max(0, Math.min(state.deck.length, Math.round(position)));
  // position 0 = top of deck (end of array), position N = bottom
  const insertIdx = state.deck.length - clampedPos;
  const newDeck = [...state.deck];
  newDeck.splice(insertIdx, 0, ek);

  const pname = playerNames[playerId] ?? '?';
  const base: EKServerState = {
    ...state,
    ...clearPending(state),
    deck: newDeck,
    lastAction: `${pname} remet le Chaton Explosif dans le deck.`,
  };

  const newTurns = state.turnsRemaining - 1;
  if (newTurns <= 0) return { ok: true, newState: advanceTurn(base) };
  return { ok: true, newState: { ...base, phase: 'playing', turnsRemaining: newTurns } };
}

// ─── Build client state ───────────────────────────────────────────────────────

export function buildEKClientState(
  state: EKServerState,
  viewerId: string,
  playerNames: Record<string, string>,
  playerAvatars: Record<string, string>,
  nopeWindowSeq = 0,
): EKClientState {
  const curPlayerId = state.playerOrder[state.currentPlayerIndex];
  const isMyTurn = curPlayerId === viewerId;
  const amIEliminated = state.eliminatedPlayerIds.includes(viewerId);

  const players = state.playerOrder.map((id) => ({
    id,
    name: playerNames[id] ?? id,
    avatar: playerAvatars[id] ?? '🐱',
    handSize: state.hands[id]?.length ?? 0,
    isAlive: !state.eliminatedPlayerIds.includes(id),
    isConnected: true,
  }));

  const canPlayNope =
    state.phase === 'nope_window' &&
    state.pendingCardPlayerId !== viewerId &&
    !amIEliminated &&
    (state.hands[viewerId]?.some((c) => c.type === 'nope') ?? false);

  return {
    phase: state.phase,
    players,
    currentPlayerId: curPlayerId,
    turnsRemaining: state.turnsRemaining,
    myHand: state.hands[viewerId] ?? [],
    deckSize: state.deck.length,
    topDiscard: state.discardPile.length > 0 ? state.discardPile[state.discardPile.length - 1] : null,
    pendingCard: state.pendingCard,
    pendingCardPlayerName: state.pendingCardPlayerId ? (playerNames[state.pendingCardPlayerId] ?? '?') : null,
    pendingTargetPlayerId: state.pendingTargetPlayerId,
    seeTheFutureCards: state.seeTheFutureCards[viewerId] ?? null,
    winnerIds: state.winnerIds,
    winnerNames: state.winnerIds.map((id) => playerNames[id] ?? '?'),
    lastAction: state.lastAction,
    isMyTurn,
    amIEliminated,
    canDrawCard: isMyTurn && state.phase === 'playing' && !amIEliminated,
    canPlayNope,
    isAwaitingMyFavorGive: state.phase === 'awaiting_favor_give' && state.pendingTargetPlayerId === viewerId,
    isSelectingTarget: state.phase === 'awaiting_target' && state.pendingCardPlayerId === viewerId,
    nopeCount: state.nopeCount,
    nopeWindowSeq,
  };
}

