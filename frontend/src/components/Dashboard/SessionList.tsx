import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { endSession } from "@/store/slices/sessionSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { Session } from "@/store/slices/sessionSlice";
interface SessionListProps {
    sessions: Session[];
    isLoading: boolean;
}

export function SessionList({ sessions, isLoading }: SessionListProps) {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { isTeacher } = useAuth();

    const handleEndSession = async (sessionId: string) => {
        try {
            await dispatch(endSession(sessionId)).unwrap();
            toast.success("Session ended successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to end session");
        }
    };

    if (isLoading) {
        return <div>Loading sessions...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Class Sessions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                    <Card
                        key={session.id}
                        className="hover:shadow-lg transition-shadow"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {session.title}
                            </CardTitle>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    session.status === "ACTIVE"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {session.status}
                            </span>
                        </CardHeader>
                        <CardContent>
                            {session.thumbnail && (
                                <div className="mb-4">
                                    <img
                                        src={session.thumbnail}
                                        alt="Session preview"
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                </div>
                            )}
                            <p className="text-sm text-gray-600 mb-4">
                                {session.description}
                            </p>
                            <div className="text-sm text-gray-500 mb-4">
                                Started{" "}
                                {formatDistanceToNow(
                                    new Date(session.startedAt)
                                )}{" "}
                                ago
                            </div>
                            <div className="flex justify-between items-center">
                                <Button
                                    onClick={() =>
                                        navigate(`/session/${session.id}`)
                                    }
                                    variant="outline"
                                    disabled={session.status !== "ACTIVE"}
                                >
                                    {session.status === "ACTIVE"
                                        ? "Join Session"
                                        : "View Session"}
                                </Button>
                                {isTeacher && session.status === "ACTIVE" && (
                                    <Button
                                        onClick={() =>
                                            handleEndSession(session.id)
                                        }
                                        variant="destructive"
                                    >
                                        End Session
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
