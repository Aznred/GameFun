import { create } from 'zustand';
import { socket } from '../socket/socket';
import {
  RoomState,
  ClientGameState,
  RoundResult,
  GameEndResult,
  Card,
  ChatMessage,
} from '@shared/types';
import { LLClientGameState } from '@shared/loveLetterTypes';
import { LLCardId } from '@shared/loveLetterCards';
import { UnoClientGameState } from '@shared/unoTypes';
import { UnoColor } from '@shared/unoCards';
import { WlClientState } from '@shared/wavelengthTypes';
import { EKClientState } from '@shared/ekTypes';

export type AppPage = 'home' | 'lobby' | 'game' | 'results' | 'hub' | 'love-letter' | 'uno' | 'wavelength' | 'exploding-kittens';

interface Toast {
  id: string;
  message: string;
  type: 'error' | 'info' | 'success';
}

interface GameStore {
  playerId: string | null;
  playerName: string;
  avatar: string;
  selectedGameId: string;
  isConnected: boolean;
  connectionError: string | null;
  page: AppPage;
  room: RoomState | null;
  roomCode: string;
  game: ClientGameState | null;
  lastRoundResult: RoundResult | null;
  gameEndResult: GameEndResult | null;
  choosingRow: boolean;
  chooseRowCard: Card | null;
  selectedCardNumber: number | null;
  toasts: Toast[];
  chatMessages: ChatMessage[];
  // ── Love Letter ──────────────────────────────────────────────────────────────
  llGame: LLClientGameState | null;
  // ── UNO ──────────────────────────────────────────────────────────────────────
  unoGame: UnoClientGameState | null;
  // ── Wavelength ───────────────────────────────────────────────────────────────
  wlGame: WlClientState | null;
  // ── Exploding Kittens ────────────────────────────────────────────────────────
  ekGame: EKClientState | null;
  socket: typeof socket;

  setPlayerName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setSelectedGameId: (id: string) => void;
  selectCard: (n: number | null) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;
  playCard: () => void;
  chooseRow: (rowIndex: number) => void;
  kickPlayer: (playerId: string) => void;
  sendChat: (message: string) => void;
  dismissToast: (id: string) => void;
  resetToHome: () => void;
  selectGame: (gameId: string) => void;
  returnToHub: () => void;
  llPlayCard: (cardId: LLCardId, targetId?: string, guess?: LLCardId) => void;
  llNextRound: () => void;
  // ── UNO ──────────────────────────────────────────────────────────────────────
  unoPlayCard: (cardId: string) => void;
  unoDrawCard: () => void;
  unoPassTurn: () => void;
  unoChooseColor: (color: UnoColor) => void;
  unoCallUno: (targetId: string) => void;
  unoNextRound: () => void;
  // ── Wavelength ───────────────────────────────────────────────────────────────
  wlSubmitClue: (clue: string) => void;
  wlSubmitGuess: (position: number) => void;
  wlNextRound: () => void;
  // ── Exploding Kittens ────────────────────────────────────────────────────────
  ekPlayCard: (cardId: string) => void;
  ekPlayPair: (cardId1: string, cardId2: string) => void;
  ekPlayNope: (cardId: string) => void;
  ekDrawCard: () => void;
  ekSelectTarget: (targetPlayerId: string) => void;
  ekFavorGive: (cardId: string) => void;
  ekInsertKitten: (position: number) => void;
}

let toastCounter = 0;
function newToast(message: string, type: Toast['type']): Toast {
  return { id: String(++toastCounter), message, type };
}

// ─── Connexion fiable — attend la connexion ou échoue après timeout ───────────
function ensureConnected(timeoutMs = 8000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) { resolve(); return; }

    const timer = setTimeout(() => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      reject(new Error('Impossible de se connecter au serveur. Vérifiez qu\'il est lancé.'));
    }, timeoutMs);

    const onConnect = () => {
      clearTimeout(timer);
      socket.off('connect_error', onError);
      resolve();
    };

    const onError = (err: Error) => {
      clearTimeout(timer);
      socket.off('connect', onConnect);
      reject(new Error(`Erreur de connexion : ${err.message}`));
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);

    if (!socket.active) socket.connect();
  });
}

