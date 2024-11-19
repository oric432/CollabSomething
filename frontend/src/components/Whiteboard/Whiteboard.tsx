import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getSession } from "@/store/slices/sessionSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSyncDemo } from "@tldraw/sync";
import { WhiteboardSession } from "./WhiteboardSession";

export function Whiteboard() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const store = useSyncDemo({ roomId: id || "" });
    const { currentSession, isLoading } = useSelector(
        (state: RootState) => state.session
    );

    const token = useSelector((state: RootState) => state.auth.token);

    useEffect(() => {
        if (id) {
            dispatch(getSession(id));
        }
    }, [dispatch, id]);

    if (isLoading || !currentSession) {
        return <div>Loading whiteboard...</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div>
                <h1 className="text-2xl font-bold">{currentSession.title}</h1>
                <p className="text-gray-600">{currentSession.description}</p>
            </div>

            <div className="flex gap-4">
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Whiteboard</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full h-[calc(100vh-250px)] min-h-[700px]">
                        <Tldraw store={store} />
                    </CardContent>
                </Card>

                <div className="w-[250px]">
                    <WhiteboardSession
                        sessionId={id || ""}
                        token={token || ""}
                    />
                </div>
            </div>
        </div>
    );
}
