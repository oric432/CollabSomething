import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react"; // Make sure to install lucide-react
import { Card } from "@/components/ui/card";

interface WhiteboardSessionProps {
    sessionId: string;
    token: string;
}

export function WhiteboardSession({
    sessionId,
    token,
}: WhiteboardSessionProps) {
    const [users, setUsers] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const wsUrl = `ws://localhost:3000?token=${token}&sessionId=${sessionId}`;
        const websocket = new WebSocket(wsUrl);

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "SESSION_USERS_UPDATE") {
                setUsers(data.users);
            }
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [sessionId, token]);

    return (
        <Card className="sticky top-4">
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full transition-all duration-200 ease-in-out"
            >
                <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-2 flex-shrink-0">
                            {users.slice(0, 3).map((user, index) => (
                                <Avatar
                                    key={index}
                                    className="w-6 h-6 border-2 border-white"
                                >
                                    <AvatarImage
                                        src={`https://avatar.vercel.sh/${user}.png`}
                                    />
                                    <AvatarFallback>
                                        {user.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {users.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs border-2 border-white flex-shrink-0">
                                    +{users.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-sm text-gray-600 truncate">
                            {users.length}{" "}
                            {users.length === 1 ? "user" : "users"}
                        </span>
                    </div>
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                    )}
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden">
                    <div className="p-2 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {users.map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
                            >
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarImage
                                        src={`https://avatar.vercel.sh/${user}.png`}
                                    />
                                    <AvatarFallback>
                                        {user.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate">{user}</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
