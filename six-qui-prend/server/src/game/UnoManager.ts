import { EventEmitter } from 'events';
import { UnoColor } from '../../../shared/unoCards';
import { UnoServerGameState, UnoClientGameState, UnoActionLog } from '../../../shared/unoTypes';
import {
  initUnoRound,
  unoPlayCard,
  unoDrawCard,
  unoPassTurn,
  unoChooseColor,
  unoCallUno,
  unoNextRound,
  buildUnoClientState,
} from '../../../shared/unoLogic';

export type UnoManagerEvent =
  | { type: 'game_started'; states: Map<string, UnoClientGameState> }
  | { type: 'state_update'; states: Map<string, UnoClientGameState>; log?: UnoActionLog }
  | { type: 'color_pick'; playerId: string; states: Map<string, UnoClientGameState> }
  | { type: 'round_end'; states: Map<string, UnoClientGameState> }
  | { type: 'game_over'; states: Map<string, UnoClientGameState>; winnerId: string; winnerName: string };

export class UnoManager extends EventEmitter {
  private state: UnoServerGameState;
  private playerNames: Record<string, string>;
  private playerAvatars: Record<string, string>;

  constructor(
    playerIds: string[],
    playerNames: Record<string, string>,
    playerAvatars: Record<string, string>,
  ) {
    super();
    this.playerNames = playerNames;
    this.playerAvatars = playerAvatars;
    this.state = initUnoRound(playerIds, playerNames, playerAvatars);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  start(): void {
    this.emit('event', { type: 'game_started', states: this.getAllClientStates() } as UnoManagerEvent);
  }

  playCard(playerId: string, cardId: string): { ok: boolean; error?: string } {
    const result = unoPlayCard(this.state, playerId, cardId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };

    this.state = result.newState;

    if (this.state.phase === 'game_over') {
      const winner = this.state.playerOrder.find((id) => id === this.state.gameWinnerId);
      this.emit('event', {
        type: 'game_over',
        states: this.getAllClientStates(),
        winnerId: this.state.gameWinnerId ?? '',
        winnerName: this.playerNames[this.state.gameWinnerId ?? ''] ?? '?',
      } as UnoManagerEvent);
    } else if (this.state.phase === 'round_end') {
      this.emit('event', { type: 'round_end', states: this.getAllClientStates() } as UnoManagerEvent);
    } else if (this.state.phase === 'color_pick') {
      this.emit('event', {
        type: 'color_pick',
        playerId: this.state.pendingColorPickBy!,
        states: this.getAllClientStates(),
      } as UnoManagerEvent);
    } else {
      this.emit('event', {
        type: 'state_update',
        states: this.getAllClientStates(),
        log: result.actionLog,
      } as UnoManagerEvent);
    }

    return { ok: true };
  }

  drawCard(playerId: string): { ok: boolean; error?: string } {
    const result = unoDrawCard(this.state, playerId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };

    this.state = result.newState;
    this.emit('event', { type: 'state_update', states: this.getAllClientStates() } as UnoManagerEvent);
    return { ok: true };
  }

  passTurn(playerId: string): { ok: boolean; error?: string } {
    const result = unoPassTurn(this.state, playerId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };

    this.state = result.newState;
    this.emit('event', { type: 'state_update', states: this.getAllClientStates() } as UnoManagerEvent);
    return { ok: true };
  }

  chooseColor(playerId: string, color: UnoColor): { ok: boolean; error?: string } {
    const result = unoChooseColor(this.state, playerId, color, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };

    this.state = result.newState;
    this.emit('event', { type: 'state_update', states: this.getAllClientStates() } as UnoManagerEvent);
    return { ok: true };
  }

  callUno(callerId: string, targetId: string): { ok: boolean; penalized: boolean; error?: string } {
    const result = unoCallUno(this.state, callerId, targetId, this.playerNames);
    if (!result.ok) return { ok: false, penalized: false, error: result.error };

    this.state = result.newState;
    this.emit('event', { type: 'state_update', states: this.getAllClientStates() } as UnoManagerEvent);
    return { ok: true, penalized: result.penalized };
  }

  startNextRound(): void {
    if (this.state.phase !== 'round_end') return;
    this.state = unoNextRound(
      this.state,
      this.state.playerOrder,
      this.playerNames,
      this.playerAvatars,
    );
    this.emit('event', { type: 'game_started', states: this.getAllClientStates() } as UnoManagerEvent);
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  getAllClientStates(): Map<string, UnoClientGameState> {
    const map = new Map<string, UnoClientGameState>();
    for (const id of this.state.playerOrder) {
      map.set(id, buildUnoClientState(this.state, id, this.playerNames, this.playerAvatars));
    }
    return map;
  }

  getClientState(playerId: string): UnoClientGameState {
    return buildUnoClientState(this.state, playerId, this.playerNames, this.playerAvatars);
  }

  getPhase() { return this.state.phase; }
  getWinnerId() { return this.state.gameWinnerId; }
  getWinnerName() { return this.playerNames[this.state.gameWinnerId ?? ''] ?? '?'; }
  getScores(): Record<string, number> {
    const s: Record<string, number> = {};
    for (const id of this.state.playerOrder) s[id] = this.state.players[id].score;
    return s;
  }
}
