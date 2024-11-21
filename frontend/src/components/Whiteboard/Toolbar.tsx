import React from "react";
import { Palette, Eraser, Undo2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
    color: string;
    setColor: (color: string) => void;
    isErasing: boolean;
    setIsErasing: (isErasing: boolean) => void;
    eraserSize: number;
    setEraserSize: (size: number) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    onUndo: () => void;
    onClear: () => void;
    canUndo: boolean;
}

const colors = [
    "#000000", // Black
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#008000", // Dark Green
];

export const Toolbar: React.FC<ToolbarProps> = ({
    color,
    setColor,
    isErasing,
    setIsErasing,
    eraserSize,
    setEraserSize,
    brushSize,
    setBrushSize,
    onUndo,
    onClear,
    canUndo,
}) => {
    return (
        <Card className="p-4 mb-4">
            <div className="flex items-center gap-4">
                {/* Color Palette Section */}
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Palette className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Color Palette</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="flex gap-1">
                        {colors.map((c) => (
                            <TooltipProvider key={c}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            className={`w-6 h-6 rounded-md border-2 ${
                                                color === c
                                                    ? "border-primary"
                                                    : "border-transparent"
                                            }`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => {
                                                setColor(c);
                                                setIsErasing(false);
                                            }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Select Color</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>

                {/* Brush Size Section */}
                <div className="flex items-center gap-2 min-w-[200px]">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div
                                    className="w-4 h-4 rounded-full bg-foreground"
                                    style={{
                                        transform: `scale(${brushSize / 10})`,
                                    }}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Brush Size</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Slider
                        value={[brushSize]}
                        onValueChange={(value) => setBrushSize(value[0])}
                        min={1}
                        max={20}
                        step={1}
                        className="w-[100px]"
                    />
                </div>

                {/* Eraser Section */}
                <div className="flex items-center gap-2 min-w-[200px]">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant={isErasing ? "secondary" : "ghost"}
                                    size="icon"
                                    onClick={() => setIsErasing(!isErasing)}
                                >
                                    <Eraser className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eraser Tool</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {isErasing && (
                        <Slider
                            value={[eraserSize]}
                            onValueChange={(value) => setEraserSize(value[0])}
                            min={5}
                            max={50}
                            step={1}
                            className="w-[100px]"
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                >
                                    <Undo2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Undo Last Action</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClear}
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
    );
};
