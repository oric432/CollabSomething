import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const createClassSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
});

const enrollStudentSchema = z.object({
    studentId: z.string().min(1),
});

export const validateClass = {
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await createClassSchema.parseAsync(req.body);
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Invalid class data",
                details: error,
            });
        }
    },

    enroll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            await enrollStudentSchema.parseAsync(req.body);
            next();
        } catch (error) {
            return res.status(400).json({
                error: "Invalid enrollment data",
                details: error,
            });
        }
    },
};
