import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppDispatch } from "@/store";
import { updatePassword } from "@/store/slices/authSlice";
import { toast } from "react-toastify";
import { z } from "zod";

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
            .string()
            .min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function SecuritySettings() {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<PasswordFormData>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Partial<PasswordFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        try {
            passwordSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: Partial<PasswordFormData> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0] as keyof PasswordFormData] =
                            err.message;
                    }
                });
                setErrors(formattedErrors);
            }
            return false;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            await dispatch(
                updatePassword({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                })
            ).unwrap();

            toast.success("Password updated successfully");
            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setErrors({});
        } catch (error) {
            console.error(error);
            toast.error("Failed to update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                            Current Password
                        </Label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                        {errors.currentPassword && (
                            <p className="text-sm text-red-500">
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-red-500">
                                {errors.newPassword}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            Confirm New Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
