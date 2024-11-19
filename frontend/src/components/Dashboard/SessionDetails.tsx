import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getSession, endSession } from "@/store/slices/sessionSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";

export function SessionDetails() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { currentSession, isLoading } = useSelector(
        (state: RootState) => state.session
    );
    const { isTeacher } = useAuth();

    useEffect(() => {
        if (id) {
            dispatch(getSession(id));
        }
    }, [dispatch, id]);

    const handleEndSession = async () => {
        if (id) {
            try {
                await dispatch(endSession(id)).unwrap();
                toast.success("Session ended successfully");
                navigate(`/class/${currentSession?.classId}`);
            } catch (error) {
                console.log(error);
                toast.error("Failed to end session");
            }
        }
    };

    if (isLoading || !currentSession) {
        return <div>Loading session details...</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">
                        {currentSession.title}
                    </h1>
                    <p className="text-gray-600">
                        {currentSession.description}
                    </p>
                </div>
                {isTeacher && currentSession.status === "ACTIVE" && (
                    <Button onClick={handleEndSession} variant="destructive">
                        End Session
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Session Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Status:</span>{" "}
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        currentSession.status === "ACTIVE"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {currentSession.status}
                                </span>
                            </p>
                            <p></p>
                            <p>
                                <span className="font-semibold">Started:</span>{" "}
                                {formatDistanceToNow(
                                    new Date(currentSession.startedAt)
                                )}{" "}
                                ago
                            </p>
                            <p className="flex justify-center">
                                <Button
                                    onClick={() =>
                                        navigate(`/session/${id}/whiteboard`)
                                    }
                                    variant="outline"
                                    disabled={
                                        currentSession.status !== "ACTIVE"
                                    }
                                >
                                    Open Whiteboard
                                </Button>
                            </p>
                            {currentSession.endedAt && (
                                <p>
                                    <span className="font-semibold">
                                        Ended:
                                    </span>{" "}
                                    {formatDistanceToNow(
                                        new Date(currentSession.endedAt)
                                    )}{" "}
                                    ago
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Class Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p>
                                <span className="font-semibold">Class:</span>{" "}
                                {currentSession.class.name}
                            </p>
                            <p>
                                <span className="font-semibold">Teacher:</span>{" "}
                                {currentSession.class.teacher.name}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
