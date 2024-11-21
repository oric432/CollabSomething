import React, { useRef, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, Eraser, Undo2, Users, Trash2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useParams } from "react-router-dom";
import { Toolbar } from "./Toolbar";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
const socket: Socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
});

interface Point {
    x: number;
    y: number;
}

interface DrawingData {
    start: Point;
    end: Point;
    color: string;
    brushSize: number;
    isEraser?: boolean;
    eraserSize?: number;
}

interface ConnectedUser {
    id: string;
    name: string;
}

interface DrawingAction {
    points: DrawingData[];
    color: string;
    brushSize: number;
    userId: string;
    username: string | undefined;
}

const Whiteboard: React.FC = () => {
    const sessionId = useParams<{ id: string }>().id;
    console.log(sessionId);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [previousPosition, setPreviousPosition] = useState<Point | null>(
        null
    );
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(2);
    const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
    const user = useSelector((state: RootState) => state.auth);
    const [currentLinePoints, setCurrentLinePoints] = useState<DrawingData[]>(
        []
    );
    const [drawingHistory, setDrawingHistory] = useState<DrawingAction[]>([]);
    const [userId] = useState(() =>
        Math.random().toString(36).substring(2, 15)
    );
    const [isErasing, setIsErasing] = useState(false);
    const [eraserSize, setEraserSize] = useState(100);

    useEffect(() => {
        // Join session with username and userId
        socket.emit("joinSession", {
            username: user.user?.name,
            userId: user.user?.id,
            sessionId,
        });

        // Handle incoming drawing events
        socket.on("drawing", (action: DrawingAction) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            // Draw all points in the line
            action.points.forEach((point) => {
                drawLine(
                    context,
                    point.start,
                    point.end,
                    action.color,
                    point.isEraser ? point.eraserSize! : action.brushSize,
                    point.isEraser
                );
            });
            setDrawingHistory((prev) => [...prev, action]);
        });

        // Handle canvas initialization
        socket.on("initCanvas", (canvasState: DrawingAction[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            // Clear the canvas first
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Replay all drawing actions
            canvasState.forEach((action) => {
                if (action.points && action.points.length > 0) {
                    action.points.forEach((point) => {
                        drawLine(
                            context,
                            point.start,
                            point.end,
                            action.color,
                            point.isEraser
                                ? point.eraserSize!
                                : action.brushSize, // Use eraserSize when erasing
                            point.isEraser
                        );
                    });
                }
            });
            setDrawingHistory(canvasState);
        });

        // Handle canvas clear
        socket.on("clearCanvas", () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            context.clearRect(0, 0, canvas.width, canvas.height);
            setDrawingHistory([]); // Reset drawing history
        });

        // Handle users list updates
        socket.on("users", (users: ConnectedUser[]) => {
            setConnectedUsers(users);
        });

        // Update the undoCanvas handler
        socket.on("undoCanvas", (actions: DrawingAction[]) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Redraw all actions
            actions.forEach((action) => {
                action.points.forEach((point) => {
                    drawLine(
                        context,
                        point.start,
                        point.end,
                        action.color,
                        action.brushSize,
                        point.isEraser
                    );
                });
            });
            setDrawingHistory(actions);
        });

        return () => {
            socket.emit("leaveSession");
            socket.off("drawing");
            socket.off("users");
            socket.off("clearCanvas");
            socket.off("initCanvas");
            socket.off("undoCanvas");
        };
    }, [user, sessionId]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && canvasContainerRef.current) {
                const canvas = canvasRef.current;
                const container = canvasContainerRef.current;
                const rect = container.getBoundingClientRect();

                // Set canvas size to match container
                canvas.width = rect.width;
                canvas.height = rect.height;

                // Maintain aspect ratio
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;
            }
        };

        handleResize(); // Initial sizing
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getCanvasPoint = (
        event: React.MouseEvent<HTMLCanvasElement>
    ): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    };

    const drawLine = (
        context: CanvasRenderingContext2D,
        start: Point,
        end: Point,
        color: string,
        size: number,
        isEraser: boolean = false
    ) => {
        context.globalCompositeOperation = isEraser
            ? "destination-out"
            : "source-over";
        context.strokeStyle = isEraser ? "rgba(0,0,0,1)" : color;
        context.lineWidth = size;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
        context.globalCompositeOperation = "source-over"; // Reset composite operation
    };

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        setDrawingHistory([]);
        socket.emit("clearCanvas", sessionId);
    };

    const handleUndo = () => {
        socket.emit("undo", { userId, sessionId });
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        setCurrentLinePoints([]); // Reset current line points

        const point = getCanvasPoint(event);
        setPreviousPosition(point);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !previousPosition) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const currentPosition = getCanvasPoint(event);

        const drawingData: DrawingData = {
            start: previousPosition,
            end: currentPosition,
            color: color,
            brushSize: brushSize,
            isEraser: isErasing,
            eraserSize: isErasing ? eraserSize : undefined,
        };

        // Draw line
        drawLine(
            context,
            previousPosition,
            currentPosition,
            color,
            isErasing ? eraserSize : brushSize,
            isErasing
        );

        setCurrentLinePoints((prev) => [...prev, drawingData]);
        setPreviousPosition(currentPosition);

        // When line is complete, emit the drawing action
        if (currentLinePoints.length > 0) {
            const drawingAction: DrawingAction = {
                points: [...currentLinePoints, drawingData],
                color: color,
                brushSize: brushSize,
                userId: userId,
                username: user.user?.name,
            };
            socket.emit("drawing", drawingAction);
            setDrawingHistory((prev) => [...prev, drawingAction]);
            setCurrentLinePoints([]); // Reset current line points
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        setPreviousPosition(null);

        // Emit the complete line
        if (currentLinePoints.length > 0) {
            const drawingAction: DrawingAction = {
                points: currentLinePoints,
                color: color,
                brushSize: brushSize,
                userId: userId,
                username: user.user?.name,
            };
            socket.emit("drawing", drawingAction);
            setDrawingHistory((prev) => [...prev, drawingAction]);
            setCurrentLinePoints([]); // Reset current line points
        }
    };

    return (
        <div className="flex min-h-screen bg-background p-6 gap-6">
            <div className="flex flex-col flex-1">
                {/* <Toolbar    color={color}
    setColor={setColor}
    isErasing={isErasing}
    setIsErasing={setIsErasing}
    eraserSize={eraserSize}
    setEraserSize={setEraserSize}
    brushSize={brushSize}
    setBrushSize={setBrushSize}
    onUndo={handleUndo}
    onClear={handleClearCanvas}
    canUndo/> */}
                <Card className="p-4 mb-4">
                    <div className="flex items-center gap-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <Palette className="w-4 h-4" />
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) =>
                                                setColor(e.target.value)
                                            }
                                            className="w-8 h-8 rounded cursor-pointer"
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Choose Color</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="flex-1 flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={
                                                isErasing
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                            size="icon"
                                            onClick={() =>
                                                setIsErasing(!isErasing)
                                            }
                                        >
                                            <Eraser className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {isErasing
                                                ? "Drawing Mode"
                                                : "Eraser Mode"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex-1 flex items-center gap-2">
                                {isErasing ? (
                                    <>
                                        <span className="text-sm text-muted-foreground">
                                            Eraser Size
                                        </span>
                                        <Slider
                                            value={[eraserSize]}
                                            onValueChange={([value]) =>
                                                setEraserSize(value)
                                            }
                                            max={50}
                                            min={5}
                                            step={1}
                                            className="w-[200px]"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm text-muted-foreground">
                                            Brush Size
                                        </span>
                                        <Slider
                                            value={[brushSize]}
                                            onValueChange={([value]) =>
                                                setBrushSize(value)
                                            }
                                            max={20}
                                            min={1}
                                            step={1}
                                            className="w-[200px]"
                                        />
                                    </>
                                )}
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleUndo}
                                            disabled={
                                                !drawingHistory.some(
                                                    (action) =>
                                                        action.userId === userId
                                                )
                                            }
                                        >
                                            <Undo2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Undo</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={handleClearCanvas}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Clear Canvas</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </Card>

                <Card className="flex-1 p-1 bg-white">
                    <div
                        ref={canvasContainerRef}
                        className="w-full h-full relative"
                    >
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 border border-border rounded-sm cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                    </div>
                </Card>
            </div>

            <Card className="w-64 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4" />
                    <h3 className="font-semibold">Connected Users</h3>
                </div>
                <ul className="space-y-2">
                    {connectedUsers.map((user) => (
                        <li
                            key={user.id}
                            className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground"
                        >
                            {user.name}
                            {user.id === userId && " (You)"}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default Whiteboard;
