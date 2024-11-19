import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { enrollStudent } from "@/store/slices/classSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { z } from "zod";

interface EnrollStudentDialogProps {
    classId: string;
}

const enrollStudentSchema = z.object({
    studentId: z.string().min(1, "Student ID is required"),
});

export function EnrollStudentDialog({ classId }: EnrollStudentDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);
    const [studentId, setStudentId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            enrollStudentSchema.parse({ studentId });
            await dispatch(enrollStudent({ classId, studentId })).unwrap();
            toast.success("Student enrolled successfully!");
            setIsOpen(false);
            setStudentId("");
        } catch (err) {
            if (err instanceof z.ZodError) {
                err.errors.forEach((error) => toast.error(error.message));
            } else {
                toast.error("Failed to enroll student");
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Enroll Student</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enroll a Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                            id="studentId"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="Enter student ID"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Enroll Student
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
