import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(["TEACHER", "STUDENT"]).optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const validateUser = {
    register: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await registerSchema.parseAsync(req.body);
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Invalid registration data",
                details: error,
            });
        }
    },

    login: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await loginSchema.parseAsync(req.body);
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Invalid login data",
                details: error,
            });
        }
    },
};
