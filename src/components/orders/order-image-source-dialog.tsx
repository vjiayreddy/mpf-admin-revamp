"use client"

import { BookOpenIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type OrderImageSourceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  onSelectDevice: () => void
  onSelectLookbook: () => void
}

/**
 * Legacy parity: Ref / Fit image source chooser
 * (Upload from Device vs Select from Lookbook).
 */
export function OrderImageSourceDialog({
  open,
  onOpenChange,
  title = "Select image source",
  onSelectDevice,
  onSelectLookbook,
}: OrderImageSourceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose where you want to add this image from.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex h-28 flex-col items-center justify-center gap-2"
            onClick={() => {
              onOpenChange(false)
              onSelectDevice()
            }}
          >
            <UploadIcon className="size-8 opacity-70" />
            <span className="text-xs font-medium">Upload from device</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex h-28 flex-col items-center justify-center gap-2"
            onClick={() => {
              onOpenChange(false)
              onSelectLookbook()
            }}
          >
            <BookOpenIcon className="size-8 opacity-70" />
            <span className="text-xs font-medium">Select from lookbook</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
