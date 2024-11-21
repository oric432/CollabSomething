import jwt from "jsonwebtoken";
import { SafeUser } from "../types/express";

export const generateToken = (user: SafeUser): string => {
    return jwt.sign(
        {
            userId: user.id,
            name: user.name,
            email: user.email,
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "24h", // Token expires in 24 hours
        }
    );
};

export const generateRefreshToken = (user: SafeUser): string => {
    return jwt.sign(
        {
            userId: user.id,
            name: user.name,
            tokenVersion: user.tokenVersion,
        },
        process.env.JWT_REFRESH_SECRET as string,
        {
            expiresIn: "7d",
        }
    );
};

export const verifyToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(
        token,
        process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;
};