export const useGameStore = create<GameStore>((set, get) => {
  // ── Socket events ──────────────────────────────────────────────────────────

  socket.on('connect', () => {
    console.log('[socket] connected:', socket.id);
    set({ isConnected: true, connectionError: null });
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', reason);
    set({ isConnected: false });
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] connect_error:', err.message);
    set({ connectionError: err.message });
  });

  // Exploding Kittens events
  socket.on('ek_game_state', (state) => {
    set((s) => {
      const updates: Partial<typeof s> = { ekGame: state };
      if (s.page !== 'exploding-kittens') Object.assign(updates, { page: 'exploding-kittens' });
      return updates;
    });
  });

  // Wavelength events
  socket.on('wl_game_state', (state) => {
    set((s) => {
      const updates: Partial<typeof s> = { wlGame: state };
      if (s.page !== 'wavelength') Object.assign(updates, { page: 'wavelength' });
      return updates;
    });
  });

  // UNO events
  socket.on('uno_game_state', (state) => {
    set((s) => {
      const updates: Partial<typeof s> = { unoGame: state };
      if (s.page !== 'uno') Object.assign(updates, { page: 'uno' });
      return updates;
    });
  });

  // Love Letter events
  socket.on('ll_game_state', (state) => {
    set((s) => {
      const updates: Partial<typeof s> = { llGame: state };
      if (s.page !== 'love-letter') Object.assign(updates, { page: 'love-letter' });
      return updates;
    });
  });

  socket.on('game_start', (state) => {
    set({ game: state, page: 'game', lastRoundResult: null });
  });

  socket.on('game_state', (state) => {
    set({ game: state });
  });

  socket.on('round_result', (result) => {
    set({ lastRoundResult: result });
  });

  socket.on('choose_row', ({ card }) => {
    set({ choosingRow: true, chooseRowCard: card });
  });

  socket.on('game_end', (result) => {
    set({ gameEndResult: result, page: 'results' });
  });

  // When server sends room_state, update room and handle phase transitions
  socket.on('room_state', (room) => {
    set((s) => {
      const updates: Partial<typeof s> = { room };
      if (room.phase === 'hub' && s.page !== 'hub' && s.page !== 'home') {
        Object.assign(updates, { page: 'hub', game: null, lastRoundResult: null, selectedCardNumber: null });
      }
      return updates;
    });
  });

  socket.on('chat_message', (msg) => {
    set((s) => ({ chatMessages: [...s.chatMessages.slice(-199), msg] }));
  });

  socket.on('kicked', (reason) => {
    set({
      room: null,
      game: null,
      page: 'home',
      toasts: [...get().toasts, newToast(reason, 'error')],
    });
  });

  socket.on('error', (msg) => {
    set((s) => ({ toasts: [...s.toasts, newToast(msg, 'error')] }));
  });

  socket.on('player_disconnected', (pid) => {
    const room = get().room;
    if (room) {
      set({ room: { ...room, players: room.players.map((p) => p.id === pid ? { ...p, isConnected: false } : p) } });
    }
  });

  socket.on('player_reconnected', (pid) => {
    const room = get().room;
    if (room) {
      set({ room: { ...room, players: room.players.map((p) => p.id === pid ? { ...p, isConnected: true } : p) } });
    }
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  return {
    playerId: null,
    playerName: '',
    avatar: '🐮',
    selectedGameId: 'six-qui-prend',
    isConnected: false,
    connectionError: null,
    page: 'home',
    room: null,
    roomCode: '',
    game: null,
    lastRoundResult: null,
    gameEndResult: null,
    choosingRow: false,
    chooseRowCard: null,
    selectedCardNumber: null,
    toasts: [],
    chatMessages: [],
    llGame: null,
    unoGame: null,
    wlGame: null,
    ekGame: null,
    socket,

    setPlayerName: (name) => set({ playerName: name }),
    setAvatar: (avatar) => set({ avatar }),
    setSelectedGameId: (id) => set({ selectedGameId: id }),
    selectCard: (n) => set({ selectedCardNumber: n }),

    // ── Créer une salle ──────────────────────────────────────────────────────
    createRoom: async () => {
      const { playerName, avatar, selectedGameId } = get();
      if (!playerName.trim()) {
        set((s) => ({ toasts: [...s.toasts, newToast('Entrez un pseudonyme.', 'error')] }));
        return;
      }
      try {
        await ensureConnected();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erreur de connexion';
        set((s) => ({ toasts: [...s.toasts, newToast(msg, 'error')] }));
        return;
      }

      return new Promise<void>((resolve) => {
        socket.emit('create_room', { playerName: playerName.trim(), avatar, selectedGameId }, (res) => {
          if ('error' in res) {
            set((s) => ({ toasts: [...s.toasts, newToast(res.error, 'error')] }));
          } else {
            set({ playerId: res.playerId, roomCode: res.roomCode, page: 'lobby' });
          }
          resolve();
        });
      });
    },

    // ── Rejoindre une salle ──────────────────────────────────────────────────
    joinRoom: async (code) => {
      const { playerName, avatar } = get();
      if (!playerName.trim()) {
        set((s) => ({ toasts: [...s.toasts, newToast('Entrez un pseudonyme.', 'error')] }));
        return;
      }
      if (!code || code.length < 6) {
        set((s) => ({ toasts: [...s.toasts, newToast('Entrez un code de salle valide (6 caractères).', 'error')] }));
        return;
      }

      try {
        await ensureConnected();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Erreur de connexion';
        set((s) => ({ toasts: [...s.toasts, newToast(msg, 'error')] }));
        return;
      }

      return new Promise<void>((resolve) => {
        console.log('[join_room] emitting for code:', code.toUpperCase());
        socket.emit(
          'join_room',
          { roomCode: code.toUpperCase(), playerName: playerName.trim(), avatar },
          (res) => {
            console.log('[join_room] callback response:', res);
            if ('error' in res) {
              set((s) => ({ toasts: [...s.toasts, newToast(res.error, 'error')] }));
            } else {
              set({ playerId: res.playerId, roomCode: code.toUpperCase(), page: 'lobby' });
            }
            resolve();
          }
        );
      });
    },

    leaveRoom: () => {
      socket.emit('leave_room');
      set({ room: null, game: null, page: 'home', selectedCardNumber: null, lastRoundResult: null, roomCode: '' });
    },

    setReady: (ready) => {
      socket.emit('ready_player', ready);
    },

    startGame: () => {
      socket.emit('start_game');
    },

    playCard: () => {
      const { selectedCardNumber } = get();
      if (selectedCardNumber === null) return;
      socket.emit('play_card', selectedCardNumber);
      set({ selectedCardNumber: null });
    },

    chooseRow: (rowIndex) => {
      socket.emit('select_row', rowIndex);
      set({ choosingRow: false, chooseRowCard: null });
    },

    kickPlayer: (playerId) => {
      socket.emit('kick_player', playerId);
    },

    sendChat: (message) => {
      if (!message.trim()) return;
      socket.emit('send_chat', message.trim());
    },

    dismissToast: (id) => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    },

    selectGame: (gameId) => {
      socket.emit('select_game', gameId);
    },

    returnToHub: () => {
      socket.emit('return_to_hub');
      set({ page: 'hub', game: null, llGame: null, unoGame: null, wlGame: null, ekGame: null, lastRoundResult: null, selectedCardNumber: null, gameEndResult: null });
    },

    llPlayCard: (cardId, targetId, guess) => {
      socket.emit('ll_play_card', { cardId, targetId, guess });
    },

    llNextRound: () => {
      socket.emit('ll_next_round');
    },

    unoPlayCard: (cardId) => {
      socket.emit('uno_play_card', cardId);
    },

    unoDrawCard: () => {
      socket.emit('uno_draw_card');
    },

    unoPassTurn: () => {
      socket.emit('uno_pass_turn');
    },

    unoChooseColor: (color) => {
      socket.emit('uno_choose_color', color);
    },

    unoCallUno: (targetId) => {
      socket.emit('uno_call_uno', targetId);
    },

    unoNextRound: () => {
      socket.emit('uno_next_round');
    },

    wlSubmitClue: (clue) => { socket.emit('wl_submit_clue', clue); },
    wlSubmitGuess: (position) => { socket.emit('wl_submit_guess', position); },
    wlNextRound: () => { socket.emit('wl_next_round'); },

    ekPlayCard: (cardId) => { socket.emit('ek_play_card', cardId); },
    ekPlayPair: (cardId1, cardId2) => { socket.emit('ek_play_pair', { cardId1, cardId2 }); },
    ekPlayNope: (cardId) => { socket.emit('ek_play_nope', cardId); },
    ekDrawCard: () => { socket.emit('ek_draw_card'); },
    ekSelectTarget: (targetPlayerId) => { socket.emit('ek_select_target', targetPlayerId); },
    ekFavorGive: (cardId) => { socket.emit('ek_favor_give', cardId); },
    ekInsertKitten: (position) => { socket.emit('ek_insert_kitten', position); },

    resetToHome: () => {
      socket.disconnect();
      set({
        page: 'home',
        room: null,
        game: null,
        llGame: null,
        unoGame: null,
        wlGame: null,
        ekGame: null,
        gameEndResult: null,
        lastRoundResult: null,
        selectedCardNumber: null,
        choosingRow: false,
        chooseRowCard: null,
        chatMessages: [],
        roomCode: '',
        playerId: null,
      });
    },
  };
});
