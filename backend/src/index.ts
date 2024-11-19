import dotenv from "dotenv";
import app from "./app";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WebSocketService } from "./services/websocket_service";
import { verifyToken } from "./utils/jwt";
import { IncomingMessage } from "http";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Initialize WebSocketService
const webSocketService = new WebSocketService();

// WebSocket connection handling
wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    try {
        // Extract token and session ID from query parameters
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const token = url.searchParams.get("token");
        const sessionId = url.searchParams.get("sessionId");

        if (!token || !sessionId) {
            ws.close(1008, "Missing authentication or session ID");
            return;
        }

        // Verify token and get user
        const user = await verifyToken(token);
        console.log("User", user);
        if (!user) {
            ws.close(1008, "Invalid authentication");
            return;
        }

        // Add client to session
        webSocketService.addClient(sessionId, user.userId, ws);

        // Handle incoming messages
        ws.on("message", async (message: string) => {
            try {
                const action = JSON.parse(message);
                await webSocketService.handleMessage({
                    ...action,
                    userId: user.userId,
                    timestamp: Date.now(),
                    sessionId,
                });
            } catch (error) {
                console.error("WebSocket message error:", error);
            }
        });

        // Handle disconnection
        ws.on("close", () => {
            webSocketService.removeClient(sessionId, user.userId);
        });
    } catch (error) {
        console.error("WebSocket connection error:", error);
        ws.close(1011, "Something went wrong");
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is ready`);
});

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
