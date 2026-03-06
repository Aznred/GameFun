import { MemeBattleState } from '../../../shared/types';

const MEME_IMAGES = [
  'https://i.imgur.com/placeholder1.jpg',
  'https://via.placeholder.com/400x300/1a1a2e/eee?text=Meme',
];

type Listener = (state: MemeBattleState) => void;

export class MemeBattleManager {
  private state: MemeBattleState;
  private playerIds: string[];
  private playerNames: Record<string, string>;
  private listeners: Listener[] = [];

  constructor(playerIds: string[], playerNames: Record<string, string>, _avatars: Record<string, string>) {
    this.playerIds = playerIds;
    this.playerNames = playerNames;
    this.state = {
      phase: 'prompt',
      imageUrl: MEME_IMAGES[Math.floor(Math.random() * MEME_IMAGES.length)],
      captions: [],
      votes: {},
      scores: Object.fromEntries(playerIds.map((id) => [id, 0])),
    };
  }

  on(listener: Listener) {
    this.listeners.push(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  start() {
    this.state.phase = 'writing';
    this.state.captions = [];
    this.state.votes = {};
    this.emit();
  }

  submitCaption(playerId: string, caption: string) {
    if (this.state.phase !== 'writing') return;
    if (this.state.captions.some((c) => c.playerId === playerId)) return;

    this.state.captions.push({
      playerId,
      playerName: this.playerNames[playerId] ?? 'Unknown',
      caption: caption.slice(0, 200),
    });

    if (this.state.captions.length === this.playerIds.length) {
      this.state.phase = 'voting';
    }
    this.emit();
  }

  vote(voterId: string, targetPlayerId: string) {
    if (this.state.phase !== 'voting') return;
    if (this.state.votes[voterId]) return;
    if (!this.state.captions.some((c) => c.playerId === targetPlayerId)) return;

    this.state.votes[voterId] = targetPlayerId;

    const votedCount = Object.keys(this.state.votes).length;
    if (votedCount === this.playerIds.length) {
      for (const [vid, tid] of Object.entries(this.state.votes)) {
        this.state.scores[tid] = (this.state.scores[tid] ?? 0) + 10;
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
