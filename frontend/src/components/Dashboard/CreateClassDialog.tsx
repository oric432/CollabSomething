import { useState } from "react";
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
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createClass } from "@/store/slices/classSlice";
import { toast } from "react-toastify";
import { z } from "zod";

const createClassSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    description: z.string().max(500, "Description is too long").optional(),
});

export function CreateClassDialog() {
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            createClassSchema.parse(formData);
            await dispatch(createClass(formData)).unwrap();
            toast.success("Class created successfully!");
            setIsOpen(false);
            setFormData({ name: "", description: "" });
        } catch (err) {
            if (err instanceof z.ZodError) {
                err.errors.forEach((error) => toast.error(error.message));
            } else {
                toast.error("Failed to create class");
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Create New Class</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Class Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
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
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                            ) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create Class
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
