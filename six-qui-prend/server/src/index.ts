import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '../../shared/types';
import { RoomManager } from './rooms/RoomManager';
import { registerSocketHandlers } from './sockets/socketHandler';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
// En dev, on accepte tout localhost (peu importe le port Vite).
// En prod, on restreint à CLIENT_ORIGIN.
const corsOrigin: string | RegExp | boolean = IS_PROD
  ? (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  : /^http:\/\/localhost(:\d+)?$/;

const app = express();
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60_000,
});

const roomManager = new RoomManager();
registerSocketHandlers(io, roomManager);

server.listen(PORT, () => {
  console.log(`🐮 6 qui prend! server running on http://localhost:${PORT}`);
  console.log(`   CORS origin: ${IS_PROD ? corsOrigin : 'localhost:* (dev)'}`);
});
