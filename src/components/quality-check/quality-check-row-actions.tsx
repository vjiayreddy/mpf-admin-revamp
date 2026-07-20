"use client"

import { MoreHorizontalIcon, PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { QualityCheckOrderRow } from "@/lib/apollo/queries/store-orders"

export type QualityCheckRowActionsProps = {
  row: QualityCheckOrderRow
  onViewProducts: (row: QualityCheckOrderRow) => void
}

export function QualityCheckRowActions({
  row,
  onViewProducts,
}: QualityCheckRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-1 size-7"
            aria-label="More actions"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          className="gap-2 text-sm font-medium"
          onClick={() => onViewProducts(row)}
        >
          <PackageIcon className="size-4 shrink-0" aria-hidden />
          View products
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
