"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type ReceiptImagePreviewProps = {
  open: boolean
  images: string[]
  initialIndex?: number
  onOpenChange: (open: boolean) => void
}

export function ReceiptImagePreview({
  open,
  images,
  initialIndex = 0,
  onOpenChange,
}: ReceiptImagePreviewProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    if (open) setIndex(initialIndex)
  }, [open, initialIndex])

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  const showPrev = useCallback(() => {
    setIndex((current) =>
      images.length === 0
        ? current
        : (current - 1 + images.length) % images.length
    )
  }, [images.length])

  const showNext = useCallback(() => {
    setIndex((current) =>
      images.length === 0 ? current : (current + 1) % images.length
    )
  }, [images.length])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
      if (event.key === "ArrowLeft") showPrev()
      if (event.key === "ArrowRight") showNext()
    }
    window.addEventListener("keydown", onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, close, showPrev, showNext])

  if (!open || images.length === 0) return null

  const src = images[Math.min(index, images.length - 1)]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Receipt screenshot preview"
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={close}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium">
          {index + 1} / {images.length}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 text-white hover:bg-white/15 hover:text-white"
          onClick={close}
          aria-label="Close preview"
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
            className="absolute left-3 z-10 size-10 text-white hover:bg-white/15 hover:text-white"
            onClick={showPrev}
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="size-6" />
          </Button>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- remote payment screenshots */}
        <img
          src={src}
          alt="Payment screenshot"
          className="max-h-full max-w-full rounded-lg object-contain"
        />
        {images.length > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 z-10 size-10 text-white hover:bg-white/15 hover:text-white"
            onClick={showNext}
            aria-label="Next image"
          >
            <ChevronRightIcon className="size-6" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
