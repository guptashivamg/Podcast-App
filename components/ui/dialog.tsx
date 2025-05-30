"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { X, Download } from 'lucide-react'
import { PreviewLoading } from './preview-loading'
import { ActionButton } from "@/components/ui/action-button"
const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const ImageDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    image: string;
    onDownload?: (e: React.MouseEvent) => Promise<void>;
    onClose?: () => void;
    isDownloading?: boolean;
  }
>(({ className, image, onDownload, onClose, isDownloading = false, ...props }, ref) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const isAnimated = image.endsWith('.gif') || image.includes('convex.cloud');

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay 
        className="bg-black/95 backdrop-blur-sm" 
        onClick={handleOutsideClick}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
          "w-[95vw] md:w-auto h-auto max-h-[90vh]",
          "p-0 shadow-2xl duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "overflow-hidden bg-black-1/95 border border-white/20 rounded-2xl",
          "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          className
        )}
        onClick={handleOutsideClick}
        {...props}
      >
        <div className="relative group min-h-[200px]">
          {isLoading && <PreviewLoading />}
          <Image
            src={image}
            width={1920}
            height={1080}
            sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 1200px"
            priority={true}
            className={cn(
              "w-auto h-auto max-w-[95vw] md:max-w-[90vw] max-h-[80vh]",
              "object-contain",
              isLoading ? "opacity-0" : "opacity-100",
              "transition-all duration-500"
            )}
            alt="Preview"
            unoptimized={isAnimated}
            onLoad={() => setIsLoading(false)}
            onClick={(e) => e.stopPropagation()}
          />

          {!isLoading && (
            <div
              className="absolute top-4 right-4 flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {onDownload && (
                <ActionButton
                  icon={Download}
                  onClick={onDownload}
                  label="Download"
                  size="large"
                  isLoading={isDownloading}
                />
              )}
              <DialogPrimitive.Close asChild>
                <ActionButton
                  icon={X}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose?.();
                  }}
                  label="Close"
                  size="large"
                />
              </DialogPrimitive.Close>
            </div>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
ImageDialogContent.displayName = "ImageDialogContent"

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ImageDialogContent,
} 