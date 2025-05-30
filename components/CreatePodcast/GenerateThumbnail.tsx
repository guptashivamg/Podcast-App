import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { useRef, useState, useEffect } from "react"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Image, Loader } from "lucide-react"
import { Input } from "../ui/input"
import { useToast } from "../ui/use-toast"
import { useAction, useMutation } from "convex/react"
import { useUploadFiles } from "@xixixao/uploadstuff/react"
import { api } from "@/convex/_generated/api"
import { v4 as uuidv4 } from "uuid"
import type { Id } from "@/convex/_generated/dataModel"
import { Dialog } from "../ui/dialog"
import ImagePreview from "./ImagePreview"
import { ImageDialogContent } from "../ui/dialog"
import { ToggleButtonGroup } from "@/components/ui/toggle-button-group"

interface GenerateThumbnailProps {
  setImage: (url: string) => void
  setImageStorageId: (id: Id<"_storage"> | null) => void
  image: string
  imagePrompt: string
  setImagePrompt: (prompt: string) => void
  imageStorageId: Id<"_storage"> | null
  thumbnailPrompts: string[]
}

const GenerateThumbnail = ({
  setImage,
  setImageStorageId,
  image,
  imagePrompt,
  setImagePrompt,
  imageStorageId,
  thumbnailPrompts,
}: GenerateThumbnailProps) => {
  const [isAiThumbnail, setIsAiThumbnail] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const handleGenerateThumbnail = useAction(api.freepik.generateThumbnailAction)
  const [isAiGenerated, setIsAiGenerated] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isFullPreviewLoading, setIsFullPreviewLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  //To upload Image & fetch uploaded url
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getImageUrl = useMutation(api.podcasts.getUrl)
  const deleteFile = useMutation(api.files.deleteFile)

  // Reset full preview loading state when image or preview dialog changes
  useEffect(() => {
    if (isPreviewOpen) {
      setIsFullPreviewLoading(true)
    }
  }, [isPreviewOpen])

  // Helper function to delete previous image
  const deletePreviousImage = async () => {
    if (imageStorageId) {
      try {
        await deleteFile({ storageId: imageStorageId })
      } catch (error) {
        console.error("Error deleting previous image:", error)
      }
    }
  }

  //Image Handler Func
  const handleImage = async (blob: Blob, fileName: string, isAI = false) => {
    try {
      setIsImageLoading(true)
      setProgress(20)

      // Create a File from Blob
      const file = new File([blob], fileName, { type: "image/png" })

      setProgress(40)
      await deletePreviousImage()

      setProgress(60)
      const uploaded = await startUpload([file])
      if (!uploaded?.[0]?.response?.storageId) {
        throw new Error("Upload failed - no storage ID received")
      }

      const storageId = uploaded[0].response.storageId as Id<"_storage">
      setImageStorageId(storageId)

      const imageUrl = await getImageUrl({ storageId })
      setImage(imageUrl!)

      // Set the isAiGenerated state based on the parameter
      setIsAiGenerated(isAI)

      setProgress(100)

      if (isAI) {
        toast({
          title: "Thumbnail generated successfully",
        })
      } else {
        toast({
          title: "Image uploaded successfully",
        })
      }
    } catch (error) {
      console.error("Error handling image:", error)
      toast({
        title: "Error with image",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      })
    } finally {
      setIsImageLoading(false)
      setProgress(0)
    }
  }

  const uploadImage = async (file: File | null) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    await handleImage(file, file.name, false) // Explicitly set isAiGenerated to false
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      uploadImage(files[0])
    }
  }

  // Update generate function with better error handling
  const generateImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!imagePrompt.trim()) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt for the thumbnail",
        variant: "destructive",
      })
      return
    }

    try {
      setIsImageLoading(true)
      setProgress(20)

      const dataUrl = await handleGenerateThumbnail({ prompt: imagePrompt })
      if (!dataUrl) {
        throw new Error("No image data received from generation")
      }

      setProgress(40)

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      setProgress(60)
      await handleImage(blob, `thumbnail-${uuidv4()}.png`, true)
    } catch (error) {
      console.error("Error generating thumbnail:", error)
      toast({
        title: "Error generating thumbnail",
        description: error instanceof Error ? error.message : "Failed to generate thumbnail",
        variant: "destructive",
      })
    } finally {
      setIsImageLoading(false)
      setProgress(0)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    try {
      e.stopPropagation()
      if (imageStorageId) {
        await deleteFile({ storageId: imageStorageId })
      }
      setImage("")
      setImageStorageId(null)
      setIsAiGenerated(false) // Reset the AI generated state
      toast({
        title: "Thumbnail deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting thumbnail:", error)
      toast({
        title: "Error deleting thumbnail",
        description: error instanceof Error ? error.message : "Failed to delete thumbnail",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      const response = await fetch(image)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `podcast-thumbnail-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Error downloading image",
        description: "Failed to download image",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <ToggleButtonGroup containerWidth="max-w-[580px]"
        button1text="Use AI to generate Thumbnail" button2text="Upload custom Thumbnail"
        button1Active={isAiThumbnail} button2Active={!isAiThumbnail}
        setButtonActive={setIsAiThumbnail}
      />

      {isAiThumbnail ? (
        <div className="flex flex-col gap-5 animate-in fade-in-50">
          {thumbnailPrompts.length > 0 && (
            <div className="mt-4 sm:mt-8 flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="h-5 sm:h-6 w-1.5 flex-shrink-0 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
                  <Label className="text-15 sm:text-18 font-bold text-white-1 leading-tight">
                    <>
                      <span className="sm:hidden">Select a Prompt</span>
                      <span className="hidden sm:inline">Select a Thumbnail Prompt</span>
                    </>
                  </Label>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-1.5 
                  bg-black-1/40 rounded-full border border-white/5">
                  {thumbnailPrompts.length} suggestions
                </span>
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                {thumbnailPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImagePrompt(prompt);
                    }}
                    className={cn(
                      "group relative text-left px-3 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300",
                      "hover:bg-black-1/70 border border-black-6",
                      "text-gray-1 hover:text-white-1",
                      "flex items-center justify-between",
                      "hover:shadow-lg hover:shadow-orange-1/5",
                      "hover:scale-[1.01] active:scale-[0.99]",
                      "gap-2 sm:gap-3",
                      imagePrompt === prompt ? [
                        "bg-black-1/70 border-orange-1/50 text-white-1",
                        "shadow-lg shadow-orange-1/10"
                      ] : "hover:border-orange-1/30"
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      {imagePrompt === prompt && (
                        <div className="h-full w-1 absolute left-0 top-0 bg-gradient-to-t from-orange-1 to-orange-400 rounded-l-xl" />
                      )}
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">{prompt}</span>
                    </div>
                    <div className={cn(
                      "w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex-shrink-0 transition-all duration-300",
                      "flex items-center justify-center",
                      imagePrompt === prompt ? [
                        "border-orange-1 bg-orange-1",
                        "group-hover:bg-orange-400 group-hover:border-orange-400"
                      ] : [
                        "border-gray-1/30 group-hover:border-orange-1/50",
                        "group-hover:scale-110"
                      ]
                    )}>
                      {imagePrompt === prompt && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 mt-6">
            <Label htmlFor='thumbnail-prompt' className="text-16 sm:text-18 font-bold text-white-1 flex items-center gap-3 cursor-pointer">
              <div className="h-6 w-1.5 bg-gradient-to-t from-orange-1 to-orange-400 rounded-full" />
              {thumbnailPrompts.length > 0 ? "Customize Prompt" : "Enter Prompt"}
            </Label>
            <Textarea
              id='thumbnail-prompt'
              className={cn(
                "input-class font-light min-h-[120px] w-full",
                "bg-black-1/50 hover:bg-black-1/70",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border border-black-6 rounded-xl",
                "p-4",
                "focus-visible:ring-offset-orange-1",
                "placeholder:text-gray-1/70"
              )}
              placeholder={
                thumbnailPrompts.length > 0
                  ? "Customize the selected prompt or write your own..."
                  : "Write a prompt for your thumbnail..."
              }
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              disabled={isImageLoading}
              onKeyDown={(e) => {
                // Prevent default behavior for space key to ensure it's captured
                if (e.key === ' ') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-4 items-center">
            <Button
              type="submit"
              onClick={generateImage}
              disabled={
                isImageLoading ||
                !imagePrompt.trim()
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
              {isImageLoading ? (
                <>
                  Generating Image
                  <Loader size={20} className="animate-spin" />
                </>
              ) : (
                <>
                  Generate Image
                  <Image size={20} className="animate-bounce" />
                </>
              )}
            </Button>
          </div>

        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={() => !isImageLoading && imageRef?.current?.click()}
            className={cn(
              "image_div hover:border-orange-1/50 hover:bg-black-1/30",
              "transition-all duration-200 group animate-in fade-in-50",
              "border-black-6 bg-black-1/50",
              "p-4 sm:p-6 rounded-lg",
              isImageLoading && "opacity-50 cursor-not-allowed hover:border-gray-700 hover:bg-transparent",
            )}
          >
            <Input
              type="file"
              className="hidden"
              ref={imageRef}
              onChange={handleFileChange}
              accept="image/*"
              disabled={isImageLoading}
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
              <p className="text-12 font-normal text-gray-1">SVG, PNG, JPG, or GIF (max. 1080x1080px)</p>
            </div>
          </div>
        </div>
      )}

      {(image || isImageLoading) && (
        <ImagePreview
          image={image}
          isImageLoading={isImageLoading}
          progress={progress}
          isAiThumbnail={isAiThumbnail}
          isAiGenerated={isAiGenerated}
          setIsPreviewOpen={setIsPreviewOpen}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          isDownloading={isDownloading}
        />
      )}

      {image && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <ImageDialogContent
            image={image}
            onDownload={handleDownload}
            onClose={() => setIsPreviewOpen(false)}
            isDownloading={isDownloading}
          />
        </Dialog>
      )}

      {/* Add a hidden input for form validation */}
      <input type="hidden" name="thumbnail" value={image} required aria-hidden="true" />
    </div>
  )
}

export default GenerateThumbnail
