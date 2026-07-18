"use client"

import {
  MoreHorizontalIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  MessageCircleIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AppointmentListRow } from "@/lib/apollo/queries/appointments"

function phoneDigits(row: AppointmentListRow) {
  const raw = `${row.countryCode ?? ""}${row.phone ?? ""}`.replace(/\D/g, "")
  return raw
}

type AppointmentRowActionsProps = {
  row: AppointmentListRow
  onView: () => void
  onEditStatus: () => void
  onEditAppointment: () => void
}

export function AppointmentRowActions({
  row,
  onView,
  onEditStatus,
  onEditAppointment,
}: AppointmentRowActionsProps) {
  const digits = phoneDigits(row)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Appointment actions"
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
        <DropdownMenuItem onClick={onEditStatus}>
          <RefreshCwIcon className="size-4" />
          Edit status
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEditAppointment}>
          <PencilIcon className="size-4" />
          Edit appointment
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
          disabled={!digits}
          onClick={() => {
            if (!digits) return
            window.open(
              `https://wa.me/${digits}`,
              "_blank",
              "noopener,noreferrer"
            )
          }}
        >
          <MessageCircleIcon className="size-4" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
