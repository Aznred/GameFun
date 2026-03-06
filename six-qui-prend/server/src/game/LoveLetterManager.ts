import { EventEmitter } from 'events';
import { LLCardId } from '../../../shared/loveLetterCards';
import { LLServerGameState, LLClientGameState, LLActionLog } from '../../../shared/loveLetterTypes';
import {
  initLLGameState, llInitRound, llStartTurn, llResolvePlay, buildLLClientState,
} from '../../../shared/loveLetterLogic';

export type LLManagerEvent =
  | { type: 'game_started'; states: Map<string, LLClientGameState> }
  | { type: 'turn_start'; states: Map<string, LLClientGameState> }
  | { type: 'action'; log: LLActionLog; states: Map<string, LLClientGameState>; peekInfo?: { viewerId: string; peekCard: import('../../../shared/loveLetterCards').LLCard } }
  | { type: 'round_end'; states: Map<string, LLClientGameState> }
  | { type: 'game_over'; states: Map<string, LLClientGameState> };

export class LoveLetterManager extends EventEmitter {
  private state: LLServerGameState;
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
    this.state = initLLGameState(playerIds, playerNames, playerAvatars);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  start(): void {
    this.beginTurn();
    this.emit('event', { type: 'game_started', states: this.getAllClientStates() } as LLManagerEvent);
  }

  playCard(
    playerId: string,
    cardId: LLCardId,
    targetId?: string,
    guess?: LLCardId,
  ): { ok: boolean; error?: string } {
    if (this.state.phase !== 'playing') return { ok: false, error: 'Ce n\'est pas le moment de jouer.' };

    const result = llResolvePlay(this.state, playerId, cardId, targetId, guess, this.playerNames);
    if (result.error) return { ok: false, error: result.error };

    this.state = result.newState;

    if (this.state.phase === 'game_over') {
      this.emit('event', { type: 'game_over', states: this.getAllClientStates() } as LLManagerEvent);
    } else if (this.state.phase === 'round_end') {
      this.emit('event', { type: 'round_end', states: this.getAllClientStates() } as LLManagerEvent);
    } else {
      this.emit('event', {
        type: 'action',
        log: result.actionLog,
        states: this.getAllClientStates(),
        peekInfo: result.peekCard && targetId ? { viewerId: playerId, peekCard: result.peekCard } : undefined,
      } as LLManagerEvent);

      // Auto-advance turn after a short delay
      if (this.state.phase === 'drawing') {
        setTimeout(() => {
          if (this.state.phase === 'drawing') {
            this.beginTurn();
            this.emit('event', { type: 'turn_start', states: this.getAllClientStates() } as LLManagerEvent);
          }
        }, 1200);
      }
    }

    return { ok: true };
  }

  startNextRound(): void {
    if (this.state.phase !== 'round_end') return;
    this.state = {
      ...llInitRound(this.state),
      roundNumber: this.state.roundNumber + 1,
      tokens: this.state.tokens,
      tokensToWin: this.state.tokensToWin,
    };
    this.beginTurn();
    this.emit('event', { type: 'game_started', states: this.getAllClientStates() } as LLManagerEvent);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private beginTurn(): void {
    this.state = llStartTurn(this.state);
  }

  getAllClientStates(): Map<string, LLClientGameState> {
    const map = new Map<string, LLClientGameState>();
    for (const id of this.state.playerOrder) {
      map.set(id, buildLLClientState(this.state, id, this.playerNames, this.playerAvatars));
    }
    return map;
  }

  getClientState(playerId: string): LLClientGameState {
    return buildLLClientState(this.state, playerId, this.playerNames, this.playerAvatars);
  }

  getPhase() { return this.state.phase; }
}
