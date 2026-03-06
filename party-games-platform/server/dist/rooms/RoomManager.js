"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const uuid_1 = require("uuid");
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(socketId, playerName, avatar, selectedGameId) {
        let code;
        do {
            code = generateRoomCode();
        } while (this.rooms.has(code));
        const playerId = (0, uuid_1.v4)();
        const host = {
            id: playerId,
            name: playerName,
            avatar,
            isReady: false,
            isHost: true,
            isConnected: true,
            score: 0,
        };
        const room = {
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
    joinRoom(socketId, roomCode, playerName, avatar) {
        const room = this.rooms.get(roomCode.toUpperCase());
        if (!room)
            return { error: 'Room not found.' };
        if (room.state.phase === 'playing')
            return { error: 'A game is in progress.' };
        if (room.state.players.length >= room.state.maxPlayers)
            return { error: 'Room is full.' };
        if (room.state.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
            return { error: 'Name already taken.' };
        }
        const playerId = (0, uuid_1.v4)();
        const player = {
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
    leaveRoom(playerId, roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        room.socketIds.delete(playerId);
        const idx = room.state.players.findIndex((p) => p.id === playerId);
        if (idx !== -1)
            room.state.players.splice(idx, 1);
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
    markDisconnected(playerId, roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        const player = room.state.players.find((p) => p.id === playerId);
        if (player)
            player.isConnected = false;
        room.socketIds.delete(playerId);
        return room;
    }
    kickPlayer(hostId, targetId, roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        if (room.state.hostId !== hostId)
            return null;
        room.socketIds.delete(targetId);
        const idx = room.state.players.findIndex((p) => p.id === targetId);
        if (idx !== -1)
            room.state.players.splice(idx, 1);
        return { room, kicked: true };
    }
    setReady(playerId, roomCode, ready) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        const player = room.state.players.find((p) => p.id === playerId);
        if (player)
            player.isReady = ready;
        return room;
    }
    selectGame(hostId, roomCode, gameId) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        if (room.state.hostId !== hostId)
            return null;
        room.state.selectedGameId = gameId;
        return room;
    }
    setPhase(roomCode, phase) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        room.state.phase = phase;
        return room;
    }
    setCurrentGame(roomCode, gameId) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        room.currentGameId = gameId;
        return room;
    }
    returnToHub(roomCode, endResult) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        const entry = {
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
    addChatMessage(roomCode, playerId, message) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        const player = room.state.players.find((p) => p.id === playerId);
        if (!player)
            return null;
        const msg = {
            id: (0, uuid_1.v4)(),
            playerId,
            playerName: player.name,
            message: message.slice(0, 300),
            timestamp: Date.now(),
        };
        room.state.chat.push(msg);
        if (room.state.chat.length > 100)
            room.state.chat.shift();
        return msg;
    }
    getRoom(code) {
        return this.rooms.get(code.toUpperCase());
    }
    getRoomBySocketId(socketId) {
        for (const room of this.rooms.values()) {
            for (const [pid, sid] of room.socketIds) {
                if (sid === socketId)
                    return { room, playerId: pid };
            }
        }
        return null;
    }
}
exports.RoomManager = RoomManager;
