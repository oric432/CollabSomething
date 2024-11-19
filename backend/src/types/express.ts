import { Request } from "express";

export interface SafeUser {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    tokenVersion: number;
}

// Extend the base Request type
export interface AuthenticatedRequest extends Request {
    user: SafeUser;
}
