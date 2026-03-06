"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const ReactionGameManager_1 = require("../games/ReactionGameManager");
const MemeBattleManager_1 = require("../games/MemeBattleManager");
const TruthLieManager_1 = require("../games/TruthLieManager");
const activeGames = new Map();
function registerSocketHandlers(io, roomManager) {
    io.on('connection', (socket) => {
        console.log(`[socket] connected: ${socket.id}`);
        const emitToRoom = (roomCode, event, ...args) => {
            const room = roomManager.getRoom(roomCode);
            if (!room)
                return;
            for (const [, sid] of room.socketIds) {
                const target = io.sockets.sockets.get(sid);
                if (target)
                    target.emit(event, ...args);
            }
        };
        const broadcastRoomState = (roomCode) => {
            const room = roomManager.getRoom(roomCode);
            if (room)
                emitToRoom(roomCode, 'room_state', room.state);
        };
        socket.on('create_room', (data, cb) => {
            const { room, playerId } = roomManager.createRoom(socket.id, data.playerName, data.avatar, data.selectedGameId);
            socket.data = { playerId, roomCode: room.state.code, playerName: data.playerName, avatar: data.avatar };
            cb({ roomCode: room.state.code, playerId });
            emitToRoom(room.state.code, 'room_state', room.state);
        });
        socket.on('join_room', (data, cb) => {
            const result = roomManager.joinRoom(socket.id, data.roomCode.toUpperCase(), data.playerName, data.avatar);
            if ('error' in result) {
                cb(result);
                return;
            }
            const { room, playerId } = result;
            socket.data = { playerId, roomCode: room.state.code, playerName: data.playerName, avatar: data.avatar };
            cb({ ok: true, playerId });
            broadcastRoomState(room.state.code);
        });
        socket.on('leave_room', () => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const room = roomManager.leaveRoom(info.playerId, info.roomCode);
            socket.data.roomCode = null;
            if (room)
                broadcastRoomState(room.state.code);
        });
        socket.on('ready_player', (isReady) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const room = roomManager.setReady(info.playerId, info.roomCode, isReady);
            if (room)
                broadcastRoomState(room.state.code);
        });
        socket.on('kick_player', (targetId) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const result = roomManager.kickPlayer(info.playerId, targetId, info.roomCode);
            if (result) {
                broadcastRoomState(result.room.state.code);
                const kickedSocketId = result.room.socketIds.get(targetId);
                if (kickedSocketId) {
                    const kickedSocket = io.sockets.sockets.get(kickedSocketId);
                    if (kickedSocket)
                        kickedSocket.emit('kicked', 'You were kicked.');
                }
            }
        });
        socket.on('send_chat', (message) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const msg = roomManager.addChatMessage(info.roomCode, info.playerId, message);
            if (msg)
                emitToRoom(info.roomCode, 'chat_message', msg);
        });
        socket.on('select_game', (gameId) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const room = roomManager.selectGame(info.playerId, info.roomCode, gameId);
            if (room)
                broadcastRoomState(room.state.code);
        });
        socket.on('return_to_hub', () => {
            const info = socket.data;
            if (!info?.roomCode)
                return;
            const room = roomManager.getRoom(info.roomCode);
            if (!room || room.state.phase !== 'finished')
                return;
            const lastEntry = room.state.gameHistory[room.state.gameHistory.length - 1];
            if (lastEntry) {
                const updated = roomManager.returnToHub(info.roomCode, lastEntry);
                if (updated)
                    broadcastRoomState(updated.state.code);
            }
        });
        socket.on('start_game', () => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const room = roomManager.getRoom(info.roomCode);
            if (!room)
                return;
            if (room.state.hostId !== info.playerId)
                return;
            if (room.state.players.length < 2)
                return;
            const gameId = room.state.selectedGameId ?? 'reaction';
            const playerIds = room.state.players.map((p) => p.id);
            const playerNames = Object.fromEntries(room.state.players.map((p) => [p.id, p.name]));
            const playerAvatars = Object.fromEntries(room.state.players.map((p) => [p.id, p.avatar]));
            roomManager.setPhase(info.roomCode, 'playing');
            roomManager.setCurrentGame(info.roomCode, gameId);
            broadcastRoomState(info.roomCode);
            const finishGame = (winnerId, winnerName, scores) => {
                roomManager.returnToHub(info.roomCode, {
                    gameId,
                    gameName: gameId,
                    winnerId,
                    winnerName,
                    scores,
                });
                const updated = roomManager.getRoom(info.roomCode);
                if (updated) {
                    broadcastRoomState(updated.state.code);
                    const result = {
                        players: updated.state.players.map((p, i) => ({
                            id: p.id,
                            name: p.name,
                            avatar: p.avatar,
                            score: scores[p.id] ?? 0,
                            rank: i + 1,
                        })),
                        winnerId,
                        gameId,
                        gameName: gameId,
                    };
                    emitToRoom(info.roomCode, 'game_end', result);
                }
            };
            if (gameId === 'reaction') {
                const game = new ReactionGameManager_1.ReactionGameManager(playerIds, playerNames, playerAvatars);
                activeGames.set(info.roomCode, game);
                game.on((state) => emitToRoom(info.roomCode, 'reaction_game_state', state));
                game.start();
                setTimeout(() => {
                    activeGames.delete(info.roomCode);
                    const winnerId = game.getWinner();
                    const winner = room.state.players.find((p) => p.id === winnerId);
                    finishGame(winnerId ?? '', winner?.name ?? 'Nobody', game.getScores());
                }, 15000);
            }
            else if (gameId === 'meme-battle') {
                const game = new MemeBattleManager_1.MemeBattleManager(playerIds, playerNames, playerAvatars);
                activeGames.set(info.roomCode, game);
                game.on((state) => emitToRoom(info.roomCode, 'meme_battle_state', state));
                game.start();
                setTimeout(() => {
                    activeGames.delete(info.roomCode);
                    const winnerId = game.getWinner();
                    const winner = room.state.players.find((p) => p.id === winnerId);
                    finishGame(winnerId ?? '', winner?.name ?? 'Nobody', game.getScores());
                }, 60000);
            }
            else if (gameId === 'truth-lie') {
                const game = new TruthLieManager_1.TruthLieManager(playerIds, playerNames, playerAvatars);
                activeGames.set(info.roomCode, game);
                game.on((state) => emitToRoom(info.roomCode, 'truth_lie_state', state));
                game.start();
                setTimeout(() => {
                    activeGames.delete(info.roomCode);
                    const winnerId = game.getWinner();
                    const winner = room.state.players.find((p) => p.id === winnerId);
                    finishGame(winnerId ?? '', winner?.name ?? 'Nobody', game.getScores());
                }, 30000);
            }
            else {
                roomManager.setPhase(info.roomCode, 'hub');
                roomManager.setCurrentGame(info.roomCode, null);
                broadcastRoomState(info.roomCode);
            }
        });
        socket.on('reaction_click', () => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const game = activeGames.get(info.roomCode);
            if (game && game instanceof ReactionGameManager_1.ReactionGameManager)
                game.onReaction(info.playerId);
        });
        socket.on('meme_submit_caption', (caption) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const game = activeGames.get(info.roomCode);
            if (game && game instanceof MemeBattleManager_1.MemeBattleManager)
                game.submitCaption(info.playerId, caption);
        });
        socket.on('meme_vote', (targetId) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const game = activeGames.get(info.roomCode);
            if (game && game instanceof MemeBattleManager_1.MemeBattleManager)
                game.vote(info.playerId, targetId);
        });
        socket.on('truth_lie_submit_vote', (vote) => {
            const info = socket.data;
            if (!info?.roomCode || !info?.playerId)
                return;
            const game = activeGames.get(info.roomCode);
            if (game && game instanceof TruthLieManager_1.TruthLieManager)
                game.submitVote(info.playerId, vote);
        });
        socket.on('disconnect', () => {
            const info = socket.data;
            if (info?.roomCode && info?.playerId) {
                const room = roomManager.markDisconnected(info.playerId, info.roomCode);
                if (room) {
                    broadcastRoomState(room.state.code);
                    emitToRoom(room.state.code, 'player_disconnected', info.playerId);
                }
            }
        });
    });
}
