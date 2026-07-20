"use client"

import {
  EyeIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { EmbroideryListRow } from "@/lib/apollo/queries/embroidery"

export type EmbroideryRowActionsProps = {
  row: EmbroideryListRow
  onOpenOpsForm: (row: EmbroideryListRow) => void
  onOpenDesign: (row: EmbroideryListRow) => void
  onUpdateDetails: (row: EmbroideryListRow) => void
}

export function EmbroideryRowActions({
  row,
  onOpenOpsForm,
  onOpenDesign,
  onUpdateDetails,
}: EmbroideryRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Embroidery actions"
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
          onClick={() => {
            onUpdateDetails(row)
          }}
        >
          <PencilIcon className="size-4" />
          Update details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onOpenDesign(row)
          }}
        >
          <EyeIcon className="size-4" />
          View design
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onOpenOpsForm(row)
          }}
        >
          <ExternalLinkIcon className="size-4" />
          Ops form
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
