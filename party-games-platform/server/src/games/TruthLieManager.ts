import { TruthLieState } from '../../../shared/types';

const STORIES: Array<{ story: string; truth: 'true' | 'false' | 'partial' }> = [
  { story: 'I once won a hot dog eating contest.', truth: 'true' },
  { story: 'I have been to 15 different countries.', truth: 'partial' },
  { story: 'I can speak 5 languages fluently.', truth: 'false' },
  { story: 'I met a celebrity at an airport.', truth: 'true' },
  { story: 'I have a pet snake.', truth: 'partial' },
];

type Listener = (state: TruthLieState) => void;

export class TruthLieManager {
  private state: TruthLieState;
  private playerIds: string[];
  private playerNames: Record<string, string>;
  private listeners: Listener[] = [];

  constructor(playerIds: string[], playerNames: Record<string, string>, _avatars: Record<string, string>) {
    this.playerIds = playerIds;
    this.playerNames = playerNames;
    const item = STORIES[Math.floor(Math.random() * STORIES.length)];
    this.state = {
      phase: 'story',
      storytellerId: playerIds[Math.floor(Math.random() * playerIds.length)],
      story: item.story,
      truth: item.truth,
      votes: {},
      scores: Object.fromEntries(playerIds.map((id) => [id, 0])),
    };
  }

  on(listener: Listener) {
    this.listeners.push(listener);
  }

  private emit() {
    const s = { ...this.state };
    if (s.phase !== 'results') delete (s as any).truth;
    this.listeners.forEach((l) => l(s));
  }

  start() {
    this.state.phase = 'voting';
    this.state.votes = {};
    this.emit();
  }

  submitVote(playerId: string, vote: 'true' | 'false' | 'partial') {
    if (this.state.phase !== 'voting') return;
    if (this.state.votes[playerId]) return;

    this.state.votes[playerId] = vote;

    const votedCount = Object.keys(this.state.votes).length;
    if (votedCount === this.playerIds.length) {
      for (const [vid, v] of Object.entries(this.state.votes)) {
        if (v === this.state.truth) {
          this.state.scores[vid] = (this.state.scores[vid] ?? 0) + 20;
        }
      }
      this.state.phase = 'results';
    }
    this.emit();
  }

  getWinner(): string | null {
    let max = -1;
    let winner: string | null = null;
    for (const [id, score] of Object.entries(this.state.scores)) {
      if (score > max) {
        max = score;
        winner = id;
      }
    }
    return winner;
  }

  getScores(): Record<string, number> {
    return { ...this.state.scores };
  }
}
