import { v4 as uuidv4 } from 'uuid';
import { RoomState, Player, ChatMessage, GameHistoryEntry } from '../../../shared/types';
import { GameManager, GameManagerEvent } from '../game/GameManager';
import { LoveLetterManager, LLManagerEvent } from '../game/LoveLetterManager';
import { UnoManager, UnoManagerEvent } from '../game/UnoManager';
import { WavelengthManager, WlManagerEvent } from '../game/WavelengthManager';
import { EKManager, EKManagerEvent } from '../game/EKManager';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface Room {
  state: RoomState;
  game: GameManager | null;
  llGame: LoveLetterManager | null;
  unoGame: UnoManager | null;
  wlGame: WavelengthManager | null;
  ekGame: EKManager | null;
  socketIds: Map<string, string>; // playerId → socketId
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  // ─── Room lifecycle ──────────────────────────────────────────────────────────

  createRoom(socketId: string, playerName: string, avatar: string, selectedGameId?: string): { room: Room; playerId: string } {
    let code: string;
    do { code = generateRoomCode(); } while (this.rooms.has(code));

    const playerId = uuidv4();
    const host: Player = {
      id: playerId,
      name: playerName,
      avatar,
      isReady: false,
      isHost: true,
      isConnected: true,
      score: 0,
    };

    const room: Room = {
      state: {
        code,
        hostId: playerId,
        players: [host],
        phase: 'lobby',
        maxPlayers: 10,
        chat: [],
        selectedGameId: selectedGameId ?? 'six-qui-prend',
        gameHistory: [],
      },
      game: null,
      llGame: null,
      unoGame: null,
      wlGame: null,
      ekGame: null,
      socketIds: new Map([[playerId, socketId]]),
    };

    this.rooms.set(code, room);
    return { room, playerId };
  }

  joinRoom(
    socketId: string,
    roomCode: string,
    playerName: string,
    avatar: string
  ): { room: Room; playerId: string } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Salle introuvable.' };
    if (room.state.phase === 'playing') return { error: 'Une partie est en cours.' };
    if (room.state.players.length >= room.state.maxPlayers) return { error: 'La salle est pleine.' };

    // Check name conflict
    if (room.state.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
      return { error: 'Ce pseudonyme est déjà pris dans cette salle.' };
    }

    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      name: playerName,
      avatar,
      isReady: false,
      isHost: false,
      isConnected: true,
      score: 0,
    };

    room.state.players.push(player);
    room.socketIds.set(playerId, socketId);
    return { room, playerId };
  }

  /** Attempt to reconnect a previously-seen player. */
  reconnectPlayer(socketId: string, roomCode: string, playerId: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const player = room.state.players.find((p) => p.id === playerId);
    if (!player) return null;
    player.isConnected = true;
    room.socketIds.set(playerId, socketId);
    return room;
  }

  leaveRoom(playerId: string, roomCode: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.socketIds.delete(playerId);
    const idx = room.state.players.findIndex((p) => p.id === playerId);
    if (idx !== -1) room.state.players.splice(idx, 1);

    if (room.state.players.length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    // Transfer host if needed
    if (room.state.hostId === playerId && room.state.players.length > 0) {
      room.state.players[0].isHost = true;
      room.state.hostId = room.state.players[0].id;
    }

    return room;
  }

  markDisconnected(playerId: string, roomCode: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const player = room.state.players.find((p) => p.id === playerId);
    if (player) player.isConnected = false;
    room.socketIds.delete(playerId);
    return room;
  }

  kickPlayer(hostId: string, targetId: string, roomCode: string): { room: Room; kicked: boolean } | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    if (room.state.hostId !== hostId) return null;

    room.socketIds.delete(targetId);
    const idx = room.state.players.findIndex((p) => p.id === targetId);
    if (idx !== -1) room.state.players.splice(idx, 1);
    return { room, kicked: true };
  }

  setReady(playerId: string, roomCode: string, ready: boolean): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const player = room.state.players.find((p) => p.id === playerId);
    if (player) player.isReady = ready;
    return room;
  }

  // ─── Game start ──────────────────────────────────────────────────────────────

  startGame(
    hostId: string,
    roomCode: string,
    onEvent: (event: GameManagerEvent) => void
  ): { room: Room; game: GameManager } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Salle introuvable.' };
    if (room.state.hostId !== hostId) return { error: 'Seul le créateur peut démarrer la partie.' };
    if (room.state.players.length < 2) return { error: 'Il faut au moins 2 joueurs.' };

    const playerIds = room.state.players.map((p) => p.id);
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};
    for (const p of room.state.players) {
      playerNames[p.id] = p.name;
      playerAvatars[p.id] = p.avatar;
      p.isReady = false;
    }

    const game = new GameManager(playerIds, playerNames, playerAvatars);
    game.on('event', onEvent);

    room.game = game;
    room.state.phase = 'playing';
    return { room, game };
  }

  startLoveLetterGame(
    hostId: string,
    roomCode: string,
    onEvent: (event: LLManagerEvent) => void,
  ): { room: Room; llGame: LoveLetterManager } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Salle introuvable.' };
    if (room.state.hostId !== hostId) return { error: 'Seul le créateur peut démarrer la partie.' };
    if (room.state.players.length < 2) return { error: 'Il faut au moins 2 joueurs.' };
    if (room.state.players.length > 6) return { error: 'Maximum 6 joueurs pour Love Letter.' };

    const playerIds = room.state.players.map((p) => p.id);
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};
    for (const p of room.state.players) {
      playerNames[p.id] = p.name;
      playerAvatars[p.id] = p.avatar;
      p.isReady = false;
    }

    const llGame = new LoveLetterManager(playerIds, playerNames, playerAvatars);
    llGame.on('event', onEvent);

    room.llGame = llGame;
    room.game = null;
    room.state.phase = 'playing';
    return { room, llGame };
  }

  startUnoGame(
    hostId: string,
    roomCode: string,
    onEvent: (event: UnoManagerEvent) => void,
  ): { room: Room; unoGame: UnoManager } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Salle introuvable.' };
    if (room.state.hostId !== hostId) return { error: 'Seul le créateur peut démarrer la partie.' };
    if (room.state.players.length < 2) return { error: 'Il faut au moins 2 joueurs.' };
    if (room.state.players.length > 10) return { error: 'Maximum 10 joueurs pour UNO.' };

    const playerIds = room.state.players.map((p) => p.id);
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};
    for (const p of room.state.players) {
      playerNames[p.id] = p.name;
      playerAvatars[p.id] = p.avatar;
      p.isReady = false;
    }

    const unoGame = new UnoManager(playerIds, playerNames, playerAvatars);
    unoGame.on('event', onEvent);

    room.unoGame = unoGame;
    room.game = null;
    room.llGame = null;
    room.state.phase = 'playing';
    return { room, unoGame };
  }

  startEKGame(
    hostId: string,
    roomCode: string,
    onEvent: (event: EKManagerEvent) => void,
  ): { room: Room; ekGame: EKManager } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Salle introuvable.' };
    if (room.state.hostId !== hostId) return { error: 'Seul le créateur peut démarrer.' };
    if (room.state.players.length < 2) return { error: 'Il faut au moins 2 joueurs.' };
    if (room.state.players.length > 10) return { error: 'Maximum 10 joueurs pour Exploding Kittens.' };

    const playerIds = room.state.players.map((p) => p.id);
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};
    for (const p of room.state.players) {
      playerNames[p.id] = p.name;
      playerAvatars[p.id] = p.avatar;
      p.isReady = false;
    }

    const ekGame = new EKManager(playerIds, playerNames, playerAvatars);
    ekGame.on('event', onEvent);

    room.ekGame = ekGame;
    room.game = null;
    room.llGame = null;
    room.unoGame = null;
    room.wlGame = null;
    room.state.phase = 'playing';
    return { room, ekGame };
  }

  // ─── Return to Hub ───────────────────────────────────────────────────────────

  returnToHub(
    roomCode: string,
    endResult: { winnerId: string; winnerName: string; scores: Record<string, number>; gameId: string; gameName: string }
  ): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    // Archive game in history
    const entry: GameHistoryEntry = {
      gameId: endResult.gameId,
      gameName: endResult.gameName,
      playedAt: Date.now(),
      winnerId: endResult.winnerId,
      winnerName: endResult.winnerName,
      scores: endResult.scores,
    };
    room.state.gameHistory.push(entry);

    // Reset player state for next game
    for (const p of room.state.players) {
      p.isReady = false;
      p.score = 0;
    }

    room.game = null;
    room.llGame = null;
    room.unoGame = null;
    room.wlGame = null;
    room.ekGame?.cleanup();
    room.ekGame = null;
    room.state.phase = 'hub';
    return room;
  }

  startWavelengthGame(
    hostId: string,
    roomCode: string,
    onEvent: (event: WlManagerEvent) => void,
  ): { room: Room; wlGame: WavelengthManager } | { error: string } {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Salle introuvable.' };
    if (room.state.hostId !== hostId) return { error: 'Seul le créateur peut démarrer.' };
    if (room.state.players.length < 2) return { error: 'Il faut au moins 2 joueurs.' };
    if (room.state.players.length > 12) return { error: 'Maximum 12 joueurs pour Wavelength.' };

    const playerIds = room.state.players.map((p) => p.id);
    const playerNames: Record<string, string> = {};
    const playerAvatars: Record<string, string> = {};
    for (const p of room.state.players) {
      playerNames[p.id] = p.name;
      playerAvatars[p.id] = p.avatar;
      p.isReady = false;
    }

    const wlGame = new WavelengthManager(playerIds, playerNames, playerAvatars);
    wlGame.on('event', onEvent);

    room.wlGame = wlGame;
    room.game = null;
    room.llGame = null;
    room.unoGame = null;
    room.state.phase = 'playing';
    return { room, wlGame };
  }

  // ─── Game selection ──────────────────────────────────────────────────────────

  selectGame(hostId: string, roomCode: string, gameId: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    if (room.state.hostId !== hostId) return null;
    room.state.selectedGameId = gameId;
    return room;
  }

  // ─── Chat ────────────────────────────────────────────────────────────────────

  addChatMessage(roomCode: string, playerId: string, message: string): ChatMessage | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const player = room.state.players.find((p) => p.id === playerId);
    if (!player) return null;

    const msg: ChatMessage = {
      id: uuidv4(),
      playerId,
      playerName: player.name,
      message: message.slice(0, 300),
      timestamp: Date.now(),
    };
    room.state.chat.push(msg);
    if (room.state.chat.length > 100) room.state.chat.shift();
    return msg;
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getSocketId(room: Room, playerId: string): string | undefined {
    return room.socketIds.get(playerId);
  }

  getRoomBySocketId(socketId: string): { room: Room; playerId: string } | null {
    for (const room of this.rooms.values()) {
      for (const [pid, sid] of room.socketIds) {
        if (sid === socketId) return { room, playerId: pid };
      }
    }
    return null;
  }
}
