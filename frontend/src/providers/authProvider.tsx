import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { getProfile, token } = useAuth();

    useEffect(() => {
        if (token) {
            getProfile();
        }
    });

    return <>{children}</>;
}
