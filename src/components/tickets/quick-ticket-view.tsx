"use client"

import { useEffect, type ReactNode } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_TICKET_BY_ID,
  type GetTicketByIdData,
  type GetTicketByIdVars,
  type TicketDetail,
} from "@/lib/apollo/queries/tickets"
import {
  ticketCategoryTone,
  ticketChipClass,
  ticketPriorityTone,
  ticketStatusTone,
} from "@/lib/tickets/ticket-chip-styles"
import { cn } from "@/lib/utils"

function formatDateTime(value?: string | null) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function Chip({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  )
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm">{value ?? "—"}</div>
    </div>
  )
}

type QuickTicketViewProps = {
  open: boolean
  ticketId: string | null
  onOpenChange: (open: boolean) => void
  onEdit?: (ticket: TicketDetail) => void
}

export function QuickTicketView({
  open,
  ticketId,
  onOpenChange,
  onEdit,
}: QuickTicketViewProps) {
  const [fetchTicket, { data, loading, error }] = useLazyQuery<
    GetTicketByIdData,
    GetTicketByIdVars
  >(GET_TICKET_BY_ID, {
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (open && ticketId) {
      void fetchTicket({ variables: { ticketId } })
    }
  }, [open, ticketId, fetchTicket])

  const ticket = data?.getTicketById

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Ticket details</SheetTitle>
          <SheetDescription>
            {ticket?.ticketId
              ? `${ticket.ticketId}${ticket.ticketNumber != null ? ` · #${ticket.ticketNumber}` : ""}`
              : "Loading ticket…"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : null}

          {error && !loading ? (
            <p className="text-destructive text-sm" role="alert">
              Failed to load ticket. {error.message}
            </p>
          ) : null}

          {ticket && !loading ? (
            <>
              <div
                className={cn(
                  "rounded-lg p-4 text-white",
                  ticket.priority === "Critical"
                    ? "bg-red-700"
                    : ticket.priority === "High"
                      ? "bg-orange-700"
                      : ticket.priority === "Medium"
                        ? "bg-amber-600"
                        : "bg-emerald-700"
                )}
              >
                <p className="font-mono text-xl font-bold tracking-wide">
                  {ticket.ticketId}
                </p>
                <p className="mt-1 text-sm opacity-90">{ticket.title}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip
                  label={ticket.status || "—"}
                  className={ticketChipClass(ticketStatusTone(ticket.status))}
                />
                <Chip
                  label={ticket.priority || "—"}
                  className={ticketChipClass(
                    ticketPriorityTone(ticket.priority)
                  )}
                />
                <Chip
                  label={ticket.category || "—"}
                  className={ticketChipClass(
                    ticketCategoryTone(ticket.category)
                  )}
                />
              </div>

              <Detail label="Description" value={ticket.description || "—"} />

              <div className="grid grid-cols-2 gap-3">
                <Detail label="Type" value={ticket.ticketType || "—"} />
                <Detail
                  label="Assigned to"
                  value={ticket.assignedTo?.name || "Unassigned"}
                />
                <Detail
                  label="Created"
                  value={formatDateTime(ticket.createdAt)}
                />
                <Detail
                  label="Due date"
                  value={formatDateTime(ticket.dueDate)}
                />
              </div>
            </>
          ) : null}
        </div>

        <SheetFooter className="gap-2 sm:flex-row">
          {ticket && onEdit ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(ticket)}
            >
              <PencilIcon className="size-4" />
              Edit
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
