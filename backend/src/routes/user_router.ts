import { Router } from "express";
import { UserController } from "../controllers/user_controller";
import { authMiddleware } from "../middleware/auth_middleware";
import { validateUser } from "../middleware/user_middleware";

const router = Router();

// Public routes
router.post(
    "/register",
    validateUser.register as any,
    UserController.register as any
);
router.post("/login", validateUser.login as any, UserController.login as any);

// Protected routes
router.get("/profile", authMiddleware as any, UserController.getProfile as any);
router.post("/logout", authMiddleware as any, UserController.logout as any);

export default router;
