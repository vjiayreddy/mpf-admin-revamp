"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { AppointmentListRow } from "@/lib/apollo/queries/appointments"

function formatDate(value?: string | null) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function formatTime(value?: string | null) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <p className="text-sm">
      <span className="font-medium">{label}: </span>
      <span className="text-muted-foreground">{value ?? "N/A"}</span>
    </p>
  )
}

type QuickAppointmentViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AppointmentListRow | null
}

export function QuickAppointmentView({
  open,
  onOpenChange,
  data,
}: QuickAppointmentViewProps) {
  const lead = data?.lead?.[0]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Appointment details</SheetTitle>
          <SheetDescription>
            {data?.appointmentId
              ? `Appointment #${data.appointmentId}`
              : "Read-only appointment summary"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
          <fieldset className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Appointment</legend>
            <Detail label="Appointment Id" value={data?.appointmentId} />
            <Detail label="Appointment Type" value={data?.appointmentType} />
            <Detail
              label="Created Date"
              value={formatDate(data?.dateRecorded?.timestamp)}
            />
            <Detail
              label="Appointment Date"
              value={formatDate(data?.appointmentDate?.timestamp)}
            />
            <Detail
              label="Appointment Time"
              value={formatTime(data?.appointmentSelectedTimestamp)}
            />
            <Detail
              label="Handled By"
              value={data?.stylist?.[0]?.name ?? "N/A"}
            />
            <Detail
              label="Reason"
              value={data?.status?.[0]?.note ?? "N/A"}
            />
            <Detail
              label="Name"
              value={
                `${data?.firstName ?? ""} ${data?.lastName ?? ""}`.trim() ||
                "N/A"
              }
            />
            <Detail
              label="Phone"
              value={
                data?.phone
                  ? `+${data.countryCode ?? ""} ${data.phone}`.trim()
                  : "N/A"
              }
            />
            <Detail
              label="Status"
              value={data?.currentStatus || data?.status?.[0]?.name || "N/A"}
            />
          </fieldset>

          <fieldset className="space-y-2 rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Lead</legend>
            <Detail label="Lead Id" value={lead?.leadId} />
            <Detail label="Studio" value={data?.studio?.[0]?.name ?? "N/A"} />
            <Detail
              label="Name"
              value={
                `${lead?.firstName ?? ""} ${lead?.lastName ?? ""}`.trim() ||
                "N/A"
              }
            />
            <Detail
              label="Persona"
              value={data?.persona?.[0]?.name ?? "N/A"}
            />
            <Detail label="Source" value={data?.source?.[0]?.name ?? "N/A"} />
            <Detail
              label="Exp Closure Date"
              value={formatDate(lead?.expClosureDate?.timestamp)}
            />
            <Detail
              label="Follow Up Date"
              value={formatDate(lead?.followUpDate?.timestamp)}
            />
            <Detail
              label="Estimated Value"
              value={lead?.estimatedValue ?? "N/A"}
            />
            <Detail label="Remarks" value={lead?.remarks ?? "N/A"} />
          </fieldset>
        </div>

        <SheetFooter>
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
