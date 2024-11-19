import { Router } from "express";
import { ClassController } from "../controllers/class_controller";
import { authMiddleware, requireTeacher } from "../middleware/auth_middleware";
import { validateClass } from "../middleware/class_middleware";

const router = Router();

// Class management routes
router.post(
    "/class/",
    [authMiddleware as any, requireTeacher as any],
    validateClass.create as any,
    ClassController.createClass as any
);

router.get(
    "/class/:id",
    authMiddleware as any,
    ClassController.getClass as any
);

router.delete(
    "/class/:id",
    [authMiddleware as any, requireTeacher as any],
    ClassController.deleteClass as any
);

// Enrollment routes
router.post(
    "/class/:id/enroll",
    [authMiddleware as any, requireTeacher as any],
    validateClass.enroll as any,
    ClassController.enrollStudent as any
);

router.get(
    "/class/:id/students",
    authMiddleware as any,
    ClassController.getEnrolledStudents as any
);

// Add this route with the existing routes
router.get("/all", authMiddleware as any, ClassController.getAllClasses as any);

export default router;
