import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RootState, AppDispatch } from "@/store";
import { updateProfile } from "@/store/slices/authSlice";
import { toast } from "react-toastify";
import { z } from "zod";

const profileSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function PersonalInfo() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!user) return null;

    const validateForm = () => {
        try {
            profileSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: Partial<ProfileFormData> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        formattedErrors[err.path[0] as keyof ProfileFormData] =
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
            await dispatch(updateProfile(formData)).unwrap();
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                    variant="ghost"
                    onClick={() => {
                        if (isEditing) {
                            setFormData({ name: user.name, email: user.email });
                            setErrors({});
                        }
                        setIsEditing(!isEditing);
                    }}
                >
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={user.role.toLowerCase()} disabled />
                    </div>
                    {isEditing && (
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
