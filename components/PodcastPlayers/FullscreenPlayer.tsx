"use client";
import { useEffect, useRef, useState } from "react";
import { Slider } from "../ui/slider";
import {
    Gauge,
    X,
} from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import PodcastInfo from "./PodcastInfo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import LikeShareControls from "./LikeShareLoopControls";
import AudioSettingsControl from "./AudioSettingsControl";
import PlaybackControls from "./PlaybackControls";

interface FullscreenPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    audioRef: React.RefObject<HTMLAudioElement>;
    isPlaying: boolean;
    togglePlayPause: () => void;
    duration: number;
    currentTime: number;
    isMuted: boolean;
    toggleMute: () => void;
    volume: number;
    handleVolumeChange: (value: number[]) => void;
    playbackRate: number;
    handlePlaybackRateChange: (rate: number) => void;
    forward: () => void;
    rewind: () => void;
    isLooping: boolean;
    toggleLoop: () => void;
    audioDetails: {
        title: string;
        author: string;
        imageUrl: string;
        podcastId?: string;
    } | null;
}

const FullscreenPlayer = ({
    isOpen,
    onClose,
    audioRef,
    isPlaying,
    togglePlayPause,
    duration,
    currentTime,
    isMuted,
    toggleMute,
    volume,
    handleVolumeChange,
    playbackRate,
    handlePlaybackRateChange,
    forward,
    rewind,
    isLooping,
    toggleLoop,
    audioDetails,
}: FullscreenPlayerProps) => {
    const [seekValue, setSeekValue] = useState(0);
    const playerRef = useRef<HTMLDivElement>(null);
    const [isRealFullscreen, setIsRealFullscreen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const { user } = useUser();

    // Get podcast details including likes
    const podcast = useQuery(
        api.podcasts.getPodcastById,
        audioDetails?.podcastId ? { podcastId: audioDetails.podcastId } : "skip"
    );

    // Update isLiked state when podcast data is loaded
    useEffect(() => {
        if (podcast && user) {
            setIsLiked(podcast.likes?.includes(user.id) || false);
        }
    }, [podcast, user]);

    useEffect(() => {
        setSeekValue((currentTime / duration) * 100 || 0);
    }, [currentTime, duration]);

    const handleSeek = (value: number[]) => {
        const newTime = (value[0] / 100) * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    // Removed the fullscreen functionality and replaced with expanded player
    const enterFullscreen = () => {
        // No longer requesting browser fullscreen
        setIsRealFullscreen(true);
    };

    // Handle closing with improved animation
    const handleClose = () => {
        // Add fade-out animation
        playerRef.current?.classList.add('opacity-0', 'transition-opacity', 'duration-300');

        // Then close the dialog with a delay to ensure animations complete
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.code === "Escape") {
                handleClose();
            } else if (e.code === "Space") {
                e.preventDefault();
                togglePlayPause();
            } else if (e.code === "ArrowLeft") {
                rewind();
            } else if (e.code === "ArrowRight") {
                forward();
            } else if (e.code === "KeyM") {
                toggleMute();
            } else if (e.code === "KeyL") {
                toggleLoop();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, togglePlayPause, rewind, forward, toggleMute, toggleLoop]);

    // Enter expanded mode when the component is opened
    useEffect(() => {
        if (isOpen && !isRealFullscreen) {
            // Small delay to ensure the dialog is rendered
            const timer = setTimeout(() => {
                enterFullscreen();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isRealFullscreen]);

    if (!isOpen || !audioDetails) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
        }}>
            <DialogContent
                className="fixed z-50 max-w-full w-full h-full p-0 border-0 bg-black transition-all duration-500 ease-in-out"
                ref={playerRef}
                style={{
                    backgroundImage: `url(${audioDetails.imageUrl || "/icons/logo.png"})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundBlendMode: 'multiply',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                }}
            >
                <DialogTitle className="sr-only">
                    Now Playing: {audioDetails.title} by {audioDetails.author}
                </DialogTitle>

                <DialogDescription className="sr-only">
                    Full screen player for {audioDetails.title} by {audioDetails.author}. Use space to play or pause, arrow keys to seek, M to mute, and Escape to exit.
                </DialogDescription>

                <div className="flex flex-col h-screen w-screen animate-fadeIn">
                    {/* Background with blur and gradient */}
                    <div className="absolute inset-0 z-0 transition-opacity duration-500 ease-in-out">
                        <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/98 via-black/95 to-black/98 backdrop-blur-xl animate-fadeIn" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full p-4 md:p-8 lg:p-12 animate-slideUp">
                        {/* Header with close button */}
                        <div className="flex justify-between items-center mb-4 md:mb-8">
                            <div className="flex items-center gap-2">
                                <div className="bg-orange-1/20 p-2 rounded-full">
                                    <Gauge className="h-5 w-5 text-orange-1" />
                                </div>
                                <h2 className="text-xl font-bold text-white-1">Now Playing</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="rounded-full p-2 text-white-1 hover:bg-gray-800/50 transition-colors"
                                title="Exit Fullscreen (Esc)"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-4">
                            {/* Left side - Album art and info for mobile */}
                            <div className="md:hidden w-full flex flex-col items-center gap-6">
                                <PodcastInfo
                                    title={audioDetails.title}
                                    author={audioDetails.author}
                                    imageUrl={audioDetails.imageUrl}
                                    podcastId={audioDetails.podcastId}
                                    variant="fullscreen"
                                    showLink={false}
                                    className="flex flex-col items-center"
                                />
                            </div>

                            {/* Left side - Album art for desktop */}
                            <div className="hidden md:block">
                                <PodcastInfo
                                    title={audioDetails.title}
                                    author={audioDetails.author}
                                    imageUrl={audioDetails.imageUrl}
                                    podcastId={audioDetails.podcastId}
                                    variant="fullscreen"
                                    showLink={false}
                                    className="flex-col items-center"
                                    titleClassName="hidden"
                                    authorClassName="hidden"
                                />
                            </div>

                            {/* Right side - Controls and info */}
                            <div className="flex flex-col items-center md:items-start max-w-xl w-full gap-8">
                                {/* Podcast info - only visible on desktop */}
                                <div className="hidden md:block text-left w-full">
                                    <h1 className="text-3xl font-bold text-white-1 mb-2 line-clamp-2">{audioDetails.title}</h1>
                                    <p className="text-xl text-gray-400">{audioDetails.author}</p>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full">
                                    <Slider
                                        value={[seekValue]}
                                        max={100}
                                        step={0.1}
                                        onValueChange={(value) => handleSeek(value)}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* Main Controls - Using PlaybackControls component */}
                                <PlaybackControls
                                    isPlaying={isPlaying}
                                    togglePlayPause={togglePlayPause}
                                    forward={forward}
                                    rewind={rewind}
                                    variant="fullscreen"
                                    className="w-full"
                                />

                                {/* Additional controls */}
                                <div className="flex items-center justify-between w-full mt-4">
                                    <LikeShareControls
                                        podcastId={audioDetails.podcastId}
                                        title={audioDetails.title}
                                        author={audioDetails.author}
                                        variant="fullscreen"
                                        isLooping={isLooping}
                                        toggleLoop={toggleLoop}
                                    />

                                    <div className="relative z-[9999]">
                                        <AudioSettingsControl
                                            isMuted={isMuted}
                                            toggleMute={toggleMute}
                                            volume={volume}
                                            handleVolumeChange={handleVolumeChange}
                                            playbackRate={playbackRate}
                                            handlePlaybackRateChange={handlePlaybackRateChange}
                                            variant="fullscreen"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer with keyboard shortcuts */}
                        <div className="mt-auto pt-4 text-center text-gray-500 text-xs">
                            <p>Keyboard shortcuts: Space (Play/Pause), ← (Rewind), → (Forward), M (Mute), L (Loop), Esc (Exit)</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FullscreenPlayer;