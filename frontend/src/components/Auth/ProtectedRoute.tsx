import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PropsWithChildren, useEffect } from "react";

type ProtectedRouteProps = PropsWithChildren<{
    allowedRoles?: string[];
}>;

export function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const { isAuthenticated, user, isLoading, token, getProfile } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (token && !isAuthenticated && !isLoading) {
            getProfile();
        }
    }, [token, isAuthenticated, isLoading, getProfile]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}
