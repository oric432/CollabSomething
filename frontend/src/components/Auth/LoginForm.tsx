import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { loginValidationMessages } from "@/utils/validationErrors";

// Using the same validation schema as backend
const loginSchema = z.object({
    email: z.string().email(loginValidationMessages.email.invalid),
    password: z.string().min(6, loginValidationMessages.password.tooShort),
});

export function LoginForm() {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            loginSchema.parse(formData);
            const result = await login(formData);

            // Check if login was rejected
            if (result.type === "auth/login/rejected") {
                const payload = result.payload as { error: string };
                toast.error(payload.error);
                return;
            }

            if (result.meta.requestStatus === "fulfilled") {
                toast.success("Welcome back!");
                navigate("/dashboard");
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
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-4 pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/register")}
                >
                    Create Account
                </Button>
            </div>
        </form>
    );
}
