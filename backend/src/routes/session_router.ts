import { Router } from "express";
import { SessionController } from "../controllers/session_controller";
import {
    authMiddleware,
    requireTeacher,
    requireRole,
} from "../middleware/auth_middleware";
import { validateSession } from "../middleware/session_middleware";

const router = Router();

// // Create new session
// router.post(
//     "/",
//     authMiddleware as any,
//     validateSession.create as any,
//     SessionController.createSession as any
// );

// Get session details
router.get(
    "/session/:id",
    authMiddleware as any,
    SessionController.getSession as any
);

// End session
router.post(
    "/session/:id/end",
    authMiddleware as any,
    SessionController.endSession as any
);

// Route that requires teacher role
router.post(
    "/session",
    [authMiddleware as any, requireTeacher as any],
    SessionController.createSession as any
);

// Get all sessions
router.get(
    "/all",
    authMiddleware as any,
    SessionController.getAllSessions as any
);

router.get(
    "/class/:id/sessions",
    authMiddleware as any,
    SessionController.getAllSessionsForClass as any
);

// // Route with specific roles
// router.get(
//     "/session/:id",
//     [authMiddleware as any, requireRole(["TEACHER", "STUDENT"]) as any],
//     SessionController.getSession as any
// );

export default router;
