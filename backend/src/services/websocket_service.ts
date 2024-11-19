import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";
import { throttle } from "../utils/throttle";
import {
    WebSocketMessage,
    WhiteboardAction,
    StateUpdateMessage,
    SyncRequestMessage,
} from "../types/websocket";

const prisma = new PrismaClient();

export class WebSocketService {
    private sessions: Map<string, Map<string, WebSocket>>;
    private sequenceNumbers: Map<string, number>;
    private sessionStates: Map<string, any>;
    private lastSaveTime: Map<string, number>;

    constructor() {
        this.sessions = new Map();
        this.sequenceNumbers = new Map();
        this.sessionStates = new Map();
        this.lastSaveTime = new Map();
    }

    public addClient(sessionId: string, userId: string, ws: WebSocket) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, new Map());
            this.sequenceNumbers.set(sessionId, 0);
            this.sessionStates.set(sessionId, null);
            this.lastSaveTime.set(sessionId, Date.now());
        }
        this.sessions.get(sessionId)?.set(userId, ws);
    }

    removeClient(sessionId: string, userId: string) {
        this.sessions.get(sessionId)?.delete(userId);
        if (this.sessions.get(sessionId)?.size === 0) {
            // Save state one last time before cleanup
            this.persistState(sessionId);
            this.sessions.delete(sessionId);
            this.sequenceNumbers.delete(sessionId);
            this.sessionStates.delete(sessionId);
            this.lastSaveTime.delete(sessionId);
        }
    }

    // Throttled state persistence
    private persistState = throttle(async (sessionId: string) => {
        const currentState = this.sessionStates.get(sessionId);
        if (!currentState) return;

        try {
            await prisma.whiteboardSession.update({
                where: { id: sessionId },
                data: {
                    currentState: JSON.stringify(currentState),
                    thumbnail: currentState.thumbnail,
                },
            });
            this.lastSaveTime.set(sessionId, Date.now());
        } catch (error) {
            console.error("State persistence error:", error);
        }
    }, 5000); // Save at most every 5 seconds

    async handleMessage(message: WebSocketMessage) {
        try {
            switch (message.type) {
                case "draw":
                case "erase":
                case "clear":
                case "undo":
                    await this.handleAction(message);
                    break;
                case "sync":
                    await this.handleSync(message);
                    break;
                case "stateUpdate":
                    await this.handleStateUpdate(message);
                    break;
                default:
                    console.log("Unknown message type:", message);
            }
        } catch (error) {
            console.error("WebSocket message handling error:", error);
        }
    }

    private async handleAction(action: WhiteboardAction) {
        const currentSeq = this.sequenceNumbers.get(action.sessionId) || 0;
        action.sequence = currentSeq + 1;
        this.sequenceNumbers.set(action.sessionId, action.sequence);

        this.updateSessionState(action);
        this.broadcastToSession(action.sessionId, action);

        if (this.shouldPersistState(action)) {
            this.persistState(action.sessionId);
        }
    }

    private async handleStateUpdate(message: StateUpdateMessage) {
        const { sessionId, payload } = message;
        this.sessionStates.set(sessionId, payload.currentState);
        this.broadcastToSession(sessionId, message);
    }

    private async handleSync(message: SyncRequestMessage) {
        const state = await this.getCurrentState(message.sessionId);
        const ws = this.sessions.get(message.sessionId)?.get(message.userId);

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    type: "stateUpdate",
                    sessionId: message.sessionId,
                    payload: {
                        currentState: state,
                    },
                })
            );
        }
    }

    private updateSessionState(action: WhiteboardAction) {
        const currentState = this.sessionStates.get(action.sessionId) || {
            paths: [],
        };

        switch (action.type) {
            case "draw":
                currentState.paths.push(action.payload);
                break;
            case "erase":
                currentState.paths = currentState.paths.filter(
                    (path: any) =>
                        !this.intersectsWithEraser(path, action.payload)
                );
                break;
            case "clear":
                currentState.paths = [];
                break;
            case "undo":
                if (currentState.paths.length > 0) {
                    currentState.paths.pop();
                }
                break;
        }

        this.sessionStates.set(action.sessionId, currentState);
    }

    private shouldPersistState(action: WhiteboardAction): boolean {
        const lastSave = this.lastSaveTime.get(action.sessionId) || 0;
        const timeSinceLastSave = Date.now() - lastSave;

        return (
            action.type === "clear" ||
            timeSinceLastSave >= 5000 ||
            this.sessions.get(action.sessionId)?.size === 0
        );
    }

    private intersectsWithEraser(path: any, eraser: any): boolean {
        // Implement intersection detection logic
        return false; // Placeholder
    }

    broadcastToSession(sessionId: string, message: WebSocketMessage) {
        const sessionClients = this.sessions.get(sessionId);
        if (sessionClients) {
            const messageStr = JSON.stringify(message);
            sessionClients.forEach((client, userId) => {
                if (
                    userId !== message.userId &&
                    client.readyState === WebSocket.OPEN
                ) {
                    client.send(messageStr);
                }
            });
        }
    }

    // Get current state for new connections
    async getCurrentState(sessionId: string): Promise<any> {
        let state = this.sessionStates.get(sessionId);

        if (!state) {
            // Load from database if not in memory
            const session = await prisma.whiteboardSession.findUnique({
                where: { id: sessionId },
                select: { currentState: true },
            });

            state = session?.currentState
                ? JSON.parse(session.currentState)
                : { paths: [] };
            this.sessionStates.set(sessionId, state);
        }

        return state;
    }
}
