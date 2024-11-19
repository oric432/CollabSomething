import { Router } from "express";
import { WhiteboardController } from "../controllers/whiteboard_controller";
import { authMiddleware } from "../middleware/auth_middleware";
import { validateWhiteboard } from "../middleware/whiteboard_middleware";

const router = Router();

// Save whiteboard state
router.post(
    "/whiteboard/save",
    authMiddleware as any,
    validateWhiteboard.saveState as any,
    WhiteboardController.saveState as any
);

// Get whiteboard state
router.get(
    "/whiteboard/:id",
    authMiddleware as any,
    WhiteboardController.getState as any
);

export default router;
