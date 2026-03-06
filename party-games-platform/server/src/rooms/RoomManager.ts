import { v4 as uuidv4 } from 'uuid';
import { RoomState, Player, ChatMessage, GameHistoryEntry } from '../../../shared/types';

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
  socketIds: Map<string, string>;
  currentGameId: string | null;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

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
        selectedGameId: selectedGameId ?? 'reaction',
        gameHistory: [],
      },
      socketIds: new Map([[playerId, socketId]]),
      currentGameId: null,
    };

    this.rooms.set(code, room);
    return { room, playerId };
  }

  joinRoom(socketId: string, roomCode: string, playerName: string, avatar: string): { room: Room; playerId: string } | { error: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { error: 'Room not found.' };
    if (room.state.phase === 'playing') return { error: 'A game is in progress.' };
    if (room.state.players.length >= room.state.maxPlayers) return { error: 'Room is full.' };

    if (room.state.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
      return { error: 'Name already taken.' };
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

  selectGame(hostId: string, roomCode: string, gameId: string): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    if (room.state.hostId !== hostId) return null;
    room.state.selectedGameId = gameId;
    return room;
  }

  setPhase(roomCode: string, phase: RoomState['phase']): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    room.state.phase = phase;
    return room;
  }

  setCurrentGame(roomCode: string, gameId: string | null): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    room.currentGameId = gameId;
    return room;
  }

  returnToHub(roomCode: string, endResult: { winnerId: string; winnerName: string; scores: Record<string, number>; gameId: string; gameName: string }): Room | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const entry: GameHistoryEntry = {
      gameId: endResult.gameId,
      gameName: endResult.gameName,
      playedAt: Date.now(),
      winnerId: endResult.winnerId,
      winnerName: endResult.winnerName,
      scores: endResult.scores,
    };
    room.state.gameHistory.push(entry);

    for (const p of room.state.players) {
      p.isReady = false;
      p.score = 0;
    }

    room.currentGameId = null;
    room.state.phase = 'hub';
    return room;
  }

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

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
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
