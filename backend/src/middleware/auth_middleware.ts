import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/express";

const prisma = new PrismaClient();

interface JwtPayload {
    userId: string;
    email: string;
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res
                .status(401)
                .json({ error: "No authorization token provided" });
            return;
        }

        // Check if token follows Bearer scheme
        if (!authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Invalid token format" });
            return;
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            res.status(401).json({ error: "No token provided" });
            return;
        }

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as JwtPayload;

            // Get user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    tokenVersion: true,
                },
            });

            if (!user) {
                res.status(401).json({ error: "User not found" });
                return;
            }

            // Attach user to request object
            req.user = user;

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({ error: "Token expired" });
                return;
            }
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ error: "Invalid token" });
                return;
            }
            throw error;
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

// Optional: Middleware for specific roles
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Insufficient permissions",
            });
        }

        next();
    };
};

// Optional: Middleware for teacher-only routes
export const requireTeacher = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role !== "TEACHER") {
        return res.status(403).json({
            error: "This action requires teacher privileges",
        });
    }

    next();
};
