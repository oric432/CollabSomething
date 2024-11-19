import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    console.error("Error:", error);

    if (error.name === "UnauthorizedError") {
        return res.status(401).json({
            error: "Invalid token",
        });
    }

    return res.status(500).json({
        error: "Internal server error",
    });
};
