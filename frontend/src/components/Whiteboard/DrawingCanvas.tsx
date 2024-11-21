import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface DrawingCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: () => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
    canvasRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}) => {
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // Handle canvas resize
    useEffect(() => {
        const handleResize = () => {
            if (!canvasRef.current || !canvasContainerRef.current) return;

            const container = canvasContainerRef.current;
            const canvas = canvasRef.current;
            const rect = container.getBoundingClientRect();

            // Store the current canvas content
            const tempCanvas = document.createElement("canvas");
            const tempContext = tempCanvas.getContext("2d");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            if (tempContext) {
                tempContext.drawImage(canvas, 0, 0);
            }

            // Update canvas dimensions
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Restore the canvas content
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(
                    tempCanvas,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // Set default canvas settings
                context.lineCap = "round";
                context.lineJoin = "round";
                context.globalCompositeOperation = "source-over";
            }
        };

        // Initial setup
        handleResize();

        // Add resize event listener
        const resizeObserver = new ResizeObserver(handleResize);
        if (canvasContainerRef.current) {
            resizeObserver.observe(canvasContainerRef.current);
        }

        // Cleanup
        return () => {
            if (canvasContainerRef.current) {
                resizeObserver.unobserve(canvasContainerRef.current);
            }
            resizeObserver.disconnect();
        };
    }, [canvasRef]);

    // Handle touch events for mobile support
    const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (!canvasRef.current) return;

        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (!canvasRef.current) return;

        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY,
        });
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (!canvasRef.current) return;

        const mouseEvent = new MouseEvent("mouseup", {});
        canvasRef.current.dispatchEvent(mouseEvent);
    };

    return (
        <Card className="flex-1 p-1 bg-white">
            <div
                ref={canvasContainerRef}
                className="w-full h-full relative"
                style={{ touchAction: "none" }} // Prevents default touch actions
            >
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 border border-border rounded-sm cursor-crosshair"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            </div>
        </Card>
    );
};
