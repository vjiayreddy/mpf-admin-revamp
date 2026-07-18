"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ImagePlusIcon,
  StarIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProductImagesManagerProps = {
  images: string[]
  primaryIndex: number
  disabled?: boolean
  onPrimaryChange: (index: number) => void
  onRemove: (index: number) => void
  onOpenUpload: () => void
}

export function ProductImagesManager({
  images,
  primaryIndex,
  disabled,
  onPrimaryChange,
  onRemove,
  onOpenUpload,
}: ProductImagesManagerProps) {
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null)

  const closeGallery = useCallback(() => setGalleryIndex(null), [])

  const showPrev = useCallback(() => {
    setGalleryIndex((current) => {
      if (current == null || images.length === 0) return current
      return (current - 1 + images.length) % images.length
    })
  }, [images.length])

  const showNext = useCallback(() => {
    setGalleryIndex((current) => {
      if (current == null || images.length === 0) return current
      return (current + 1) % images.length
    })
  }, [images.length])

  useEffect(() => {
    if (galleryIndex == null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGallery()
      if (event.key === "ArrowLeft") showPrev()
      if (event.key === "ArrowRight") showNext()
    }

    window.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [galleryIndex, closeGallery, showPrev, showNext])

  useEffect(() => {
    if (galleryIndex == null) return
    if (images.length === 0) {
      setGalleryIndex(null)
      return
    }
    if (galleryIndex >= images.length) {
      setGalleryIndex(images.length - 1)
    }
  }, [galleryIndex, images.length])

  if (images.length === 0) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onOpenUpload}
        className={cn(
          "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-10 transition-colors",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <UploadCloudIcon className="text-muted-foreground size-10" />
        <span className="text-sm font-medium">Upload product images</span>
        <span className="text-muted-foreground text-xs">
          PNG, JPG, or WEBP · up to 4 files per batch
        </span>
      </button>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => {
            const isPrimary = index === primaryIndex
            return (
              <div
                key={`${url}-${index}`}
                className={cn(
                  "group relative overflow-hidden rounded-lg border",
                  isPrimary && "ring-primary ring-2"
                )}
              >
                <button
                  type="button"
                  className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`View image ${index + 1} in gallery`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- product CDN URLs */}
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </button>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1.5">
                  <Button
                    type="button"
                    size="xs"
                    variant={isPrimary ? "secondary" : "ghost"}
                    className="h-7 text-white hover:bg-white/20 hover:text-white"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation()
                      onPrimaryChange(index)
                    }}
                    title="Set as primary image"
                  >
                    <StarIcon
                      className={cn(
                        "size-3.5",
                        isPrimary && "fill-amber-400 text-amber-400"
                      )}
                    />
                    {isPrimary ? "Primary" : "Set"}
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="size-7 text-white hover:bg-white/20 hover:text-white"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(index)
                    }}
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            disabled={disabled}
            onClick={onOpenUpload}
            className={cn(
              "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40 flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed transition-colors",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            <ImagePlusIcon className="text-muted-foreground size-6" />
            <span className="text-muted-foreground text-xs">Add more</span>
          </button>
        </div>
      </div>

      {galleryIndex != null && images[galleryIndex] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product image gallery"
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={closeGallery}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex min-w-0 items-center gap-2">
              <p className="text-sm font-medium">
                {galleryIndex + 1} / {images.length}
              </p>
              {galleryIndex === primaryIndex ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">
                  <StarIcon className="size-3 fill-amber-300 text-amber-300" />
                  Primary
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 text-white hover:bg-white/15 hover:text-white"
              onClick={closeGallery}
              aria-label="Close gallery"
            >
              <XIcon className="size-4" />
            </Button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-3 z-10 size-10 text-white hover:bg-white/15 hover:text-white sm:left-6"
                onClick={showPrev}
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="size-6" />
              </Button>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element -- product CDN URLs */}
            <img
              src={images[galleryIndex]}
              alt={`Product image ${galleryIndex + 1}`}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />

            {images.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 z-10 size-10 text-white hover:bg-white/15 hover:text-white sm:right-6"
                onClick={showNext}
                aria-label="Next image"
              >
                <ChevronRightIcon className="size-6" />
              </Button>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div
              className="flex justify-center gap-2 overflow-x-auto px-4 pb-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((url, index) => (
                <button
                  key={`thumb-${url}-${index}`}
                  type="button"
                  onClick={() => setGalleryIndex(index)}
                  className={cn(
                    "size-14 shrink-0 overflow-hidden rounded-md border-2 transition-opacity",
                    index === galleryIndex
                      ? "border-white opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === galleryIndex}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- product CDN URLs */}
                  <img
                    src={url}
                    alt=""
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
