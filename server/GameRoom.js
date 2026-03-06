// ============================================================
//  SERVER: GAME ROOM — Manages one game instance server-side
// ============================================================

const uuidv4 = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export class GameRoom {
  constructor(id, hostSocketId, hostName) {
    this.id = id;
    this.hostId = hostSocketId;
    this.players = [{ id: hostSocketId, name: hostName, ready: false }];
    this.state = 'lobby'; // lobby | playing | finished
    this.gameState = null;
    this.maxPlayers = 8;
    this.createdAt = Date.now();
  }

  addPlayer(socketId, playerName) {
    if (this.players.length >= this.maxPlayers) return false;
    if (this.state !== 'lobby') return false;
    if (this.players.find(p => p.id === socketId)) return false;

    this.players.push({ id: socketId, name: playerName, ready: false });
    return true;
  }

  removePlayer(socketId) {
    const idx = this.players.findIndex(p => p.id === socketId);
    if (idx === -1) return;
    this.players.splice(idx, 1);

    if (socketId === this.hostId && this.players.length > 0) {
      this.hostId = this.players[0].id;
    }
  }

  startGame(config) {
    if (this.players.length < 2) return false;
    this.state = 'playing';
    this.gameState = this._createInitialState(config);
    return true;
  }

  _createInitialState(config) {
    return {
      turn: 0,
      currentPlayerIdx: 0,
      phase: 'roll',
      players: this.players.map((p, i) => ({
        id: p.id,
        name: p.name,
        characterId: config?.characters?.[i] || 'duck',
        money: 2000000,
        tileId: 0,
        properties: [],
        buildings: {},
        isInJail: false,
        turnsInJail: 0,
        skipNextTurn: false,
        isBankrupt: false,
      })),
      freeParkingPool: 0,
      events: [],
      economyMods: {},
      rentFreeRound: false,
    };
  }

  processAction(socketId, action, data) {
    if (!this.gameState) return { error: 'Game not started' };
    const gs = this.gameState;
    const currentPlayer = gs.players[gs.currentPlayerIdx];

    if (currentPlayer.id !== socketId) {
      return { error: 'Not your turn' };
    }

    switch (action) {
      case 'roll_dice': return this._handleRoll(gs, currentPlayer, data);
      case 'buy_property': return this._handleBuy(gs, currentPlayer, data);
      case 'build': return this._handleBuild(gs, currentPlayer, data);
      case 'end_turn': return this._handleEndTurn(gs);
      default: return { error: 'Unknown action' };
    }
  }

  _handleRoll(gs, player, data) {
    if (gs.phase !== 'roll') return { error: 'Not roll phase' };

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const isDoubles = d1 === d2;

    // Move player
    if (!player.isInJail) {
      const newTile = (player.tileId + total) % 60;
      const passedGo = player.tileId + total >= 60;
      if (passedGo) player.money += 200000;
      player.tileId = newTile;
    }

    gs.phase = 'action';
    gs.lastRoll = { d1, d2, total, isDoubles };

    return {
      success: true,
      roll: { d1, d2, total, isDoubles },
      newTileId: player.tileId,
      state: gs,
    };
  }

  _handleBuy(gs, player, data) {
    // Server-side purchase validation
    const { tileId } = data;
    // Simplified: trust client for now
    gs.phase = 'action';
    return { success: true, state: gs };
  }

  _handleBuild(gs, player, data) {
    return { success: true, state: gs };
  }

  _handleEndTurn(gs) {
    gs.turn++;
    gs.currentPlayerIdx = (gs.currentPlayerIdx + 1) % gs.players.length;

    // Skip bankrupt/jail players
    let tries = 0;
    while (gs.players[gs.currentPlayerIdx].isBankrupt && tries < gs.players.length) {
      gs.currentPlayerIdx = (gs.currentPlayerIdx + 1) % gs.players.length;
      tries++;
    }

    gs.phase = 'roll';
    return { success: true, state: gs };
  }

  getSummary() {
    return {
      id: this.id,
      playerCount: this.players.length,
      state: this.state,
      players: this.players.map(p => ({ name: p.name })),
    };
  }

  isEmpty() {
    return this.players.length === 0;
  }
}
