import { ReactionGameState } from '../../../shared/types';

type Listener = (state: ReactionGameState) => void;

export class ReactionGameManager {
  private state: ReactionGameState;
  private playerIds: string[];
  private playerNames: Record<string, string>;
  private playerAvatars: Record<string, string>;
  private listeners: Listener[] = [];
  private countdownTimer: NodeJS.Timeout | null = null;
  private goTime: number = 0;

  constructor(playerIds: string[], playerNames: Record<string, string>, playerAvatars: Record<string, string>) {
    this.playerIds = playerIds;
    this.playerNames = playerNames;
    this.playerAvatars = playerAvatars;
    this.state = {
      phase: 'waiting',
      results: [],
    };
  }

  on(listener: Listener) {
    this.listeners.push(listener);
  }

  private emit() {
    const s = { ...this.state };
    this.listeners.forEach((l) => l(s));
  }

  start() {
    this.state = { phase: 'countdown', countdown: 3, results: [] };
    this.emit();

    let count = 3;
    this.countdownTimer = setInterval(() => {
      count--;
      this.state.countdown = count;
      this.emit();
      if (count <= 0) {
        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.goTime = Date.now();
        this.state = { phase: 'go', results: [] };
        this.emit();
      }
    }, 1000);
  }

  onReaction(playerId: string) {
    if (this.state.phase !== 'go') return;
    const ms = Date.now() - this.goTime;
    const existing = this.state.results.find((r) => r.playerId === playerId);
    if (existing) return;

    this.state.results.push({
      playerId,
      playerName: this.playerNames[playerId] ?? 'Unknown',
      avatar: this.playerAvatars[playerId] ?? '👤',
      reactionMs: ms,
    });

    const allDone = this.state.results.length === this.playerIds.length;
    if (allDone) {
      this.state.results.sort((a, b) => a.reactionMs - b.reactionMs);
      this.state.phase = 'results';
      this.state.winnerId = this.state.results[0]?.playerId;
    }
    this.emit();
  }

  getWinner(): string | null {
    return this.state.winnerId ?? null;
  }

  getScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    this.playerIds.forEach((id) => (scores[id] = 0));
    if (this.state.results.length > 0 && this.state.results[0]) {
      scores[this.state.results[0].playerId] = 100;
    }
    return scores;
  }
}
