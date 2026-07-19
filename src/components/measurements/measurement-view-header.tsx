"use client"

import { PrinterIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export type MeasurementViewHeaderProps = {
  title: string
  subtitle?: string | null
  printDisabled?: boolean
  onPrint: () => void
  onClose: () => void
}

export function MeasurementViewHeader({
  title,
  subtitle,
  printDisabled,
  onPrint,
  onClose,
}: MeasurementViewHeaderProps) {
  return (
    <div className="border-border flex shrink-0 flex-row items-start justify-between gap-3 border-b px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5"
          disabled={printDisabled}
          onClick={onPrint}
        >
          <PrinterIcon className="size-3.5" />
          Print
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="size-8"
          aria-label="Close"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
