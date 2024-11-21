import express, { Express } from "express";
import { createServer, Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface Point {
    x: number;
    y: number;
}

interface DrawingData {
    start: Point;
    end: Point;
    color: string;
    brushSize: number;
}

interface DrawingAction {
    points: DrawingData[];
    color: string;
    brushSize: number;
    userId: string;
    username: string;
}

interface User {
    id: string;
    username: string;
    socketId: string;
    sessionId?: string;
}

interface Session {
    users: Map<string, User>;
    canvasState: DrawingAction[];
}

export class WhiteboardServer {
    private app: Express;
    private httpServer: HTTPServer;
    private io: SocketIOServer;
    private sessions: Map<string, Session> = new Map();
    private userSessions: Map<string, string> = new Map(); // socketId -> sessionId

    constructor(port: number, app: Express) {
        this.app = app;
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });

        this.initializeSocketHandlers();
        this.startServer(port);
    }

    private initializeSocketHandlers() {
        this.io.on("connection", (socket: Socket) => {
            console.log("User connected:", socket.id);

            socket.on("joinSession", ({ username, userId, sessionId }) => {
                // Leave previous session if any
                const previousSessionId = this.userSessions.get(socket.id);
                if (previousSessionId) {
                    this.handleLeaveSession(socket, previousSessionId);
                }

                // Join new session
                socket.join(sessionId);
                this.userSessions.set(socket.id, sessionId);

                // Initialize session if it doesn't exist
                if (!this.sessions.has(sessionId)) {
                    this.sessions.set(sessionId, {
                        users: new Map(),
                        canvasState: [],
                    });
                }

                const session = this.sessions.get(sessionId)!;
                const user: User = {
                    id: `${socket.id}-${userId}`,
                    username: username,
                    socketId: socket.id,
                    sessionId: sessionId,
                };

                session.users.set(socket.id, user);

                // Send current canvas state to new user
                socket.emit("initCanvas", session.canvasState);

                // Broadcast updated users list to session
                this.broadcastSessionUsersList(sessionId);

                console.log(`User ${username} joined session ${sessionId}`);
            });

            socket.on("drawing", (action: DrawingAction) => {
                const sessionId = this.userSessions.get(socket.id);
                if (!sessionId) return;

                const session = this.sessions.get(sessionId);
                if (!session) return;

                if (action.points && action.points.length > 0) {
                    session.canvasState.push(action);
                    socket.to(sessionId).emit("drawing", action);
                }
            });

            socket.on("clearCanvas", (sessionId: string) => {
                const session = this.sessions.get(sessionId);
                if (!session) return;

                session.canvasState = [];
                this.io.to(sessionId).emit("clearCanvas");
            });

            socket.on("undo", ({ userId, sessionId }) => {
                const session = this.sessions.get(sessionId);
                if (!session) return;

                for (let i = session.canvasState.length - 1; i >= 0; i--) {
                    if (session.canvasState[i].userId === userId) {
                        session.canvasState.splice(i, 1);
                        this.io
                            .to(sessionId)
                            .emit("undoCanvas", session.canvasState);
                        break;
                    }
                }
            });

            socket.on("leaveSession", () => {
                const sessionId = this.userSessions.get(socket.id);
                if (sessionId) {
                    this.handleLeaveSession(socket, sessionId);
                }
            });

            socket.on("disconnect", () => {
                const sessionId = this.userSessions.get(socket.id);
                if (sessionId) {
                    this.handleLeaveSession(socket, sessionId);
                }
                console.log("User disconnected:", socket.id);
            });

            // Get available sessions
            socket.on("getSessions", () => {
                const sessionList = Array.from(this.sessions.entries()).map(
                    ([id, session]) => ({
                        id,
                        userCount: session.users.size,
                    })
                );
                socket.emit("sessionList", sessionList);
            });
        });
    }

    private handleLeaveSession(socket: Socket, sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        socket.leave(sessionId);
        session.users.delete(socket.id);
        this.userSessions.delete(socket.id);

        // Remove session if empty
        if (session.users.size === 0) {
            this.sessions.delete(sessionId);
            console.log(`Session ${sessionId} removed - no users remaining`);
        } else {
            this.broadcastSessionUsersList(sessionId);
        }

        console.log(`User ${socket.id} left session ${sessionId}`);
    }

    private broadcastSessionUsersList(sessionId: string) {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        const users = Array.from(session.users.values()).map((user) => ({
            id: user.id,
            name: user.username,
        }));

        this.io.to(sessionId).emit("users", users);
    }

    private startServer(port: number) {
        this.httpServer.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }

    // Helper method to get session statistics
    public getSessionStats() {
        return {
            totalSessions: this.sessions.size,
            sessions: Array.from(this.sessions.entries()).map(
                ([id, session]) => ({
                    id,
                    userCount: session.users.size,
                    drawingCount: session.canvasState.length,
                })
            ),
        };
    }
}
