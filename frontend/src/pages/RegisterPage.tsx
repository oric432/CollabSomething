import { RegisterForm } from "@/components/Auth/RegisterForm";
import { Card } from "@/components/ui/card";

export function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{" "}
                        <a
                            href="/login"
                            className="font-medium text-primary hover:text-primary/90"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
                <Card className="p-6">
                    <RegisterForm />
                </Card>
            </div>
        </div>
    );
}
