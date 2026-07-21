"use client"

import {
  EyeIcon,
  FilePenIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  PhoneIcon,
  RulerIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CustomerListRow } from "@/lib/apollo/queries/users"
import { notify } from "@/lib/notify"

function phoneDigits(row: CustomerListRow) {
  return `${row.countryCode ?? ""}${row.phone ?? ""}`.replace(/\D/g, "")
}

function openWhatsApp(row: CustomerListRow) {
  const digits = phoneDigits(row)
  if (!digits) {
    notify.warning("Phone number is missing")
    return
  }
  window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer")
}

function callPhone(row: CustomerListRow) {
  const digits = phoneDigits(row)
  if (!digits) {
    notify.warning("Phone number is missing")
    return
  }
  window.location.href = `tel:+${digits}`
}

export type CustomersRowActionsProps = {
  row: CustomerListRow
  onViewDetails: (userId: string) => void
}

export function CustomersRowActions({
  row,
  onViewDetails,
}: CustomersRowActionsProps) {
  const router = useRouter()
  const userId = row._id?.trim() || ""
  const hasPhone = Boolean(phoneDigits(row))

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
        <MoreVerticalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          disabled={!userId}
          onClick={() => {
            if (userId) onViewDetails(userId)
          }}
        >
          <EyeIcon className="size-3.5" />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!userId}
          onClick={() => {
            if (userId) router.push(`/customers/${userId}`)
          }}
        >
          <FilePenIcon className="size-3.5" />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!userId}
          onClick={() => {
            if (userId) router.push(`/customers/${userId}/measurements`)
          }}
        >
          <RulerIcon className="size-3.5" />
          View measurements
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!hasPhone}
          onClick={() => callPhone(row)}
        >
          <PhoneIcon className="size-3.5" />
          Phone call
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!hasPhone}
          onClick={() => openWhatsApp(row)}
        >
          <MessageCircleIcon className="size-3.5" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
