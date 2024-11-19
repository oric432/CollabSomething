import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../types/express";

const prisma = new PrismaClient();

export class UserController {
    static async register(req: Request, res: Response) {
        try {
            const { email, password, name, role } = req.body;

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res
                    .status(400)
                    .json({ error: "Email already registered" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: role || "STUDENT", // Default to STUDENT if no role provided
                },
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

            // Generate token
            const token = generateToken(user);

            return res.status(201).json({
                user,
                token,
            });
        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json({ error: "Failed to register user" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Check password
            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Generate token
            const token = generateToken(user);

            // Return user data without password
            const { password: _, ...userWithoutPassword } = user;

            return res.status(200).json({
                user: userWithoutPassword,
                token,
            });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ error: "Failed to login" });
        }
    }

    static async getProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
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
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error("Get profile error:", error);
            return res
                .status(500)
                .json({ error: "Failed to get user profile" });
        }
    }

    static async logout(req: AuthenticatedRequest, res: Response) {
        try {
            return res.status(200).json({ message: "Successfully logged out" });
        } catch (error) {
            console.error("Logout error:", error);
            return res.status(500).json({ error: "Failed to logout" });
        }
    }
}
