import dotenv from "dotenv";
import app from "./app";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WebSocketService } from "./services/websocket_service";
import { verifyToken } from "./utils/jwt";
import { IncomingMessage } from "http";
import { WhiteboardServer } from "./services/socketio";

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT!) || 4000;

new WhiteboardServer(PORT, app);

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
    process.exit(1);
});
