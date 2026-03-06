import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

// En dev, on passe par le proxy Vite (même origine).
// En prod, on cible explicitement le serveur via VITE_SERVER_URL.
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  path: '/socket.io',
});
