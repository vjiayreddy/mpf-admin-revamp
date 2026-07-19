"use client"

import {
  ClipboardCheckIcon,
  EyeIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RulerIcon,
  ShirtIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StoreOrderItem } from "@/lib/apollo/queries/store-orders"
import {
  hasStyleDesign,
  resolveProductCatId,
} from "@/lib/track-orders/product-cat-id"
import { cn } from "@/lib/utils"

export type OrderItemRowAction =
  | "stylingForm"
  | "measurementView"
  | "measurementEdit"
  | "qcView"
  | "qcEdit"
  | "trialView"
  | "trialEdit"
  | "outfitEdit"
  | "trackingHistory"
  | "embDesignForm"
  | "embQc"

export type OrderItemRowActionsProps = {
  item: StoreOrderItem
  /** Order customer userId — needed to enable measurement actions. */
  userId?: string | null
  /** Existing QC document id for this itemNumber, if any. */
  qualityCheckId?: string | null
  /** Wired step-by-step; unused actions no-op for now. */
  onAction?: (action: OrderItemRowAction, item: StoreOrderItem) => void
}

export function OrderItemRowActions({
  item,
  userId,
  qualityCheckId,
  onAction,
}: OrderItemRowActionsProps) {
  const run = (action: OrderItemRowAction) => {
    onAction?.(action, item)
  }
  const stylingAvailable = hasStyleDesign(item.styleDesign)
  const catId = resolveProductCatId(item.itemName, item.itemCatId)
  const measurementAvailable = Boolean(userId?.trim() && catId)
  const qcAvailable = Boolean(qualityCheckId?.trim())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Item actions"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-52"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Styling &amp; measurement</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={!stylingAvailable}
            onClick={() => {
              if (!stylingAvailable) return
              run("stylingForm")
            }}
            className={cn(stylingAvailable && "text-[#2f6f8f]")}
          >
            <SparklesIcon
              className={cn(
                "size-4",
                stylingAvailable ? "text-amber-500" : undefined
              )}
            />
            Styling form
            {!stylingAvailable ? (
              <span className="text-muted-foreground ml-auto text-[10px]">
                N/A
              </span>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!measurementAvailable}
            onClick={() => {
              if (!measurementAvailable) return
              run("measurementView")
            }}
          >
            <EyeIcon className="size-4" />
            Measurement view
            {!measurementAvailable ? (
              <span className="text-muted-foreground ml-auto text-[10px]">
                N/A
              </span>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!measurementAvailable}
            onClick={() => {
              if (!measurementAvailable) return
              run("measurementEdit")
            }}
          >
            <RulerIcon className="size-4" />
            Measurement edit
            {!measurementAvailable ? (
              <span className="text-muted-foreground ml-auto text-[10px]">
                N/A
              </span>
            ) : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>QC &amp; trial</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={!qcAvailable}
            onClick={() => {
              if (!qcAvailable) return
              run("qcView")
            }}
          >
            <EyeIcon className="size-4" />
            QC view
            {!qcAvailable ? (
              <span className="text-muted-foreground ml-auto text-[10px]">
                N/A
              </span>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!qcAvailable}
            onClick={() => {
              if (!qcAvailable) return
              run("qcEdit")
            }}
          >
            <ClipboardCheckIcon className="size-4" />
            QC edit
            {!qcAvailable ? (
              <span className="text-muted-foreground ml-auto text-[10px]">
                N/A
              </span>
            ) : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("trialView")}>
            <EyeIcon className="size-4" />
            Trial view
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("trialEdit")}>
            <PencilIcon className="size-4" />
            Trial edit
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Outfit</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => run("outfitEdit")}>
            <ShirtIcon className="size-4" />
            Outfit status edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("trackingHistory")}>
            <HistoryIcon className="size-4" />
            Tracking history
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Embroidery</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => run("embDesignForm")}>
            <SparklesIcon className="size-4" />
            Emb design form
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("embQc")}>
            <ClipboardCheckIcon className="size-4" />
            Emb QC
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
