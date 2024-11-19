import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, LogOut, User, BookOpen, Layout } from "lucide-react";

export function MainLayout() {
    const navigate = useNavigate();
    const { user, logout, isTeacher } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Button
                                variant="ghost"
                                className="text-xl font-bold"
                                onClick={() => navigate("/")}
                            >
                                <Layout className="w-5 h-5 mr-2" />
                                EduBoard
                            </Button>

                            <div className="hidden md:flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/")}
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/classes")}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Classes
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {isTeacher ? "Teacher" : "Student"}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar>
                                            <AvatarFallback>
                                                {user?.name
                                                    ? getInitials(user.name)
                                                    : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        {user?.name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuLabel className="text-sm font-normal text-gray-500">
                                        {user?.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => navigate("/profile")}
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                <Outlet />
            </main>
        </div>
    );
}
