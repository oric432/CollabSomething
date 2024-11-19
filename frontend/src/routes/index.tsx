import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { ClassDetails } from "@/components/Dashboard/ClassDetails";
import { SessionDetails } from "@/components/Dashboard/SessionDetails";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { Whiteboard } from "@/components/Whiteboard/Whiteboard";
import { MainLayout } from "@/components/MainLayout";
import ProfilePage from "@/pages/ProfilePage";

export function AppRoutes() {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes with MainLayout */}
            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="class/:id" element={<ClassDetails />} />
                <Route path="session/:id" element={<SessionDetails />} />
                <Route path="session/:id/whiteboard" element={<Whiteboard />} />
                <Route path="profile" element={<ProfilePage />} />
                {/* Redirect unmatched routes */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Route>
        </Routes>
    );
}
