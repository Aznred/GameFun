import { EventEmitter } from 'events';
import { EKServerState, EKClientState } from '../../../shared/ekTypes';
import {
  initEKGame, ekPlayCard, ekPlayPair, ekPlayNope, ekResolveNope,
  ekDrawCard, ekSelectTarget, ekFavorGive, ekInsertKitten,
  buildEKClientState, getAlivePlayers,
} from '../../../shared/ekLogic';

export type EKManagerEvent =
  | { type: 'state_update'; states: Map<string, EKClientState> }
  | { type: 'game_over'; states: Map<string, EKClientState>; winnerNames: string[] };

const NOPE_WINDOW_MS = 3000;

export class EKManager extends EventEmitter {
  private state: EKServerState;
  private playerNames: Record<string, string>;
  private playerAvatars: Record<string, string>;
  private nopeTimer: ReturnType<typeof setTimeout> | null = null;
  private nopeWindowSeq = 0;

  constructor(
    playerIds: string[],
    playerNames: Record<string, string>,
    playerAvatars: Record<string, string>,
  ) {
    super();
    this.playerNames = playerNames;
    this.playerAvatars = playerAvatars;
    this.state = initEKGame(playerIds, playerNames, playerAvatars);
  }

  start(): void {
    this.broadcast();
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  playCard(playerId: string, cardId: string): { ok: boolean; error?: string } {
    const result = ekPlayCard(this.state, playerId, cardId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    if (result.enterNope) this.startNopeWindow();
    else this.broadcastOrEnd();
    return { ok: true };
  }

  playPair(playerId: string, cardId1: string, cardId2: string): { ok: boolean; error?: string } {
    const result = ekPlayPair(this.state, playerId, cardId1, cardId2, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    if (result.enterNope) this.startNopeWindow();
    else this.broadcastOrEnd();
    return { ok: true };
  }

  playNope(playerId: string, cardId: string): { ok: boolean; error?: string } {
    const result = ekPlayNope(this.state, playerId, cardId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    // Extend nope window by 2s on each nope
    this.extendNopeWindow(2000);
    this.broadcast();
    return { ok: true };
  }

  drawCard(playerId: string): { ok: boolean; error?: string } {
    const result = ekDrawCard(this.state, playerId, this.playerNames);
    if (!result.ok) return { ok: false, error: (result as any).error };
    this.state = (result as any).newState;
    this.broadcastOrEnd();
    return { ok: true };
  }

  selectTarget(playerId: string, targetPlayerId: string): { ok: boolean; error?: string } {
    const result = ekSelectTarget(this.state, playerId, targetPlayerId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    this.broadcastOrEnd();
    return { ok: true };
  }

  favorGive(giverId: string, cardId: string): { ok: boolean; error?: string } {
    const result = ekFavorGive(this.state, giverId, cardId, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    this.broadcastOrEnd();
    return { ok: true };
  }

  insertKitten(playerId: string, position: number): { ok: boolean; error?: string } {
    const result = ekInsertKitten(this.state, playerId, position, this.playerNames);
    if (!result.ok) return { ok: false, error: result.error };
    this.state = result.newState;
    this.broadcastOrEnd();
    return { ok: true };
  }

  // ─── Nope window management ─────────────────────────────────────────────────

  private startNopeWindow(): void {
    this.clearNopeTimer();
    this.nopeWindowSeq++;
    this.broadcast();
    this.nopeTimer = setTimeout(() => this.resolveNope(), NOPE_WINDOW_MS);
  }

  private extendNopeWindow(ms: number): void {
    this.clearNopeTimer();
    this.nopeTimer = setTimeout(() => this.resolveNope(), ms);
  }

  private clearNopeTimer(): void {
    if (this.nopeTimer !== null) {
      clearTimeout(this.nopeTimer);
      this.nopeTimer = null;
    }
  }

  private resolveNope(): void {
    this.nopeTimer = null;
    const { newState, needsTarget } = ekResolveNope(this.state, this.playerNames);
    this.state = newState;
    if (!needsTarget) {
      this.broadcastOrEnd();
    } else {
      this.broadcast();
    }
  }

  // ─── Broadcast ──────────────────────────────────────────────────────────────

  private broadcastOrEnd(): void {
    if (this.state.phase === 'game_over') {
      const winnerNames = this.state.winnerIds.map((id) => this.playerNames[id] ?? '?');
      this.emit('event', {
        type: 'game_over',
        states: this.getAllClientStates(),
        winnerNames,
      } as EKManagerEvent);
    } else {
      this.broadcast();
    }
  }

  private broadcast(): void {
    this.emit('event', {
      type: 'state_update',
      states: this.getAllClientStates(),
    } as EKManagerEvent);
  }

  getAllClientStates(): Map<string, EKClientState> {
    const map = new Map<string, EKClientState>();
    for (const id of this.state.playerOrder) {
      map.set(id, buildEKClientState(this.state, id, this.playerNames, this.playerAvatars, this.nopeWindowSeq));
    }
    return map;
  }

  getClientState(playerId: string): EKClientState {
    return buildEKClientState(this.state, playerId, this.playerNames, this.playerAvatars, this.nopeWindowSeq);
  }

  getPhase() { return this.state.phase; }
  getWinnerIds() { return this.state.winnerIds; }
  getScores(): Record<string, number> {
    // Score = number of alive turns survived (just return hand size as proxy)
    const scores: Record<string, number> = {};
    const alive = getAlivePlayers(this.state);
    for (const id of this.state.playerOrder) {
      scores[id] = alive.includes(id) ? 1 : 0;
    }
    return scores;
  }

  cleanup(): void {
    this.clearNopeTimer();
  }
}
