"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionGameManager = void 0;
class ReactionGameManager {
    constructor(playerIds, playerNames, playerAvatars) {
        this.listeners = [];
        this.countdownTimer = null;
        this.goTime = 0;
        this.playerIds = playerIds;
        this.playerNames = playerNames;
        this.playerAvatars = playerAvatars;
        this.state = {
            phase: 'waiting',
            results: [],
        };
    }
    on(listener) {
        this.listeners.push(listener);
    }
    emit() {
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
                if (this.countdownTimer)
                    clearInterval(this.countdownTimer);
                this.countdownTimer = null;
                this.goTime = Date.now();
                this.state = { phase: 'go', results: [] };
                this.emit();
            }
        }, 1000);
    }
    onReaction(playerId) {
        if (this.state.phase !== 'go')
            return;
        const ms = Date.now() - this.goTime;
        const existing = this.state.results.find((r) => r.playerId === playerId);
        if (existing)
            return;
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
    getWinner() {
        return this.state.winnerId ?? null;
    }
    getScores() {
        const scores = {};
        this.playerIds.forEach((id) => (scores[id] = 0));
        if (this.state.results.length > 0 && this.state.results[0]) {
            scores[this.state.results[0].playerId] = 100;
        }
        return scores;
    }
}
exports.ReactionGameManager = ReactionGameManager;
