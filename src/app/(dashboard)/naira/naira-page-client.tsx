"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLinkIcon, Loader2Icon, MessageSquareIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getNairaChatUrl } from "@/lib/naira/chat-url"
import { cn } from "@/lib/utils"

export function NairaPageClient() {
  const chatUrl = getNairaChatUrl()
  const [open, setOpen] = useState(Boolean(chatUrl))
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setIframeLoaded(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Chat with Naira
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Open the Nyra AI assistant in a full-screen view. Close anytime to
          return here, or jump to costing under Naira pricing.
        </p>
      </div>

      {!chatUrl ? (
        <div
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          role="alert"
        >
          <p className="font-medium">Chat URL is not configured</p>
          <p className="mt-1 opacity-90">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_NAIRA_CHAT_URL</code>{" "}
            in your environment and restart the dev server.
          </p>
        </div>
      ) : (
        <div className="bg-card flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
              <MessageSquareIcon className="text-muted-foreground size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Nyra chat</p>
              <p className="text-muted-foreground text-xs">
                Opens in a full-screen modal. The embed unloads when you close
                it to save resources.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setOpen(true)}>
              Open chat
            </Button>
            <Link
              href="/naira/pricing"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex items-center gap-1.5"
              )}
            >
              Naira pricing
              <ExternalLinkIcon className="size-3.5" />
            </Link>
          </div>
        </div>
      )}

      <Dialog open={open && Boolean(chatUrl)} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton
          className="bg-background top-0 left-0 flex h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 shadow-none"
        >
          <DialogHeader className="pr-12">
            <DialogTitle>Chat with Naira</DialogTitle>
            <DialogDescription>
              Nyra AI assistant (embedded)
            </DialogDescription>
          </DialogHeader>

          <div className="relative min-h-0 flex-1 bg-muted/20">
            {!iframeLoaded ? (
              <div className="text-muted-foreground absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm">
                <Loader2Icon className="size-4 animate-spin" />
                Loading chat…
              </div>
            ) : null}
            {open && chatUrl ? (
              <iframe
                key={chatUrl}
                src={chatUrl}
                title="Chat with Naira"
                className="absolute inset-0 size-full border-0"
                allow="clipboard-read; clipboard-write"
                onLoad={() => setIframeLoaded(true)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
