"use client"

import {
  BookmarkCheckIcon,
  BookmarkIcon,
  CalendarPlusIcon,
  EyeIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  RefreshCwIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBookmarks } from "@/hooks/use-bookmarks"
import type { LeadListRow } from "@/lib/apollo/queries/leads"
import { customerFullName, openWhatsApp } from "@/lib/leads/format"

function phoneDigits(row: LeadListRow) {
  return `${row.countryCode ?? ""}${row.phone ?? ""}`.replace(/\D/g, "")
}

type LeadRowActionsProps = {
  row: LeadListRow
  onView: () => void
  onStatus: () => void
  onBookAppointment: () => void
}

export function LeadRowActions({
  row,
  onView,
  onStatus,
  onBookAppointment,
}: LeadRowActionsProps) {
  const router = useRouter()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const digits = phoneDigits(row)
  const leadId = row._id?.trim() || ""
  const saved = leadId ? isBookmarked("lead", leadId) : false
  const name = customerFullName(row.firstName, row.lastName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Lead actions"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuItem onClick={onView}>
          <EyeIcon className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onStatus}>
          <RefreshCwIcon className="size-4" />
          Edit status
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/leads/form?leadId=${row._id}`)}
        >
          <PencilIcon className="size-4" />
          Edit lead
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!leadId}
          onClick={() => {
            if (!leadId) return
            void toggleBookmark({
              entityType: "lead",
              entityId: leadId,
              label:
                row.leadId != null
                  ? `Lead #${row.leadId}`
                  : `Lead ${leadId.slice(-6)}`,
              href: `/leads/form?leadId=${encodeURIComponent(leadId)}`,
              subtitle: name !== "—" ? name : null,
            })
          }}
        >
          {saved ? (
            <BookmarkCheckIcon className="size-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <BookmarkIcon className="size-4" />
          )}
          {saved ? "Remove from saved" : "Save for later"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBookAppointment}>
          <CalendarPlusIcon className="size-4" />
          Book appointment
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!digits}
          onClick={() => {
            if (!digits) return
            window.location.href = `tel://${digits}`
          }}
        >
          <PhoneIcon className="size-4" />
          Call
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!row.phone}
          onClick={() => openWhatsApp(row.countryCode, row.phone)}
        >
          <MessageCircleIcon className="size-4" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
