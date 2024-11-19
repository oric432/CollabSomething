import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types/express";
import { WebSocketService } from "../services/websocket_service";
import { StateUpdateMessage } from "../types/websocket";

const prisma = new PrismaClient();
const wsService = new WebSocketService();

export class WhiteboardController {
    static async saveState(req: AuthenticatedRequest, res: Response) {
        try {
            const { sessionId, currentState, thumbnail } = req.body;
            const userId = req.user.id;

            // Verify user has access to this session
            const session = await prisma.whiteboardSession.findFirst({
                where: {
                    id: sessionId,
                    class: {
                        OR: [
                            { teacherId: userId },
                            {
                                students: {
                                    some: {
                                        userId,
                                    },
                                },
                            },
                        ],
                    },
                    status: "ACTIVE", // Only allow updates to active sessions
                },
            });

            if (!session) {
                return res.status(403).json({
                    error: "Session not found or access denied",
                });
            }

            // Update the session state
            const updatedSession = await prisma.whiteboardSession.update({
                where: {
                    id: sessionId,
                },
                data: {
                    currentState,
                    thumbnail,
                },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                            teacherId: true,
                        },
                    },
                },
            });

            // Create state update message
            const stateUpdateMessage: StateUpdateMessage = {
                type: "stateUpdate",
                sessionId,
                userId,
                payload: {
                    currentState,
                    thumbnail,
                },
                timestamp: Date.now(),
            };

            // Notify all connected clients about the state update
            wsService.handleMessage(stateUpdateMessage);

            return res.status(200).json({
                message: "Whiteboard state saved successfully",
                session: updatedSession,
            });
        } catch (error) {
            console.error("Save whiteboard state error:", error);
            return res
                .status(500)
                .json({ error: "Failed to save whiteboard state" });
        }
    }

    static async getState(req: AuthenticatedRequest, res: Response) {
        try {
            const { id: sessionId } = req.params;
            const userId = req.user.id;

            // Verify user has access to this session
            const session = await prisma.whiteboardSession.findFirst({
                where: {
                    id: sessionId,
                    class: {
                        OR: [
                            { teacherId: userId },
                            {
                                students: {
                                    some: {
                                        userId,
                                    },
                                },
                            },
                        ],
                    },
                },
                include: {
                    class: {
                        select: {
                            id: true,
                            name: true,
                            teacherId: true,
                            teacher: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!session) {
                return res.status(404).json({
                    error: "Session not found or access denied",
                });
            }

            // Get the current state from WebSocket service (includes any unsaved changes)
            const currentState = await wsService.getCurrentState(sessionId);

            return res.status(200).json({
                ...session,
                currentState,
            });
        } catch (error) {
            console.error("Get whiteboard state error:", error);
            return res
                .status(500)
                .json({ error: "Failed to retrieve whiteboard state" });
        }
    }
}
