import express from "express";
import { corsMiddleware } from "./config/cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import sessionRouter from "./routes/session_router";
import userRouter from "./routes/user_router";
import classRouter from "./routes/class_router";
import whiteboardRouter from "./routes/whiteboard_router";
import { errorHandler } from "./middleware/error_handler";
import morgan from "morgan";

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(corsMiddleware);
app.use(express.json()); // Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/sessions", sessionRouter);
app.use("/api/users", userRouter);
app.use("/api/classes", classRouter);
app.use("/api/whiteboards", whiteboardRouter);

// Health check
app.get("/health", (_, res) => {
    res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use(errorHandler as any);

export default app;
