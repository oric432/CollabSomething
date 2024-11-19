import { LoginForm } from "@/components/Auth/LoginForm";
import { Card } from "@/components/ui/card";

export function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Don't have an account?{" "}
                        <a
                            href="/register"
                            className="font-medium text-primary hover:text-primary/90"
                        >
                            create a new account
                        </a>
                    </p>
                </div>
                <Card className="p-6">
                    <LoginForm />
                </Card>
            </div>
        </div>
    );
}
