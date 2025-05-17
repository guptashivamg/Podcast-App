"use client";
import { Play, Pause, FastForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
    isPlaying: boolean;
    togglePlayPause: () => void;
    forward: () => void;
    rewind: () => void;
    variant?: "compact" | "fullscreen";
    className?: string;
}

const PlaybackControls = ({
    isPlaying,
    togglePlayPause,
    forward,
    rewind,
    variant = "compact",
    className,
}: PlaybackControlsProps) => {
    const isFullscreen = variant === "fullscreen";

    return (
        <div className={cn("flex items-center justify-center", isFullscreen ? "gap-8" : "gap-6", className)}>
            <button
                className={cn(
                    "rounded-full p-2 transition-colors",
                    isFullscreen
                        ? "p-3 text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                onClick={rewind}
                title="Rewind 5s (Left Arrow)"
            >
                <FastForward
                    className={cn("transform rotate-180", isFullscreen ? "h-8 w-8" : "h-5 w-5")}
                    stroke="white"
                />
            </button>

            <button
                className={cn(
                    "rounded-full transition-colors",
                    isFullscreen
                        ? "bg-orange-1 p-5 text-white hover:bg-orange-1/90"
                        : "bg-primary p-2 text-black hover:bg-primary/80"
                )}
                onClick={togglePlayPause}
                title="Play/Pause (Space)"
            >
                {isPlaying ? (
                    <Pause
                        className={isFullscreen ? "h-10 w-10" : "h-5 w-5"}
                        stroke="white"
                    />
                ) : (
                    <Play
                        className={cn(
                            isFullscreen ? "h-10 w-10" : "h-5 w-5",
                        )}
                        stroke="white"
                    />
                )}
            </button>

            <button
                className={cn(
                    "rounded-full p-2 transition-colors",
                    isFullscreen
                        ? "p-3 text-gray-400 hover:bg-gray-800/50 hover:text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                onClick={forward}
                title="Forward 5s (Right Arrow)"
            >
                <FastForward
                    className={isFullscreen ? "h-8 w-8" : "h-5 w-5"}
                    stroke="white"
                />
            </button>
        </div>
    );
};

export default PlaybackControls;