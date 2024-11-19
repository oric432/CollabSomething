import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { z } from "zod";
import { ApiError } from "@/types/api";

const registerSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["TEACHER", "STUDENT"], {
        required_error: "Please select a role",
    }),
});

export function RegisterForm() {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        role: "STUDENT" as "STUDENT" | "TEACHER",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            registerSchema.parse(formData);
            const result = await register(formData);

            if (result.type === "auth/register/rejected") {
                const payload = result.payload as ApiError;
                toast.error(payload.error);
                return;
            }

            if (result.meta.requestStatus === "fulfilled") {
                toast.success("Registration successful! Please log in.");
                navigate("/login");
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                err.errors.forEach((error) => {
                    toast.error(error.message);
                });
            } else {
                toast.error("An unexpected error occurred");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>Role</Label>
                <Select
                    value={formData.role}
                    onValueChange={(value: "TEACHER" | "STUDENT") =>
                        setFormData({ ...formData, role: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
            </Button>
        </form>
    );
}
