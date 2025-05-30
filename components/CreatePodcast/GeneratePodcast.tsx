'use client'

import { GeneratePodcastProps } from '@/types'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Loader, Mic, Play, Square, Trash2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { toast, useToast } from "@/components/ui/use-toast"
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleButtonGroup } from '../ui/toggle-button-group';
import { Input } from '../ui/input';
import { voiceCategories } from '@/constants/PodcastFields';

const MAX_CHARACTERS = 2500;
const CHARACTERS_PER_CREDIT = 150;

const useGeneratePodcast = ({
  setAudio, voiceType, voicePrompt, setAudioStorageId, audioStorageId, setVoiceType
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [estimatedCredits, setEstimatedCredits] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const deleteFile = useMutation(api.files.deleteFile);

  const { startUpload, isUploading } = useUploadFiles(generateUploadUrl, {
    onUploadComplete: async (uploadedFiles) => {
      console.log("Upload completed:", uploadedFiles);
      setUploadError(null);
      setProgress(80);
    },
    onUploadError: (error: any) => {
      console.error("Upload error:", error);
      setUploadError(error as Error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getAudioUrl = useMutation(api.podcasts.getUrl);

  // Update character count when prompt changes
  useEffect(() => {
    setCharacterCount(voicePrompt.length);
    setEstimatedCredits(Math.ceil(voicePrompt.length / CHARACTERS_PER_CREDIT));
  }, [voicePrompt]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Add handler for audio ending
  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleAudioEnded);
      return () => {
        audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current?.removeEventListener('ended', handleAudioEnded);
      };
    }
  }, []);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Playback started successfully
              })
              .catch(error => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
              });
          }
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling audio:", error);
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generatePodcast = async () => {
    try {
      setIsGenerating(true);

      // Delete previous audio if it exists
      if (audioStorageId) {
        await deleteFile({ storageId: audioStorageId });
        setAudio('');
        setAudioStorageId(null);
      }

      setUploadError(null);
      setProgress(20);

      if (!voicePrompt || !voiceType) {
        throw new Error(!voicePrompt ? "Please provide a Voice Prompt" : "Please provide a Voice Type");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/elevenlabs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: voicePrompt,
          voice: voiceType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      setProgress(60);
      const blob = await response.blob();
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      console.log('Starting file upload...');
      const uploadResult = await startUpload([file]);
      console.log('Upload result:', uploadResult);

      if (!uploadResult?.[0]?.response?.storageId) {
        throw new Error('No storage ID received');
      }

      const storageId = uploadResult[0].response.storageId;
      setAudioStorageId(storageId);
      console.log('Getting audio URL for storageId:', storageId);

      const audioUrl = await getAudioUrl({ storageId });
      if (!audioUrl) {
        throw new Error('Failed to get audio URL');
      }

      setAudio(audioUrl);
      setProgress(100);
      toast({
        title: "Podcast generated successfully",
      });

    } catch (error) {
      console.error('Error generating podcast:', error);
      toast({
        title: 'Error creating podcast',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (audioStorageId) {
        await deleteFile({ storageId: audioStorageId });
      }
      setAudio("");
      setAudioStorageId(null);
      toast({
        title: "Audio deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({
        title: 'Error deleting audio',
        description: error instanceof Error ? error.message : 'Failed to delete audio',
        variant: 'destructive',
      });
    }
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCustomUploading, setIsCustomUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an audio file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, or OGG)",
        variant: "destructive",
      });
      return;
    }

    setIsCustomUploading(true);
    setUploadProgress(20);

    try {
      // Delete previous audio if it exists
      if (audioStorageId) {
        await deleteFile({ storageId: audioStorageId });
        setAudio('');
        setAudioStorageId(null);
      }

      console.log('Starting custom file upload...');
      const uploadResult = await startUpload([file]);
      console.log('Upload result:', uploadResult);

      if (!uploadResult?.[0]?.response?.storageId) {
        throw new Error('No storage ID received');
      }

      const storageId = uploadResult[0].response.storageId;
      setAudioStorageId(storageId);
      console.log('Getting audio URL for storageId:', storageId);

      const audioUrl = await getAudioUrl({ storageId });
      if (!audioUrl) {
        throw new Error('Failed to get audio URL');
      }

      setAudio(audioUrl);
      setUploadProgress(100);
      setVoiceType("Custom"); // Set voice type to custom for uploaded audio
      toast({
        title: "Audio uploaded successfully",
      });
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred while uploading the file",
        variant: "destructive",
      });
    } finally {
      setIsCustomUploading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return {
    isGenerating,
    generatePodcast,
    progress,
    characterCount,
    estimatedCredits,
    audioRef,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    formatTime,
    handleAudioEnded,
    handleDelete,
    setDuration,
    setCurrentTime,
    isMounted,
    handleFileChange,
    uploadProgress,
    fileInputRef,
    isCustomUploading,
    isUploading
  }
}

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const {
    isGenerating,
    generatePodcast,
    progress,
    characterCount,
    estimatedCredits,
    audioRef,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    formatTime,
    handleAudioEnded,
    handleDelete,
    setDuration,
    setCurrentTime,
    isMounted,
    handleFileChange,
    uploadProgress,
    fileInputRef,
    isCustomUploading
  } = useGeneratePodcast(props);

  const [isCustomAudio, setIsCustomAudio] = useState(true);

  return (
    <div className="flex flex-col gap-6 w-full">
      <ToggleButtonGroup containerWidth="max-w-[520px]"
        button1text="Use AI to generate Audio" button2text="Upload custom Audio"
        button1Active={!isCustomAudio} button2Active={isCustomAudio}
        setButtonActive={(value) => setIsCustomAudio(!value)}
      />
      {/* Main Area */}
      {!isCustomAudio ? (
        <div className="flex flex-col gap-8">
          {/* Voice */}
          <div className="flex flex-col gap-3">
            <Label
              htmlFor='voice-select'
              className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
              <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
              AI Voice
            </Label>
            <Select
              onValueChange={(value) => {
                props.setVoiceType(value);
                const audio = new Audio(`/${value}.mp3`);
                audio.play().catch(error => {
                  console.error("Error playing voice sample:", error);
                });
              }}
              defaultValue={voiceCategories[0].value}
            >
              <SelectTrigger id='voice-select' className="bg-black-1/50 border-orange-1/10 hover:border-orange-1/30 
          transition-all duration-200 h-12 rounded-xl text-gray-1 px-4">
                <SelectValue placeholder="Select voice type" className="text-left" />
              </SelectTrigger>
              <SelectContent className="bg-black-1/95 text-white-1 border-orange-1/10 rounded-xl">
                {voiceCategories.map((voice) => (
                  <SelectItem
                    key={voice.value}
                    value={voice.value}
                    className="focus:bg-orange-1/20 hover:bg-orange-1/10 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.label}</span>
                      <span className="text-sm text-gray-1">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Script */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Label
                htmlFor='script-textarea'
                className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
                <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                Script
              </Label>
              <div className="text-sm text-gray-1 bg-black-1/50 px-3 py-1.5 rounded-full flex gap-3">
                <span className={characterCount > MAX_CHARACTERS ? "text-red-500 font-medium" : ""}>
                  {characterCount}/{MAX_CHARACTERS}
                </span>
                <span className="opacity-50">|</span>
                <span className={estimatedCredits > 50 ? "text-orange-1 font-medium" : ""}>
                  {estimatedCredits} credits
                </span>
              </div>
            </div>
            <Textarea
              id='script-textarea'
              placeholder="Write or generate script for your podcast..."
              className="input-class focus-visible:ring-offset-orange-1 min-h-[200px] text-base leading-relaxed
          transition-all duration-200 resize-y bg-black-1/50 hover:bg-black-1/70"
              value={props.voicePrompt}
              onChange={(e) => {
                const text = e.target.value;
                if (text.length <= MAX_CHARACTERS) {
                  props.setVoicePrompt(text);
                } else {
                  toast({
                    title: "Character limit exceeded",
                    description: `Maximum ${MAX_CHARACTERS} characters allowed`,
                    variant: "destructive",
                  });
                }
              }}
              onKeyDown={(e) => {
                // Prevent default behavior for space key to ensure it's captured
                if (e.key === ' ') {
                  e.stopPropagation();
                }
              }}
            />
          </div>

          {/* Generate Button */}
          <div className="flex flex-col gap-4 items-center">
            <Button
              onClick={generatePodcast}
              disabled={
                isGenerating ||
                !props.voiceType ||
                !props.voicePrompt ||
                props.voicePrompt.length > MAX_CHARACTERS ||
                estimatedCredits > 50
              }
              className={cn(
                "bg-gradient-to-r from-orange-1 to-orange-400",
                "text-white font-semibold gap-3 py-6 text-lg",
                "transition-all duration-300 hover:scale-[1.02]",
                "shadow-lg hover:shadow-orange-1/20",
                "rounded-xl",
                "disabled:opacity-50 disabled:hover:scale-100",
                "max-w-[600px]",
                "w-full"
              )}
            >
              {isGenerating ? (
                <>
                  Generating Audio
                  <Loader size={20} className="animate-spin" />
                </>
              ) : (
                <>
                  Generate Audio
                  <Mic size={20} className="animate-bounce" />
                </>
              )}
            </Button>

            {estimatedCredits > 50 && (
              <p className="text-sm text-red-500 bg-red-500/10 p-4 rounded-xl 
              border border-red-500/20 animate-pulse shadow-lg">
                Text is too long and would require too many credits. Please reduce the length.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={() => !isGenerating && !isCustomUploading && fileInputRef.current?.click()}
            className={cn(
              "image_div hover:border-orange-1/50 hover:bg-black-1/30",
              "transition-all duration-200 group animate-in fade-in-50",
              "border-black-6 bg-black-1/50",
              "p-4 sm:p-6 rounded-lg",
              (isGenerating || isCustomUploading) && "opacity-50 cursor-not-allowed hover:border-gray-700 hover:bg-transparent",
            )}
          >
            <Input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={isGenerating || isCustomUploading}
            />

            <div className="flex flex-col items-center gap-1">
              <h2
                className={cn(
                  "text-12 font-bold text-orange-1 group-hover:text-orange-400",
                  "transition-colors duration-200",
                )}
              >
                Click to upload
              </h2>
              <p className="text-12 font-normal text-gray-1">MP3, WAV, or OGG (max. 10MB)</p>
            </div>
          </div>

          {/* Script Input for Custom Audio */}
          <div className="flex flex-col gap-3 mt-4">
            <Label
              htmlFor='custom-script-textarea'
              className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
              <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
              Script (Optional)
            </Label>
            <Textarea
              id='custom-script-textarea'
              placeholder="Add a script for your custom audio..."
              className="input-class focus-visible:ring-offset-orange-1 min-h-[200px] text-base leading-relaxed
              transition-all duration-200 resize-y bg-black-1/50 hover:bg-black-1/70"
              value={props.voicePrompt}
              onChange={(e) => props.setVoicePrompt(e.target.value)}
              disabled={isGenerating || isCustomUploading}
            />
          </div>

          {isCustomUploading && (
            <div className="flex flex-col gap-3 mt-4 bg-black-1/50 p-6 rounded-xl border border-white/5 
            backdrop-blur-sm shadow-lg">
              <Progress value={uploadProgress} className="h-3 bg-black-1/50" />
              <div className="flex items-center gap-2.5 text-sm text-gray-1">
                <Loader size={16} className="animate-spin text-orange-1" />
                <p>Uploading audio... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Preview */}
      {props.audio ? (
        <div className="flex flex-col gap-2 sm:gap-3 mt-4 sm:mt-8">
          <div className="flex items-center justify-between">
            <Label className="text-15 sm:text-18 font-bold text-white-1 flex items-center gap-2 sm:gap-3">
              <div className="h-5 sm:h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
              Audio Preview
            </Label>
            <Button
              onClick={(e) => handleDelete(e)}
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1.5 sm:gap-2 self-end",
                "hover:scale-105 transition-all duration-300",
                "text-red-500 hover:text-red-400 rounded-full px-2 sm:px-4 py-1 sm:py-2",
                "hover:bg-red-500/10 sm:hover:bg-red-500/10",
                "text-xs sm:text-sm"
              )}
            >
              <Trash2 size={14} className="sm:size-4" />
              <span className="max-md:hidden">Delete Audio</span>
            </Button>
          </div>
          
          {/* Rest of the audio preview component remains unchanged */}
          {isMounted && (
            <div className="flex flex-col gap-3 sm:gap-4 bg-black-1/80 p-3 sm:p-6 rounded-xl backdrop-blur-sm 
            border border-white/10 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  onClick={(e) => togglePlayPause(e)}
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-10 w-10 sm:h-14 sm:w-14 rounded-full",
                    "bg-gradient-to-r from-orange-1 to-orange-400",
                    "hover:scale-110 transition-all duration-300",
                    "shadow-lg hover:shadow-orange-1/20",
                    isPlaying && "animate-pulse ring-2 ring-orange-1/50 ring-offset-2 ring-offset-black"
                  )}
                >
                  {isPlaying ?
                    <Square size={18} className="text-white sm:size-6" /> :
                    <Play size={18} className="ml-0.5 sm:ml-1 text-white sm:size-6" />
                  }
                </Button>
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="relative h-1.5 sm:h-2 bg-black-1/50 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-black-1/50" />

                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-1 to-orange-400 
                      transition-all duration-150 ease-out rounded-full"
                      style={{
                        width: `${(currentTime / duration) * 100}%`,
                        transform: 'translateZ(0)'
                      }}
                    />
                  </div>

                  {isMounted && (
                    <div className="flex justify-between text-xs sm:text-sm text-gray-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  )}
                </div>
              </div>

              <audio
                ref={audioRef}
                src={props.audio}
                className="hidden"
                onLoadedMetadata={(e) => {
                  props.setAudioDuration(e.currentTarget.duration);
                  setDuration(e.currentTarget.duration);
                }}
                onTimeUpdate={() => {
                  if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                  }
                }}
                onEnded={handleAudioEnded}
                onError={(e) => {
                  console.error("Audio playback error:", e);
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {isGenerating && (
            <div className="flex flex-col gap-3 mt-8 bg-black-1/50 p-6 rounded-xl border border-white/5 
            backdrop-blur-sm shadow-lg">
              <Progress value={progress} className="h-3 bg-black-1/50" />
              <div className="flex items-center gap-2.5 text-sm text-gray-1">
                <Loader size={16} className="animate-spin text-orange-1" />
                <p>Generating audio... {progress}%</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GeneratePodcast