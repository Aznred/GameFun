// ============================================================
//  MEGAOPOLY SERVER — Express + Socket.io multiplayer backend
// ============================================================

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// ── Room Registry ─────────────────────────────────────────

const rooms = new Map(); // roomId → GameRoom-like object

function createRoom(hostId, hostName) {
  const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
  const room = {
    id: roomId,
    hostId,
    players: [{ id: hostId, name: hostName, characterId: null, ready: false }],
    state: 'lobby',
    gameState: null,
    maxPlayers: 8,
  };
  rooms.set(roomId, room);
  return room;
}

function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.find(p => p.id === socketId)) return room;
  }
  return null;
}

// ── Socket.io Events ──────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Server] Player connected: ${socket.id}`);

  // ── Create room ──
  socket.on('create_room', ({ playerName }, callback) => {
    const room = createRoom(socket.id, playerName || 'Host');
    socket.join(room.id);
    console.log(`[Server] Room created: ${room.id} by ${playerName}`);
    callback?.({ success: true, roomId: room.id, room: room.getSummaryLite?.() || room });
  });

  // ── Join room ──
  socket.on('join_room', ({ roomId, playerName }, callback) => {
    const room = rooms.get(roomId?.toUpperCase());
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }
    if (room.state !== 'lobby') {
      callback?.({ success: false, error: 'Game already started' });
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      callback?.({ success: false, error: 'Room is full' });
      return;
    }

    room.players.push({ id: socket.id, name: playerName || 'Player', characterId: null, ready: false });
    socket.join(roomId.toUpperCase());

    io.to(room.id).emit('room_updated', { room });
    callback?.({ success: true, roomId: room.id, room });
    console.log(`[Server] ${playerName} joined room ${room.id}`);
  });

  // ── Select character ──
  socket.on('select_character', ({ characterId }) => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.characterId = characterId;
      player.ready = true;
    }
    io.to(room.id).emit('room_updated', { room });
  });

  // ── Start game ──
  socket.on('start_game', ({ roomId, config }) => {
    const room = rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    room.state = 'playing';
    room.gameState = _createInitialGameState(room.players, config);

    io.to(room.id).emit('game_started', {
      gameState: room.gameState,
      players: room.players,
    });
    console.log(`[Server] Game started in room ${room.id}`);
  });

  // ── Game actions ──
  socket.on('game_action', ({ roomId, action, data }) => {
    const room = rooms.get(roomId);
    if (!room || room.state !== 'playing') return;

    const gs = room.gameState;
    const currentPlayer = gs.players[gs.currentPlayerIdx];

    if (currentPlayer.id !== socket.id) return;

    const result = _processAction(gs, socket.id, action, data);
    if (result.success) {
      io.to(room.id).emit('game_action_result', {
        action,
        data: result,
        gameState: gs,
      });
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // ── Chat ──
  socket.on('chat_message', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    io.to(room.id).emit('chat_message', {
      playerName: player?.name || 'Unknown',
      message: message?.slice(0, 200),
      ts: Date.now(),
    });
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    console.log(`[Server] Player disconnected: ${socket.id}`);
    const room = getRoomBySocket(socket.id);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {
      rooms.delete(room.id);
      console.log(`[Server] Room ${room.id} deleted (empty)`);
    } else {
      if (room.hostId === socket.id) {
        room.hostId = room.players[0].id;
      }
      io.to(room.id).emit('player_left', {
        socketId: socket.id,
        room,
      });
    }
  });
});

// ── Game Logic (server-authoritative) ────────────────────

function _createInitialGameState(players, config) {
  return {
    turn: 0,
    currentPlayerIdx: 0,
    phase: 'roll',
    freeParkingPool: 0,
    rentFreeRound: false,
    aiMayorActive: false,
    players: players.map((p, i) => ({
      id: p.id,
      name: p.name,
      characterId: p.characterId || config?.characters?.[i] || 'duck',
      money: 2000000,
      tileId: 0,
      properties: [],
      buildings: {},
      mortgaged: [],
      isInJail: false,
      turnsInJail: 0,
      skipNextTurn: false,
      isBankrupt: false,
      netWorth: 2000000,
    })),
  };
}

function _processAction(gs, socketId, action, data) {
  const player = gs.players[gs.currentPlayerIdx];
  if (player.id !== socketId) return { error: 'Not your turn' };

  switch (action) {
    case 'roll_dice': {
      if (gs.phase !== 'roll') return { error: 'Not roll phase' };
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      const isDoubles = d1 === d2;

      if (!player.isInJail) {
        const newTile = (player.tileId + total) % 60;
        if (player.tileId + total >= 60) {
          player.money += 200000; // pass GO
        }
        player.tileId = newTile;
      }

      gs.phase = 'action';
      gs.lastRoll = { d1, d2, total, isDoubles };
      return { success: true, roll: { d1, d2, total, isDoubles } };
    }

    case 'buy_property': {
      const { tileId, price } = data;
      if (player.money < price) return { error: 'Insufficient funds' };
      if (player.properties.includes(tileId)) return { error: 'Already owned' };
      // Check not owned by another
      const ownerExists = gs.players.some(p => p.properties.includes(tileId));
      if (ownerExists) return { error: 'Property taken' };

      player.money -= price;
      player.properties.push(tileId);
      player.netWorth = _calculateNetWorth(player);
      return { success: true };
    }

    case 'build': {
      const { tileId, buildingId, cost } = data;
      if (player.money < cost) return { error: 'Insufficient funds' };
      if (!player.properties.includes(tileId)) return { error: 'Not your property' };

      player.money -= cost;
      player.buildings[tileId] = { buildingId };
      player.netWorth = _calculateNetWorth(player);
      return { success: true };
    }

    case 'pay_rent': {
      const { ownerId, amount } = data;
      const owner = gs.players.find(p => p.id === ownerId);
      if (!owner) return { error: 'Owner not found' };

      const actual = Math.min(amount, player.money);
      player.money -= actual;
      owner.money += actual;
      player.netWorth = _calculateNetWorth(player);
      owner.netWorth = _calculateNetWorth(owner);

      if (player.money <= 0) {
        player.isBankrupt = true;
      }
      return { success: true, paid: actual };
    }

    case 'end_turn': {
      gs.turn++;
      let next = (gs.currentPlayerIdx + 1) % gs.players.length;
      let tries = 0;
      while (gs.players[next].isBankrupt && tries < gs.players.length) {
        next = (next + 1) % gs.players.length;
        tries++;
      }
      gs.currentPlayerIdx = next;
      gs.phase = 'roll';

      // Check win condition
      const alive = gs.players.filter(p => !p.isBankrupt);
      if (alive.length === 1) {
        gs.winner = alive[0].id;
        gs.phase = 'finished';
      }

      return { success: true, nextPlayerId: gs.players[gs.currentPlayerIdx].id };
    }

    default:
      return { error: 'Unknown action' };
  }
}

function _calculateNetWorth(player) {
  return player.money + player.properties.length * 100000;
}

// ── HTTP Routes ───────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

app.get('/rooms', (req, res) => {
  const summary = Array.from(rooms.values()).map(r => ({
    id: r.id,
    players: r.players.length,
    state: r.state,
  }));
  res.json(summary);
});

// ── Start Server ──────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`\n🏙️  MEGAOPOLY SERVER running on http://localhost:${PORT}`);
  console.log(`   Waiting for players to connect...\n`);
});
