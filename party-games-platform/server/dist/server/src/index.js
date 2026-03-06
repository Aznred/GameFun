"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const socketHandler_1 = require("./sockets/socketHandler");
const RoomManager_1 = require("./rooms/RoomManager");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' },
});
const roomManager = new RoomManager_1.RoomManager();
(0, socketHandler_1.registerSocketHandlers)(io, roomManager);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`[party-games] Server running on http://localhost:${PORT}`);
});
