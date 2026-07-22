"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import {
  LOGIN_SLIDE_INTERVAL_MS,
  LOGIN_SLIDES,
} from "@/config/login-slides"
import { cn } from "@/lib/utils"

export function LoginProfessionSlider({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || LOGIN_SLIDES.length <= 1) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % LOGIN_SLIDES.length)
    }, LOGIN_SLIDE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused])

  const active = LOGIN_SLIDES[index] ?? LOGIN_SLIDES[0]

  return (
    <div
      className={cn("relative isolate overflow-hidden bg-neutral-900", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {LOGIN_SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/mpflogo.png"
            alt="My Perfect Fit"
            width={140}
            height={40}
            className="h-9 w-auto rounded-[5px] object-contain drop-shadow-sm sm:h-10"
            priority
          />
        </div>

        <div className="mt-auto max-w-md space-y-3 pb-2 text-white">
          <p
            key={active.title}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
          >
            {active.title}
          </p>
          <p
            key={active.caption}
            className="animate-in fade-in slide-in-from-bottom-1 text-sm leading-relaxed text-white/80 duration-500 sm:text-base"
          >
            {active.caption}
          </p>
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Profession slides">
            {LOGIN_SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show slide ${i + 1}: ${slide.title}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index
                    ? "w-8 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/70"
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <p className="text-[11px] tracking-wide text-white/55">
            © {new Date().getFullYear()} My Perfect Fit
          </p>
        </div>
      </div>
    </div>
  )
}
