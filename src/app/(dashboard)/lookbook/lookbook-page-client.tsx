"use client"

import { useState } from "react"
import { ExternalLinkIcon, Loader2Icon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { getLookbookUrl } from "@/lib/lookbook/lookbook-url"
import { cn } from "@/lib/utils"

export function LookbookPageClient() {
  const lookbookUrl = getLookbookUrl()
  const [iframeLoaded, setIframeLoaded] = useState(false)

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] flex-col md:-m-6">
      <div className="bg-background flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2 md:px-6">
        <div className="min-w-0">
          <h1 className="text-sm font-medium tracking-tight">Look Book</h1>
          <p className="text-muted-foreground truncate text-xs">
            Style Club admin lookbook (embedded)
          </p>
        </div>
        <a
          href={lookbookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex shrink-0 items-center gap-1.5"
          )}
        >
          Open in new tab
          <ExternalLinkIcon className="size-3.5" />
        </a>
      </div>

      <div className="relative min-h-0 flex-1 bg-muted/20">
        {!iframeLoaded ? (
          <div className="text-muted-foreground absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm">
            <Loader2Icon className="size-4 animate-spin" />
            Loading lookbook…
          </div>
        ) : null}
        <iframe
          key={lookbookUrl}
          src={lookbookUrl}
          title="Look Book"
          className="absolute inset-0 size-full border-0"
          allow="clipboard-read; clipboard-write"
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    </div>
  )
}
