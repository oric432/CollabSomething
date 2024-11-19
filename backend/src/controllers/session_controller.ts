import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types/express";

const prisma = new PrismaClient();

export class SessionController {
    // Convert methods to static to avoid binding issues
    static async createSession(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest; // Type assertion
        try {
            const { title, description, classId } = authenticatedReq.body;
            const teacherId = authenticatedReq.user.id;

            const classExists = await prisma.class.findFirst({
                where: {
                    id: classId,
                    teacherId: teacherId,
                },
            });

            if (!classExists) {
                return res.status(403).json({
                    error: "Not authorized to create session for this class",
                });
            }

            const session = await prisma.whiteboardSession.create({
                data: {
                    title,
                    description,
                    classId,
                    status: "ACTIVE",
                    currentState: "",
                },
                include: {
                    class: {
                        include: {
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

            return res.status(201).json(session);
        } catch (error) {
            console.error("Session creation error:", error);
            return res.status(500).json({ error: "Failed to create session" });
        }
    }

    static async getAllSessions(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const userId = authenticatedReq.user.id;
            const userRole = authenticatedReq.user.role;

            const sessions = await prisma.whiteboardSession.findMany({
                where: {
                    class: {
                        OR: [
                            // If teacher, show their class sessions
                            ...(userRole === "TEACHER"
                                ? [{ teacherId: userId }]
                                : []),
                            // If student, show enrolled class sessions
                            ...(userRole === "STUDENT"
                                ? [
                                      {
                                          students: {
                                              some: {
                                                  userId: userId,
                                              },
                                          },
                                      },
                                  ]
                                : []),
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
                orderBy: {
                    startedAt: "desc",
                },
            });

            return res.status(200).json(sessions);
        } catch (error) {
            console.error("Get all sessions error:", error);
            return res
                .status(500)
                .json({ error: "Failed to retrieve sessions" });
        }
    }

    static async getAllSessionsForClass(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const userId = authenticatedReq.user.id;
            const userRole = authenticatedReq.user.role;
            const { classId } = authenticatedReq.params;

            // First check if user has access to this class
            const classAccess = await prisma.class.findFirst({
                where: {
                    id: classId,
                    OR: [
                        { teacherId: userId },
                        {
                            students: {
                                some: {
                                    userId: userId,
                                },
                            },
                        },
                    ],
                },
            });

            if (!classAccess) {
                return res.status(403).json({
                    error: "Not authorized to view sessions for this class",
                });
            }

            const sessions = await prisma.whiteboardSession.findMany({
                where: {
                    classId: classId,
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
                orderBy: {
                    startedAt: "desc",
                },
            });

            return res.status(200).json(sessions);
        } catch (error) {
            console.error("Get class sessions error:", error);
            return res
                .status(500)
                .json({ error: "Failed to retrieve class sessions" });
        }
    }

    static async getSession(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const { id } = authenticatedReq.params;
            const userId = authenticatedReq.user.id;

            const session = await prisma.whiteboardSession.findUnique({
                where: { id },
                include: {
                    class: {
                        include: {
                            teacher: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            students: {
                                include: {
                                    student: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }

            return res.status(200).json(session);
        } catch (error) {
            console.error("Session retrieval error:", error);
            return res
                .status(500)
                .json({ error: "Failed to retrieve session" });
        }
    }

    static async endSession(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const { id } = authenticatedReq.params;
            const teacherId = authenticatedReq.user.id;

            const session = await prisma.whiteboardSession.findFirst({
                where: {
                    id,
                    class: {
                        teacherId: teacherId,
                    },
                },
            });

            if (!session) {
                return res
                    .status(404)
                    .json({ error: "Session not found or not authorized" });
            }

            const updatedSession = await prisma.whiteboardSession.update({
                where: { id },
                data: {
                    status: "COMPLETED",
                    endedAt: new Date(),
                },
            });

            return res.status(200).json(updatedSession);
        } catch (error) {
            console.error("Session end error:", error);
            return res.status(500).json({ error: "Failed to end session" });
        }
    }
}
