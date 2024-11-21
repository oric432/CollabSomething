import React from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConnectedUser } from "@/types/whiteboard";

interface UsersListProps {
    users: ConnectedUser[];
    currentUserId: string;
}

export const UsersList: React.FC<UsersListProps> = ({
    users,
    currentUserId,
}) => {
    return (
        <Card className="w-64 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" />
                <h3 className="font-semibold">Connected Users</h3>
            </div>
            <ul className="space-y-2">
                {users.map((user) => (
                    <li
                        key={user.id}
                        className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground"
                    >
                        {user.name}
                        {user.id === currentUserId && " (You)"}
                    </li>
                ))}
            </ul>
        </Card>
    );
};
