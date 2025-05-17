"use client";
import { Volume2, VolumeX, Gauge } from "lucide-react";
import { Slider } from "../ui/slider";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface AudioSettingsControlProps {
    // Volume props
    isMuted: boolean;
    toggleMute: () => void;
    volume: number;
    handleVolumeChange: (value: number[]) => void;
    // Playback speed props
    playbackRate: number;
    handlePlaybackRateChange: (rate: number) => void;
    // Common props
    variant?: "compact" | "fullscreen";
    className?: string;
}

const AudioSettingsControl = ({
    isMuted,
    toggleMute,
    volume,
    handleVolumeChange,
    playbackRate,
    handlePlaybackRateChange,
    variant = "compact",
    className,
}: AudioSettingsControlProps) => {
    const isFullscreen = variant === "fullscreen";
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
    
    // For custom dropdown in fullscreen mode
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
    const speedMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
                setIsSpeedMenuOpen(false);
            }
        };

        if (isSpeedMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSpeedMenuOpen]);

    return (
        <div className={cn("flex items-center gap-4", className)}>
            {/* Volume Control */}
            <div className={cn("flex items-center gap-2")}>
                <button
                    onClick={toggleMute}
                    className={cn(
                        "text-white hover:text-primary transition-colors",
                        isFullscreen && "hover:text-orange-1"
                    )}
                    title="Toggle Mute (M)"
                >
                    {isMuted ? (
                        <VolumeX className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} stroke="white" />
                    ) : (
                        <Volume2 className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} stroke="white" />
                    )}
                </button>
                <Slider
                    defaultValue={[1]}
                    max={1}
                    step={0.1}
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    className={cn("w-20", isFullscreen && "w-24")}
                />
            </div>

            {/* Playback Speed Control - Using only the custom dropdown implementation */}
            <div className="relative" ref={speedMenuRef}>
                <button
                    className={cn(
                        "flex items-center gap-1 text-gray-400 transition-colors",
                        isFullscreen ? "hover:text-orange-1" : "hover:text-white"
                    )}
                    title="Playback Speed"
                    onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                >
                    <Gauge className={cn("h-5 w-5", isFullscreen && "h-6 w-6")} stroke="white" />
                    <span className={cn("text-xs", isFullscreen && "text-sm")}>
                        {playbackRate}x
                    </span>
                </button>

                {isSpeedMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black-2 border border-white-1/10 rounded-md shadow-lg overflow-hidden z-[999999]">
                        <div className="flex flex-col">
                            {speedOptions.map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => {
                                        handlePlaybackRateChange(rate);
                                        setIsSpeedMenuOpen(false);
                                    }}
                                    className={cn(
                                        "cursor-pointer text-gray-300 hover:bg-gray-800 focus:bg-gray-800 focus:text-white px-4 py-2 text-sm text-left whitespace-nowrap",
                                        playbackRate === rate && "text-orange-1 font-medium bg-gray-900"
                                    )}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioSettingsControl;