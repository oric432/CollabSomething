import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const createSessionSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    classId: z.string().min(1),
});

export const validateSession = {
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await createSessionSchema.parseAsync(req.body);
            next();
        } catch (error) {
            return res.status(400).json({ error: "Invalid session data" });
        }
    },
};
