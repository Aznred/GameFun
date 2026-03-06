import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './sockets/socketHandler';
import { RoomManager } from './rooms/RoomManager';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const roomManager = new RoomManager();
registerSocketHandlers(io, roomManager);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[party-games] Server running on http://localhost:${PORT}`);
});
