import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../../../shared/types';
import { RoomManager } from '../rooms/RoomManager';
import { GameManagerEvent } from '../game/GameManager';
import { LLManagerEvent } from '../game/LoveLetterManager';
import { UnoManagerEvent } from '../game/UnoManager';
import { WlManagerEvent } from '../game/WavelengthManager';
import { EKManagerEvent } from '../game/EKManager';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerSocketHandlers(io: AppServer, roomManager: RoomManager): void {
  io.on('connection', (socket: AppSocket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const emit = (room: ReturnType<RoomManager['getRoom']>, event: keyof ServerToClientEvents, ...args: unknown[]) => {
      if (!room) return;
      // Broadcast to all sockets in the room
      for (const [pid, sid] of room.socketIds) {
        const target = io.sockets.sockets.get(sid);
        if (target) (target.emit as Function)(event, ...args);
      }
    };

    const broadcastRoomState = (roomCode: string) => {
      const room = roomManager.getRoom(roomCode);
      if (room) emit(room, 'room_state', room.state);
    };

    const broadcastGameStates = (roomCode: string, states: Map<string, import('../../../shared/types').ClientGameState>) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      for (const [pid, sid] of room.socketIds) {
        const target = io.sockets.sockets.get(sid);
        const state = states.get(pid);
        if (target && state) target.emit('game_state', state);
      }
    };

    // ── EK event handler ─────────────────────────────────────────────────────
    const onEKEvent = (roomCode: string) => (event: EKManagerEvent) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const broadcastEK = (states: Map<string, import('../../../shared/ekTypes').EKClientState>) => {
        for (const [pid, sid] of room.socketIds) {
          const target = io.sockets.sockets.get(sid);
          const state = states.get(pid);
          if (target && state) target.emit('ek_game_state', state);
        }
      };

      broadcastEK(event.states);

      if (event.type === 'game_over') {
        room.state.phase = 'finished';
        const scores = room.ekGame?.getScores() ?? {};
        const winnerNames = (event as any).winnerNames as string[] ?? [];
        setTimeout(() => {
          const updated = roomManager.returnToHub(roomCode, {
            gameId: 'exploding-kittens',
            gameName: 'Exploding Kittens',
            winnerId: '',
            winnerName: winnerNames[0] ?? '',
            scores,
          });
          if (updated) emit(updated, 'room_state', updated.state);
        }, 10000);
      }
    };

    // ── Wavelength event handler ─────────────────────────────────────────────
    const onWlEvent = (roomCode: string) => (event: WlManagerEvent) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const broadcastWl = (states: Map<string, import('../../../shared/wavelengthTypes').WlClientState>) => {
        for (const [pid, sid] of room.socketIds) {
          const target = io.sockets.sockets.get(sid);
          const state = states.get(pid);
          if (target && state) target.emit('wl_game_state', state);
        }
      };

      broadcastWl(event.states);

      if (event.type === 'game_over') {
        room.state.phase = 'finished';
        const scores = room.wlGame?.getScores() ?? {};
        const winnerNames = (event as any).winnerNames as string[] ?? [];
        setTimeout(() => {
          const updated = roomManager.returnToHub(roomCode, {
            gameId: 'wavelength',
            gameName: 'Wavelength',
            winnerId: '',
            winnerName: winnerNames[0] ?? '',
            scores,
          });
          if (updated) emit(updated, 'room_state', updated.state);
        }, 12000);
      }
    };

    // ── UNO event handler ────────────────────────────────────────────────────
    const onUnoEvent = (roomCode: string) => (event: UnoManagerEvent) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const broadcastUno = (states: Map<string, import('../../../shared/unoTypes').UnoClientGameState>) => {
        for (const [pid, sid] of room.socketIds) {
          const target = io.sockets.sockets.get(sid);
          const state = states.get(pid);
          if (target && state) target.emit('uno_game_state', state);
        }
      };

      switch (event.type) {
        case 'game_started':
        case 'state_update':
        case 'color_pick':
        case 'round_end':
          broadcastUno(event.states);
          break;

        case 'game_over': {
          room.state.phase = 'finished';
          broadcastUno(event.states);
          const scores = room.unoGame?.getScores() ?? {};
          setTimeout(() => {
            const updated = roomManager.returnToHub(roomCode, {
              gameId: 'uno',
              gameName: 'UNO',
              winnerId: event.winnerId,
              winnerName: event.winnerName,
              scores,
            });
            if (updated) emit(updated, 'room_state', updated.state);
          }, 12000);
          break;
        }
      }
    };

    // ── Love Letter event handler ────────────────────────────────────────────
    const onLLEvent = (roomCode: string) => (event: LLManagerEvent) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const broadcastLL = (states: Map<string, import('../../../shared/loveLetterTypes').LLClientGameState>) => {
        for (const [pid, sid] of room.socketIds) {
          const target = io.sockets.sockets.get(sid);
          const state = states.get(pid);
          if (target && state) target.emit('ll_game_state', state);
        }
      };

      switch (event.type) {
        case 'game_started':
        case 'turn_start':
          broadcastLL(event.states);
          break;

        case 'action':
          broadcastLL(event.states);
          // Send peek card only to the viewer (priest)
          if (event.peekInfo) {
            const sid = room.socketIds.get(event.peekInfo.viewerId);
            const tgt = sid ? io.sockets.sockets.get(sid) : undefined;
            if (tgt) tgt.emit('ll_peek', event.peekInfo.peekCard);
          }
          break;

        case 'round_end':
          broadcastLL(event.states);
          break;

        case 'game_over': {
          room.state.phase = 'finished';
          broadcastLL(event.states);
          // Auto-return to hub after 12s
          setTimeout(() => {
            const updated = roomManager.returnToHub(roomCode, {
              gameId: 'love-letter', gameName: 'Love Letter',
              winnerId: '', winnerName: '', scores: {},
            });
            if (updated) emit(updated, 'room_state', updated.state);
          }, 12000);
          break;
        }
      }
    };

    const onGameEvent = (roomCode: string) => (event: GameManagerEvent) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      switch (event.type) {
        case 'game_started':
        case 'game_state':
          broadcastGameStates(roomCode, event.states);
          break;

        case 'round_result':
          emit(room, 'round_result', event.result);
          // Brief delay so clients can animate the result, then send updated state
          setTimeout(() => broadcastGameStates(roomCode, event.states), 3000);
          break;

        case 'choose_row': {
          const sid = room.socketIds.get(event.playerId);
          const target = sid ? io.sockets.sockets.get(sid) : undefined;
          if (target) target.emit('choose_row', { card: event.card, round: event.round });
          break;
        }

        case 'game_over': {
          room.state.phase = 'finished';
          emit(room, 'game_end', event.result);
          // Auto-return to hub after 12 seconds (players can also trigger manually)
          setTimeout(() => {
            const scores: Record<string, number> = {};
            for (const p of event.result.players) scores[p.id] = p.score;
            const winner = event.result.players.find((p) => p.id === event.result.winnerId);
            const updatedRoom = roomManager.returnToHub(roomCode, {
              gameId: event.result.gameId,
              gameName: '6 Qui Prend !',
              winnerId: event.result.winnerId,
              winnerName: winner?.name ?? '?',
              scores,
            });
            if (updatedRoom) emit(updatedRoom, 'room_state', updatedRoom.state);
          }, 12000);
          break;
        }
      }
    };

    // ── Room events ──────────────────────────────────────────────────────────

    socket.on('create_room', ({ playerName, avatar, selectedGameId }, cb) => {
      console.log(`[create_room] socket=${socket.id} name=${playerName} game=${selectedGameId}`);
      try {
        const { room, playerId } = roomManager.createRoom(socket.id, playerName.trim(), avatar, selectedGameId);
        socket.data.playerId = playerId;
        socket.data.roomCode = room.state.code;
        socket.data.playerName = playerName;
        socket.data.avatar = avatar;
        socket.join(room.state.code);
        console.log(`[create_room] OK → code=${room.state.code} playerId=${playerId}`);
        cb({ roomCode: room.state.code, playerId });
        broadcastRoomState(room.state.code);
      } catch (err) {
        console.error('[create_room] error:', err);
        cb({ error: 'Erreur serveur lors de la création de la salle.' });
      }
    });

    socket.on('join_room', ({ roomCode, playerName, avatar }, cb) => {
      console.log(`[join_room] socket=${socket.id} code=${roomCode} name=${playerName}`);
      try {
        const result = roomManager.joinRoom(socket.id, roomCode.toUpperCase(), playerName.trim(), avatar);
        if ('error' in result) {
          console.log(`[join_room] refused: ${result.error}`);
          cb({ error: result.error });
          return;
        }
        const { room, playerId } = result;
        socket.data.playerId = playerId;
        socket.data.roomCode = room.state.code;
        socket.data.playerName = playerName;
        socket.data.avatar = avatar;
        socket.join(room.state.code);
        console.log(`[join_room] OK → playerId=${playerId} room=${room.state.code}`);
        cb({ ok: true, playerId });
        broadcastRoomState(room.state.code);
      } catch (err) {
        console.error('[join_room] error:', err);
        cb({ error: 'Erreur serveur lors de la connexion à la salle.' });
      }
    });

    socket.on('leave_room', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.leaveRoom(playerId, roomCode);
      socket.leave(roomCode);
      if (room) broadcastRoomState(roomCode);
    });

    socket.on('ready_player', (isReady) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      roomManager.setReady(playerId, roomCode, isReady);
      broadcastRoomState(roomCode);
    });

    socket.on('start_game', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      const selectedGameId = room.state.selectedGameId ?? 'six-qui-prend';

      if (selectedGameId === 'love-letter') {
        // ── Love Letter start ──────────────────────────────────────────────────
        const result = roomManager.startLoveLetterGame(playerId, roomCode, onLLEvent(roomCode));
        if ('error' in result) { socket.emit('error', result.error); return; }
        result.llGame.start();
        broadcastRoomState(roomCode);

      } else if (selectedGameId === 'wavelength') {
        // ── Wavelength start ───────────────────────────────────────────────────
        const result = roomManager.startWavelengthGame(playerId, roomCode, onWlEvent(roomCode));
        if ('error' in result) { socket.emit('error', result.error); return; }
        result.wlGame.start();
        broadcastRoomState(roomCode);

      } else if (selectedGameId === 'uno') {
        // ── UNO start ──────────────────────────────────────────────────────────
        const result = roomManager.startUnoGame(playerId, roomCode, onUnoEvent(roomCode));
        if ('error' in result) { socket.emit('error', result.error); return; }
        result.unoGame.start();
        broadcastRoomState(roomCode);

      } else if (selectedGameId === 'exploding-kittens') {
        // ── Exploding Kittens start ────────────────────────────────────────────
        const result = roomManager.startEKGame(playerId, roomCode, onEKEvent(roomCode));
        if ('error' in result) { socket.emit('error', result.error); return; }
        result.ekGame.start();
        broadcastRoomState(roomCode);

      } else {
        // ── 6 Qui Prend start ──────────────────────────────────────────────────
        const result = roomManager.startGame(playerId, roomCode, onGameEvent(roomCode));
        if ('error' in result) { socket.emit('error', result.error); return; }

        const states = result.game.getAllClientStates();
        broadcastRoomState(roomCode);
        const r = roomManager.getRoom(roomCode)!;
        for (const [pid, sid] of r.socketIds) {
          const target = io.sockets.sockets.get(sid);
          const state = states.get(pid);
          if (target && state) target.emit('game_start', state);
        }
      }
    });

    socket.on('play_card', (cardNumber) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.game) return;
      const ok = room.game.playCard(playerId, cardNumber);
      if (!ok) socket.emit('error', 'Carte invalide ou déjà jouée.');
      else broadcastGameStates(roomCode, room.game.getAllClientStates());
    });

    socket.on('select_row', (rowIndex) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.game) return;
      const ok = room.game.selectRow(playerId, rowIndex);
      if (!ok) socket.emit('error', 'Sélection de rangée invalide.');
    });

    socket.on('kick_player', (targetId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const res = roomManager.kickPlayer(playerId, targetId, roomCode);
      if (!res) return;
      // Notify kicked player
      const room = res.room;
      const kickedSid = room.socketIds.get(targetId);
      if (kickedSid) {
        const ks = io.sockets.sockets.get(kickedSid);
        if (ks) ks.emit('kicked', 'Vous avez été expulsé de la salle.');
      }
      broadcastRoomState(roomCode);
    });

    // ── Love Letter play ───────────────────────────────────────────────────────
    socket.on('ll_play_card', ({ cardId, targetId, guess }) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.llGame) return;
      const result = room.llGame.playCard(playerId, cardId, targetId, guess);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur lors du jeu de la carte.');
    });

    socket.on('ll_next_round', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.llGame) return;
      if (room.state.hostId !== playerId) return;
      room.llGame.startNextRound();
    });

    // ── Wavelength events ─────────────────────────────────────────────────────
    socket.on('wl_submit_clue', (clue) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.wlGame) return;
      const result = room.wlGame.submitClue(playerId, clue);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur indice.');
    });

    socket.on('wl_submit_guess', (position) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.wlGame) return;
      const result = room.wlGame.submitGuess(playerId, position);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur devinette.');
    });

    socket.on('wl_next_round', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.wlGame) return;
      if (room.state.hostId !== playerId) return;
      room.wlGame.startNextRound();
    });

    socket.on('wl_start_round', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.wlGame) return;
      if (room.state.hostId !== playerId) return;
      room.wlGame.forceReveal(); // alias: host forces reveal if players are slow
    });

    // ── UNO play events ────────────────────────────────────────────────────────
    socket.on('uno_play_card', (cardId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.unoGame) return;
      const result = room.unoGame.playCard(playerId, cardId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur lors du jeu de la carte.');
    });

    socket.on('uno_draw_card', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.unoGame) return;
      const result = room.unoGame.drawCard(playerId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur lors de la pioche.');
    });

    socket.on('uno_pass_turn', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.unoGame) return;
      const result = room.unoGame.passTurn(playerId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur lors du passage.');
    });

    socket.on('uno_choose_color', (color) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.unoGame) return;
      const result = room.unoGame.chooseColor(playerId, color);
      if (!result.ok) socket.emit('error', result.error ?? 'Couleur invalide.');
    });

    socket.on('uno_call_uno', (targetId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.unoGame) return;
      room.unoGame.callUno(playerId, targetId);
    });

    socket.on('uno_next_round', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.unoGame) return;
      if (room.state.hostId !== playerId) return;
      room.unoGame.startNextRound();
    });

    // ── Exploding Kittens events ──────────────────────────────────────────────

    socket.on('ek_play_card', (cardId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.playCard(playerId, cardId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('ek_play_pair', ({ cardId1, cardId2 }) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.playPair(playerId, cardId1, cardId2);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('ek_play_nope', (cardId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.playNope(playerId, cardId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('ek_draw_card', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.drawCard(playerId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('ek_select_target', (targetPlayerId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.selectTarget(playerId, targetPlayerId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('ek_favor_give', (cardId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.favorGive(playerId, cardId);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('ek_insert_kitten', (position) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room?.ekGame) return;
      const result = room.ekGame.insertKitten(playerId, position);
      if (!result.ok) socket.emit('error', result.error ?? 'Erreur.');
    });

    socket.on('select_game', (gameId) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.selectGame(playerId, roomCode, gameId);
      if (room) emit(room, 'room_state', room.state);
    });

    socket.on('return_to_hub', () => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      // Only allow if game is finished or player is host
      if (room.state.phase !== 'finished' && room.state.hostId !== playerId) return;
      const scores: Record<string, number> = {};
      if (room.game) {
        for (const p of room.state.players) {
          const gs = room.game.getClientState(p.id);
          scores[p.id] = gs?.myScore ?? 0;
        }
      }
      const updatedRoom = roomManager.returnToHub(roomCode, {
        gameId: room.state.selectedGameId ?? 'six-qui-prend',
        gameName: '6 Qui Prend !',
        winnerId: '',
        winnerName: '',
        scores,
      });
      if (updatedRoom) emit(updatedRoom, 'room_state', updatedRoom.state);
    });

    socket.on('send_chat', (message) => {
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;
      const msg = roomManager.addChatMessage(roomCode, playerId, message);
      if (msg) {
        const room = roomManager.getRoom(roomCode);
        if (room) emit(room, 'chat_message', msg);
      }
    });

    socket.on('reconnect_player', ({ roomCode, playerId }) => {
      const room = roomManager.reconnectPlayer(socket.id, roomCode, playerId);
      if (!room) { socket.emit('error', 'Reconnexion impossible.'); return; }
      socket.data.playerId = playerId;
      socket.data.roomCode = roomCode;
      socket.join(roomCode);
      broadcastRoomState(roomCode);
      emit(room, 'player_reconnected', playerId);

      if (room.game && room.state.phase === 'playing') {
        const state = room.game.getClientState(playerId);
        socket.emit('game_state', state);
      } else if (room.llGame && room.state.phase === 'playing') {
        const state = room.llGame.getClientState(playerId);
        socket.emit('ll_game_state', state);
      } else if (room.unoGame && room.state.phase === 'playing') {
        const state = room.unoGame.getClientState(playerId);
        socket.emit('uno_game_state', state);
      } else if (room.wlGame && room.state.phase === 'playing') {
        const state = room.wlGame.getClientState(playerId);
        socket.emit('wl_game_state', state);
      } else if (room.ekGame && room.state.phase === 'playing') {
        const state = room.ekGame.getClientState(playerId);
        socket.emit('ek_game_state', state);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      const { playerId, roomCode } = socket.data;
      if (!playerId || !roomCode) return;

      const room = roomManager.markDisconnected(playerId, roomCode);
      if (room) {
        emit(room, 'player_disconnected', playerId);
        broadcastRoomState(roomCode);
      }
    });
  });
}
