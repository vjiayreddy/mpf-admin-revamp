"use client"

import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type ReceiptImagePreviewProps = {
  open: boolean
  images: string[]
  initialIndex?: number
  onOpenChange: (open: boolean) => void
  ariaLabel?: string
  /** QR codes need a white canvas and fixed large size for scanning. */
  variant?: "default" | "qr"
}

export function ReceiptImagePreview({
  open,
  images,
  initialIndex = 0,
  onOpenChange,
  ariaLabel = "Image preview",
  variant = "default",
}: ReceiptImagePreviewProps) {
  const [index, setIndex] = useState(initialIndex)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted || !open || images.length === 0) return null

  const src = images[Math.min(index, images.length - 1)]

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-[2000] flex flex-col bg-black/90"
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
          alt={variant === "qr" ? "QR code" : "Payment screenshot"}
          className={
            variant === "qr"
              ? "h-[min(70vh,28rem)] w-[min(70vh,28rem)] rounded-xl bg-white object-contain p-6 shadow-lg"
              : "max-h-full max-w-full rounded-lg object-contain"
          }
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

      {images.length > 1 ? (
        <div
          className="flex justify-center gap-2 overflow-x-auto px-4 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={
                i === index
                  ? "size-14 shrink-0 overflow-hidden rounded-md border-2 border-white opacity-100"
                  : "size-14 shrink-0 overflow-hidden rounded-md border-2 border-transparent opacity-60 hover:opacity-100"
              }
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>,
    document.body
  )
}
