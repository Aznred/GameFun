import { EventEmitter } from 'events';
import { WlServerState, WlClientState } from '../../../shared/wavelengthTypes';
import {
  initWlGame, wlSubmitClue, wlSubmitPlayerGuess, wlForceReveal,
  wlNextRound, buildWlClientState,
} from '../../../shared/wavelengthLogic';

export type WlManagerEvent =
  | { type: 'state_update'; states: Map<string, WlClientState> }
  | { type: 'game_over'; states: Map<string, WlClientState>; winnerNames: string[] };

export class WavelengthManager extends EventEmitter {
  private state: WlServerState;
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
    this.state = initWlGame(playerIds, playerNames);
  }

  start(): void {
    this.broadcast();
  }

  submitClue(psychicId: string, clue: string): { ok: boolean; error?: string } {
    const result = wlSubmitClue(this.state, psychicId, clue);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    this.broadcast();
    return { ok: true };
  }

  submitGuess(playerId: string, position: number): { ok: boolean; error?: string } {
    const result = wlSubmitPlayerGuess(this.state, playerId, position, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;

    if (this.state.phase === 'game_over') {
      const winnerNames = this.state.winnerIds.map((id) => this.playerNames[id] ?? '?');
      this.emit('event', {
        type: 'game_over',
        states: this.getAllClientStates(),
        winnerNames,
      } as WlManagerEvent);
    } else {
      this.broadcast();
    }
    return { ok: true };
  }

  forceReveal(): void {
    this.state = wlForceReveal(this.state, this.playerNames);
    if (this.state.phase === 'game_over') {
      const winnerNames = this.state.winnerIds.map((id) => this.playerNames[id] ?? '?');
      this.emit('event', {
        type: 'game_over',
        states: this.getAllClientStates(),
        winnerNames,
      } as WlManagerEvent);
    } else {
      this.broadcast();
    }
  }

  startNextRound(): void {
    if (this.state.phase !== 'reveal') return;
    this.state = wlNextRound(this.state);
    this.broadcast();
  }

  private broadcast(): void {
    this.emit('event', { type: 'state_update', states: this.getAllClientStates() } as WlManagerEvent);
  }

  getAllClientStates(): Map<string, WlClientState> {
    const map = new Map<string, WlClientState>();
    for (const id of this.state.playerOrder) {
      map.set(id, buildWlClientState(this.state, id, this.playerNames, this.playerAvatars));
    }
    return map;
  }

  getClientState(playerId: string): WlClientState {
    return buildWlClientState(this.state, playerId, this.playerNames, this.playerAvatars);
  }

  getPhase() { return this.state.phase; }
  getWinnerIds() { return this.state.winnerIds; }
  getScores(): Record<string, number> { return { ...this.state.playerScores }; }
}
