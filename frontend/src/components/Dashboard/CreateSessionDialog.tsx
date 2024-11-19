import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createSession } from "@/store/slices/sessionSlice";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { z } from "zod";

interface CreateSessionDialogProps {
    classId: string;
    onSessionCreated?: () => void;
}

const createSessionSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().max(500, "Description is too long").optional(),
});

export function CreateSessionDialog({
    classId,
    onSessionCreated,
}: CreateSessionDialogProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            createSessionSchema.parse(formData);
            await dispatch(createSession({ ...formData, classId })).unwrap();
            toast.success("Session created successfully!");
            setIsOpen(false);
            setFormData({ title: "", description: "" });
            onSessionCreated?.(); // Call the callback after successful creation
        } catch (err) {
            if (err instanceof z.ZodError) {
                err.errors.forEach((error) => toast.error(error.message));
            } else {
                toast.error("Failed to create session");
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Create New Session</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Whiteboard Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Session Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            placeholder="Enter session title"
                            maxLength={100}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Enter session description"
                            maxLength={500}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create Session
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
