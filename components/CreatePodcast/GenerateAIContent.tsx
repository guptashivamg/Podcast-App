import { Button } from "@/components/ui/button";
import { Loader, NotebookPen } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toneOptions, targetAudienceOptions, styleOptions } from "@/constants/PodcastFields";
import { Textarea } from "@/components/ui/textarea";
import { languageOptions } from "@/constants/PodcastFields";
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group";

interface GenerateAIContentProps {
    title: string;
    setTone: (value: string) => void;
    tone: string;
    setTargetAudience: (value: string) => void;
    targetAudience: string;
    setStyle: (value: string) => void;
    style: string;
    setDuration: (value: number[]) => void;
    duration: number[];
    generateAIContent: () => void;
    isGeneratingContent: boolean;
    note: string;
    setNote: (value: string) => void;
    selectedLanguage: string;
    setSelectedLanguage: (value: string) => void;
}

const GenerateAIContent = ({
    title,
    setTone,
    tone,
    setTargetAudience,
    targetAudience,
    setStyle,
    style,
    setDuration,
    duration,
    generateAIContent,
    isGeneratingContent,
    note,
    setNote,
    selectedLanguage,
    setSelectedLanguage,
}: GenerateAIContentProps) => {
    const [isAiContent, setIsAiContent] = useState(false);

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full">
            <ToggleButtonGroup containerWidth="w-full sm:max-w-[530px]" button1text="Use AI to generate Content" button2text="Write custom Content"
                button1Active={isAiContent} button2Active={!isAiContent} setButtonActive={setIsAiContent} />

            {/* Main Content Area */}
            <div className="space-y-6 sm:space-y-8">
                {/* Language Selection with consistent spacing */}
                <div className="flex flex-col gap-2 sm:gap-3">
                    <Label
                        htmlFor="language-select"
                        className="text-15 sm:text-18 font-bold text-white-1 flex items-center gap-2 sm:gap-3 cursor-pointer">
                        <div className="h-5 sm:h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                        Content Language
                    </Label>
                    <Select onValueChange={setSelectedLanguage} defaultValue={selectedLanguage}>
                        <SelectTrigger id="language-select" className="bg-black-1/50 border-orange-1/10 hover:border-orange-1/30 
                            transition-all duration-200 h-10 sm:h-12 rounded-xl text-gray-1 px-3 sm:px-4">
                            <SelectValue placeholder="Select language" className="text-left" />
                        </SelectTrigger>
                        <SelectContent className="bg-black-1/95 text-white-1 border-orange-1/10 rounded-xl max-h-[40vh]">
                            {languageOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="focus:bg-orange-1/20 hover:bg-orange-1/10 transition-colors"
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isAiContent && (
                    <>
                        {/* Grid Layout with better spacing */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 mt-4 sm:mt-8">
                            {/* Content Tone */}
                            <div className="flex flex-col gap-2 sm:gap-3">
                                <Label htmlFor="tone-select" className="text-15 sm:text-18 font-bold text-white-1 flex items-center gap-2 sm:gap-3 cursor-pointer">
                                    <div className="h-5 sm:h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                                    Content Tone
                                </Label>
                                <Select onValueChange={setTone} defaultValue={tone}>
                                    <SelectTrigger id="tone-select" className="bg-black-1/50 border-orange-1/10 hover:border-orange-1/30 
                                        transition-all duration-200 h-10 sm:h-12 rounded-xl text-gray-1 px-3 sm:px-4">
                                        <SelectValue placeholder="Select tone" className="text-left" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black-1/95 text-white-1 border-orange-1/10 rounded-xl max-h-[40vh]">
                                        {toneOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="focus:bg-orange-1/20 hover:bg-orange-1/10 transition-colors"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Target Audience */}
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="target-audience-select" className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
                                    <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                                    Target Audience
                                </Label>
                                <Select onValueChange={setTargetAudience} defaultValue={targetAudience}>
                                    <SelectTrigger id="target-audience-select" className="bg-black-1/50 border-orange-1/10 hover:border-orange-1/30 
                                        transition-all duration-200 h-12 rounded-xl text-gray-1 px-4">
                                        <SelectValue placeholder="Select audience" className="text-left" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black-1/95 text-white-1 border-orange-1/10 rounded-xl">
                                        {targetAudienceOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="focus:bg-orange-1/20 hover:bg-orange-1/10 transition-colors"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Content Style */}
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="style-select" className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
                                    <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                                    Content Style
                                </Label>
                                <Select onValueChange={setStyle} defaultValue={style}>
                                    <SelectTrigger id="style-select" className="bg-black-1/50 border-orange-1/10 hover:border-orange-1/30 
                                        transition-all duration-200 h-12 rounded-xl text-gray-1 px-4">
                                        <SelectValue placeholder="Select style" className="text-left" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black-1/95 text-white-1 border-orange-1/10 rounded-xl">
                                        {styleOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="focus:bg-orange-1/20 hover:bg-orange-1/10 transition-colors"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Script Duration with better alignment */}
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <div className="flex items-center justify-between">
                                    <Label
                                        className="text-15 sm:text-18 font-bold text-white-1 flex items-center gap-2 sm:gap-3 cursor-pointer">
                                        <div className="h-5 sm:h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                                        Script Duration
                                    </Label>
                                    <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black-1/40 text-orange-1 
                                        font-medium text-xs sm:text-sm border border-orange-1/20">
                                        {duration[0]} {duration[0] === 1 ? 'minute' : 'minutes'}
                                    </span>
                                </div>
                                <div className="px-2 sm:px-4 py-4 sm:py-6">
                                    <Slider
                                        value={duration}
                                        onValueChange={setDuration}
                                        min={1}
                                        max={10}
                                        step={1}
                                        className="w-full cursor-pointer"
                                        aria-label="Script Duration"
                                    />
                                    <div className="flex justify-between mt-2 sm:mt-4 text-xs sm:text-sm text-gray-1">
                                        <span>1 min</span>
                                        <span>5 min</span>
                                        <span>10 min</span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes with full width */}
                            <div className="md:col-span-2 space-y-2 sm:space-y-3">
                                <Label htmlFor="notes-textarea" className="text-15 sm:text-18 font-bold text-white-1 flex items-center gap-2 sm:gap-3 cursor-pointer">
                                    <div className="h-5 sm:h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                                    Additional Notes (Optional)
                                </Label>
                                <Textarea
                                    id="notes-textarea"
                                    className={cn(
                                        "min-h-[100px] sm:min-h-[120px] w-full rounded-xl",
                                        "bg-black-1/50 hover:bg-black-1/70",
                                        "transition-all duration-200",
                                        "border border-orange-1/10 hover:border-orange-1/30",
                                        "focus:border-orange-1/50 focus:ring-1 focus:ring-orange-1/50",
                                        "p-3 sm:p-4",
                                        "placeholder:text-gray-1/70",
                                        "text-left",
                                        "text-[#FFFFFF]",
                                        "text-sm sm:text-base"
                                    )}
                                    placeholder="Add any specific requirements or points you want to include in the content..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    onKeyDown={(e) => {
                                        // Prevent default behavior for space key to ensure it's captured
                                        if (e.key === ' ') {
                                            e.stopPropagation();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="flex flex-col gap-4 items-center mt-6 sm:mt-8">
                            <Button
                                onClick={generateAIContent}
                                disabled={isGeneratingContent || !title}
                                className={cn(
                                    "bg-gradient-to-r from-orange-1 to-orange-400",
                                    "text-white font-semibold gap-2 sm:gap-3 py-4 sm:py-6 text-base sm:text-lg",
                                    "transition-all duration-300 hover:scale-[1.02]",
                                    "shadow-lg hover:shadow-orange-1/20",
                                    "rounded-xl",
                                    "disabled:opacity-50 disabled:hover:scale-100",
                                    "max-w-[600px]",
                                    "w-full"
                                )}
                            >
                                {isGeneratingContent ? (
                                    <>
                                        Generating Content
                                        <Loader size={18} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Generate Content
                                        <NotebookPen size={18} className="animate-bounce" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GenerateAIContent;