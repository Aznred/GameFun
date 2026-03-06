import { EventEmitter } from 'events';
import {
  ServerGameState,
  ClientGameState,
  ClientPlayerSummary,
  GameEndResult,
  RoundResult,
  Card,
} from '../../../shared/types';
import {
  initGameState,
  sortPlays,
  processPlay,
  takeRowWithCard,
  buildRoundResult,
  isGameOver,
  PendingPlay,
} from '../../../shared/gameLogic';

export type GameManagerEvent =
  | { type: 'game_started'; states: Map<string, ClientGameState> }
  | { type: 'game_state'; states: Map<string, ClientGameState> }
  | { type: 'round_result'; result: RoundResult; states: Map<string, ClientGameState> }
  | { type: 'choose_row'; playerId: string; card: Card; round: number }
  | { type: 'game_over'; result: GameEndResult };

export class GameManager extends EventEmitter {
  private state: ServerGameState;
  private playerNames: Record<string, string>;
  private playerAvatars: Record<string, string>;
  private pendingPlays: PendingPlay[] = [];
  private playQueue: PendingPlay[] = [];
  private roundResults: PlayResult_[] = [];
  private resolving = false;
  private rowSelectionResolve: ((rowIndex: number) => void) | null = null;
  private awaitingPlayerId: string | null = null;

  constructor(playerIds: string[], playerNames: Record<string, string>, playerAvatars: Record<string, string>) {
    super();
    this.playerNames = playerNames;
    this.playerAvatars = playerAvatars;
    this.state = initGameState(playerIds);
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  getClientState(playerId: string): ClientGameState {
    const me = this.state.players[playerId];
    const players: ClientPlayerSummary[] = Object.entries(this.state.players).map(([id, p]) => ({
      id,
      name: this.playerNames[id] ?? id,
      avatar: this.playerAvatars[id] ?? '🐮',
      score: p.score,
      hasPlayed: p.selectedCard !== null,
      isChoosingRow: this.state.awaitingRowSelection === id,
      isConnected: true,
    }));

    return {
      rows: this.state.rows.map((r) => [...r]),
      myHand: me ? [...me.hand] : [],
      mySelectedCard: me?.selectedCard ?? null,
      myScore: me?.score ?? 0,
      players,
      round: this.state.round,
      totalRounds: this.state.totalRounds,
      phase: this.state.phase,
      lastRoundResult: this.state.lastRoundResult,
    };
  }

  getAllClientStates(): Map<string, ClientGameState> {
    const map = new Map<string, ClientGameState>();
    for (const id of Object.keys(this.state.players)) {
      map.set(id, this.getClientState(id));
    }
    return map;
  }

  playCard(playerId: string, cardNumber: number): boolean {
    if (this.state.phase !== 'playing') return false;
    const player = this.state.players[playerId];
    if (!player) return false;
    if (player.selectedCard !== null) return false;

    const cardIdx = player.hand.findIndex((c) => c.number === cardNumber);
    if (cardIdx === -1) return false;

    const card = player.hand.splice(cardIdx, 1)[0];
    player.selectedCard = card;

    this.pendingPlays.push({ playerId, playerName: this.playerNames[playerId] ?? playerId, card });

    const allPlayed = Object.values(this.state.players).every((p) => p.selectedCard !== null);
    if (allPlayed) {
      this.resolveRound();
    }

    return true;
  }

  selectRow(playerId: string, rowIndex: number): boolean {
    if (this.state.phase !== 'row_selection') return false;
    if (this.awaitingPlayerId !== playerId) return false;
    if (rowIndex < 0 || rowIndex >= this.state.rows.length) return false;
    if (this.rowSelectionResolve) {
      this.rowSelectionResolve(rowIndex);
      return true;
    }
    return false;
  }

  // ─── Round resolution ────────────────────────────────────────────────────────

  private async resolveRound(): Promise<void> {
    if (this.resolving) return;
    this.resolving = true;

    this.playQueue = sortPlays(this.pendingPlays);
    this.pendingPlays = [];
    this.roundResults = [];

    for (const play of this.playQueue) {
      const { result, needsRowSelection } = processPlay(play, this.state, this.playerNames);

      if (needsRowSelection) {
        // Pause and ask the player to pick a row
        this.state.phase = 'row_selection';
        this.state.awaitingRowSelection = play.playerId;
        this.awaitingPlayerId = play.playerId;

        this.emit('event', {
          type: 'choose_row',
          playerId: play.playerId,
          card: play.card,
          round: this.state.round,
        } as GameManagerEvent);

        // Broadcast waiting state
        this.emit('event', {
          type: 'game_state',
          states: this.getAllClientStates(),
        } as GameManagerEvent);

        const chosenRow = await this.waitForRowSelection();
        const { pointsGained, rowCardsTaken } = takeRowWithCard(
          play.card,
          chosenRow,
          this.state.rows,
          this.state.players[play.playerId]
        );

        this.state.awaitingRowSelection = null;
        this.awaitingPlayerId = null;
        this.state.phase = 'playing';

        this.roundResults.push({
          ...result,
          rowIndex: chosenRow,
          tookRow: true,
          pointsGained,
          rowCardsTaken,
        });
      } else {
        this.roundResults.push(result);
      }
    }

    // All plays processed
    const roundResult = buildRoundResult(this.state.round, this.roundResults, this.state);
    this.state.lastRoundResult = roundResult;

    // Reset selected cards
    for (const p of Object.values(this.state.players)) {
      p.selectedCard = null;
    }

    if (isGameOver(this.state)) {
      this.state.phase = 'game_over';
      this.resolving = false;

      this.emit('event', {
        type: 'round_result',
        result: roundResult,
        states: this.getAllClientStates(),
      } as GameManagerEvent);

      this.emit('event', { type: 'game_over', result: this.buildGameEndResult() } as GameManagerEvent);
      return;
    }

    this.state.round++;
    this.state.phase = 'playing';
    this.resolving = false;

    this.emit('event', {
      type: 'round_result',
      result: roundResult,
      states: this.getAllClientStates(),
    } as GameManagerEvent);
  }

  private waitForRowSelection(): Promise<number> {
    return new Promise<number>((resolve) => {
      this.rowSelectionResolve = (rowIndex: number) => {
        this.rowSelectionResolve = null;
        resolve(rowIndex);
      };
    });
  }

  // ─── Game end ────────────────────────────────────────────────────────────────

  private buildGameEndResult(): GameEndResult {
    const players = Object.entries(this.state.players)
      .map(([id, p]) => ({
        id,
        name: this.playerNames[id] ?? id,
        avatar: this.playerAvatars[id] ?? '🐮',
        score: p.score,
        rank: 0,
      }))
      .sort((a, b) => a.score - b.score);

    players.forEach((p, i) => (p.rank = i + 1));

    return { players, winnerId: players[0].id, gameId: 'six-qui-prend' };
  }
}

// Local alias to avoid import clash
type PlayResult_ = import('../../../shared/types').PlayResult;
