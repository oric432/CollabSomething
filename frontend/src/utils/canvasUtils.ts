import { Point } from "../types/whiteboard";

export const getCanvasPoint = (
    event: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
    };
};

export const drawLine = (
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
    context.globalCompositeOperation = "source-over";
};
