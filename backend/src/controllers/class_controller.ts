import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../types/express";

const prisma = new PrismaClient();

export class ClassController {
    static async createClass(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const { name, description } = req.body;
            const teacherId = authenticatedReq.user.id;

            // Verify user is a teacher
            if (authenticatedReq.user.role !== "TEACHER") {
                return res.status(403).json({
                    error: "Only teachers can create classes",
                });
            }

            const newClass = await prisma.class.create({
                data: {
                    name,
                    description,
                    teacherId,
                    status: "ACTIVE",
                },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            return res.status(201).json(newClass);
        } catch (error) {
            console.error("Class creation error:", error);
            return res.status(500).json({ error: "Failed to create class" });
        }
    }

    static async getAllClasses(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const userId = authenticatedReq.user.id;
            const userRole = authenticatedReq.user.role;

            const classes = await prisma.class.findMany({
                where: {
                    OR: [
                        // If teacher, show their classes
                        ...(userRole === "TEACHER"
                            ? [{ teacherId: userId }]
                            : []),
                        // If student, show enrolled classes
                        ...(userRole === "STUDENT"
                            ? [
                                  {
                                      students: {
                                          some: {
                                              userId: userId,
                                          },
                                      },
                                  },
                              ]
                            : []),
                    ],
                    status: "ACTIVE", // Only show active classes
                },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    students: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    sessions: {
                        where: {
                            status: "ACTIVE",
                        },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            startedAt: true,
                            status: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return res.status(200).json(classes);
        } catch (error) {
            console.error("Get all classes error:", error);
            return res
                .status(500)
                .json({ error: "Failed to retrieve classes" });
        }
    }

    static async getClass(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const { id } = req.params;
            const userId = authenticatedReq.user.id;

            const classData = await prisma.class.findUnique({
                where: { id },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    students: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                },
                            },
                        },
                    },
                    sessions: {
                        where: {
                            status: "ACTIVE",
                        },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            startedAt: true,
                            status: true,
                        },
                    },
                },
            });

            if (!classData) {
                return res.status(404).json({ error: "Class not found" });
            }

            // Check if user has access to this class
            const isTeacher = classData.teacher.id === userId;
            const isStudent = classData.students.some(
                (enrollment) => enrollment.student.id === userId
            );

            if (!isTeacher && !isStudent) {
                return res.status(403).json({
                    error: "Not authorized to access this class",
                });
            }

            return res.status(200).json(classData);
        } catch (error) {
            console.error("Get class error:", error);
            return res.status(500).json({ error: "Failed to retrieve class" });
        }
    }

    static async deleteClass(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const { id } = req.params;
            const teacherId = authenticatedReq.user.id;

            // Verify class exists and user is the teacher
            const classToDelete = await prisma.class.findFirst({
                where: {
                    id,
                    teacherId,
                },
            });

            if (!classToDelete) {
                return res.status(404).json({
                    error: "Class not found or not authorized",
                });
            }

            // Soft delete by updating status
            await prisma.class.update({
                where: { id },
                data: {
                    status: "DELETED",
                },
            });

            return res.status(200).json({
                message: "Class successfully deleted",
            });
        } catch (error) {
            console.error("Delete class error:", error);
            return res.status(500).json({ error: "Failed to delete class" });
        }
    }

    static async enrollStudent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { studentId } = req.body;

            // Check if enrollment already exists
            const existingEnrollment = await prisma.classEnrollment.findUnique({
                where: {
                    userId_classId: {
                        userId: studentId,
                        classId: id,
                    },
                },
            });

            if (existingEnrollment) {
                return res.status(400).json({
                    error: "Student already enrolled in this class",
                });
            }

            const enrollment = await prisma.classEnrollment.create({
                data: {
                    userId: studentId,
                    classId: id,
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            return res.status(201).json(enrollment);
        } catch (error) {
            console.error("Enroll student error:", error);
            return res.status(500).json({ error: "Failed to enroll student" });
        }
    }

    static async getEnrolledStudents(req: Request, res: Response) {
        const authenticatedReq = req as AuthenticatedRequest;
        try {
            const { id } = req.params;
            const userId = authenticatedReq.user.id;

            // Verify access rights
            const classData = await prisma.class.findFirst({
                where: {
                    id,
                    OR: [
                        { teacherId: userId },
                        {
                            students: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    ],
                },
            });

            if (!classData) {
                return res.status(403).json({
                    error: "Not authorized to view this class's students",
                });
            }

            const enrollments = await prisma.classEnrollment.findMany({
                where: {
                    classId: id,
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

            return res.status(200).json(enrollments);
        } catch (error) {
            console.error("Get enrolled students error:", error);
            return res
                .status(500)
                .json({ error: "Failed to retrieve enrolled students" });
        }
    }
}
