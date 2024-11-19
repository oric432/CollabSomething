import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const saveStateSchema = z.object({
    sessionId: z.string().min(1),
    currentState: z.string(), // Canvas state as string
    thumbnail: z.string().optional(), // Optional Base64 or URL string
});

export const validateWhiteboard = {
    saveState: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await saveStateSchema.parseAsync(req.body);
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Invalid whiteboard data",
                details: error,
            });
        }
    },
};
