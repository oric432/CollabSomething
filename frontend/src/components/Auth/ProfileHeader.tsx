import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RootState } from "@/store";

export function ProfileHeader() {
    const user = useSelector((state: RootState) => state.auth.user);

    if (!user) return null;

    return (
        <div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow">
            <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user.name} />
                <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-400 capitalize">
                    Role: {user.role.toLowerCase()}
                </p>
            </div>
        </div>
    );
}
