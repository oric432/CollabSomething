import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

interface Student {
    id: string;
    name: string;
    email: string;
}

interface EnrollStudentDialogProps {
    classId: string;
}

export function EnrollStudentDialog({ classId }: EnrollStudentDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/users/students/available");
                setStudents(response.data);
            } catch (error) {
                console.error("Failed to fetch available students:", error);
                toast.error("Failed to fetch available students");
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        try {
            await Promise.all(
                selectedStudents.map((studentId) =>
                    dispatch(enrollStudent({ classId, studentId })).unwrap()
                )
            );
            toast.success(
                `Successfully enrolled ${selectedStudents.length} student(s)!`
            );
            setIsOpen(false);
            setSelectedStudents([]);
        } catch (err) {
            console.error("Failed to enroll one or more students:", err);
            toast.error("Failed to enroll one or more students");
        }
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudents((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map((student) => student.id));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Enroll Students</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Enroll Students</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isLoading ? (
                        <div>Loading available students...</div>
                    ) : (
                        <>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={
                                        selectedStudents.length ===
                                        students.length
                                    }
                                    onCheckedChange={toggleAll}
                                />
                                <Label htmlFor="select-all">Select All</Label>
                            </div>
                            <ScrollArea className="h-[200px] border rounded-md p-2">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center space-x-2 py-2"
                                    >
                                        <Checkbox
                                            id={student.id}
                                            checked={selectedStudents.includes(
                                                student.id
                                            )}
                                            onCheckedChange={() =>
                                                toggleStudent(student.id)
                                            }
                                        />
                                        <Label
                                            htmlFor={student.id}
                                            className="flex-1"
                                        >
                                            <div>{student.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {student.email}
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </ScrollArea>
                        </>
                    )}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={selectedStudents.length === 0}
                    >
                        Enroll Selected Students
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
