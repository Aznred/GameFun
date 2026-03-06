import { create } from 'zustand';
import { socket } from '../socket/socket';
import type {
  RoomState,
  ChatMessage,
  ReactionGameState,
  MemeBattleState,
  TruthLieState,
  GameEndResult,
} from '@shared/types';

export type AppPage = 'home' | 'lobby' | 'hub' | 'reaction' | 'meme-battle' | 'truth-lie' | 'results';

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
  page: AppPage;
  room: RoomState | null;
  toasts: Toast[];
  chatMessages: ChatMessage[];
  reactionState: ReactionGameState | null;
  memeBattleState: MemeBattleState | null;
  truthLieState: TruthLieState | null;
  gameEndResult: GameEndResult | null;

  setPlayerName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setSelectedGameId: (id: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;
  kickPlayer: (playerId: string) => void;
  sendChat: (message: string) => void;
  selectGame: (gameId: string) => void;
  returnToHub: () => void;
  dismissToast: (id: string) => void;
  reactionClick: () => void;
  memeSubmitCaption: (caption: string) => void;
  memeVote: (playerId: string) => void;
  truthLieSubmitVote: (vote: 'true' | 'false' | 'partial') => void;
}

let toastCounter = 0;
function newToast(message: string, type: Toast['type']): Toast {
  return { id: String(++toastCounter), message, type };
}

export const useGameStore = create<GameStore>((set, get) => {
  socket.on('connect', () => set({ isConnected: true }));
  socket.on('disconnect', () => set({ isConnected: false }));

  socket.on('room_state', (room) => {
    set({ room });
    if (room.phase === 'lobby') set({ page: 'lobby' });
    else if (room.phase === 'hub' && get().page !== 'results') set({ page: 'hub', gameEndResult: null });
  });

  socket.on('chat_message', (msg) => {
    set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
  });

  socket.on('reaction_game_state', (state) => set({ reactionState: state, page: 'reaction' }));
  socket.on('meme_battle_state', (state) => set({ memeBattleState: state, page: 'meme-battle' }));
  socket.on('truth_lie_state', (state) => set({ truthLieState: state, page: 'truth-lie' }));
  socket.on('game_end', (result) => set({ gameEndResult: result, page: 'results' }));

  socket.on('error', (msg) => set((s) => ({ toasts: [...s.toasts, newToast(msg, 'error')] })));
  socket.on('kicked', (msg) => {
    set({ room: null, playerId: null, page: 'home', toasts: [...get().toasts, newToast(msg, 'error')] });
  });

  return {
    playerId: null,
    playerName: '',
    avatar: '🐮',
    selectedGameId: 'reaction',
    isConnected: false,
    page: 'home',
    room: null,
    toasts: [],
    chatMessages: [],
    reactionState: null,
    memeBattleState: null,
    truthLieState: null,
    gameEndResult: null,

    setPlayerName: (name) => set({ playerName: name }),
    setAvatar: (avatar) => set({ avatar }),
    setSelectedGameId: (id) => set({ selectedGameId: id }),

    createRoom: async () => {
      const { playerName, avatar, selectedGameId } = get();
      return new Promise((resolve) => {
        socket.emit('create_room', { playerName, avatar, selectedGameId }, (res: any) => {
          if ('error' in res) {
            set((s) => ({ toasts: [...s.toasts, newToast(res.error, 'error')] }));
          } else {
            set({ playerId: res.playerId, room: { code: res.roomCode, hostId: res.playerId, players: [], phase: 'lobby', maxPlayers: 10, chat: [], selectedGameId, gameHistory: [] } as any, page: 'lobby' });
          }
          resolve();
        });
      });
    },

    joinRoom: async (code) => {
      const { playerName, avatar } = get();
      return new Promise((resolve) => {
        socket.emit('join_room', { roomCode: code.toUpperCase(), playerName, avatar }, (res: any) => {
          if ('error' in res) {
            set((s) => ({ toasts: [...s.toasts, newToast(res.error, 'error')] }));
          }
          resolve();
        });
      });
    },

    leaveRoom: () => {
      socket.emit('leave_room');
      set({ room: null, playerId: null, page: 'home' });
    },

    setReady: (ready) => socket.emit('ready_player', ready),
    startGame: () => socket.emit('start_game'),
    kickPlayer: (id) => socket.emit('kick_player', id),
    sendChat: (msg) => socket.emit('send_chat', msg),
    selectGame: (id) => socket.emit('select_game', id),
    returnToHub: () => set({ page: 'hub', gameEndResult: null }),
    dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

    reactionClick: () => socket.emit('reaction_click'),
    memeSubmitCaption: (caption) => socket.emit('meme_submit_caption', caption),
    memeVote: (playerId) => socket.emit('meme_vote', playerId),
    truthLieSubmitVote: (vote) => socket.emit('truth_lie_submit_vote', vote),
  };
});
