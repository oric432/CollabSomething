import { ReactNode } from "react";

interface ProfileLayoutProps {
    children: ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
}
