"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { StylistSearchSelect } from "@/components/customers/stylist-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { APPOINTMENT_TYPE_OPTIONS } from "@/config/appointment-filters"
import { useAllStylists } from "@/hooks/use-all-stylists"
import {
  dateAndTimeToIso,
  extractAppointDateFormat,
} from "@/lib/appointments/date-payload"
import {
  SAVE_LEAD_APPOINTMENT,
  type SaveLeadAppointmentData,
  type SaveLeadAppointmentVars,
} from "@/lib/apollo/queries/appointments"
import type { LeadListRow } from "@/lib/apollo/queries/leads"
import { customerFullName } from "@/lib/leads/format"
import { cn } from "@/lib/utils"

const bookSchema = z.object({
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  appointmentType: z.string().min(1, "Type is required"),
  stylistId: z.string().min(1, "Stylist is required"),
})

type BookFormValues = z.infer<typeof bookSchema>

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

function generateAppointmentId() {
  return Number(Date.now().toString().slice(-6))
}

type BookLeadAppointmentDialogProps = {
  open: boolean
  lead: LeadListRow | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function BookLeadAppointmentDialog({
  open,
  lead,
  onOpenChange,
  onSaved,
}: BookLeadAppointmentDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState(0)
  const { stylists, loading: stylistsLoading } = useAllStylists(open)

  const [saveAppointment, { loading }] = useMutation<
    SaveLeadAppointmentData,
    SaveLeadAppointmentVars
  >(SAVE_LEAD_APPOINTMENT)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "",
      stylistId: "",
    },
  })

  useEffect(() => {
    if (!open || !lead) return
    setAppointmentId(generateAppointmentId())
    setSubmitError(null)
    reset({
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "",
      stylistId: "",
    })
  }, [open, lead, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!lead?._id) return
    if (!lead.userId) {
      setSubmitError("Lead is missing userId; cannot book appointment.")
      return
    }
    setSubmitError(null)

    const timestamp = dateAndTimeToIso(
      values.appointmentDate,
      values.appointmentTime
    )

    try {
      const result = await saveAppointment({
        variables: {
          body: {
            appointmentId: appointmentId || generateAppointmentId(),
            userId: lead.userId,
            leadId: lead._id,
            appointmentDate: extractAppointDateFormat(timestamp, timestamp),
            appointmentType: values.appointmentType,
            appointmentSelectedTimestamp: timestamp,
            stylistIds: [values.stylistId],
          },
        },
      })
      if (!result.data?.saveLeadAppointment?._id) {
        setSubmitError("Appointment save did not return a confirmation.")
        return
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to book appointment"
      )
    }
  })

  const leadLabel = lead
    ? customerFullName(lead.firstName, lead.lastName)
    : "—"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Book appointment</SheetTitle>
          <SheetDescription>
            {lead?.leadId != null
              ? `Lead #${lead.leadId} · ${leadLabel}`
              : "Schedule an appointment for this lead"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
        >
          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="book-appt-id">Appointment ID</Label>
            <Input
              id="book-appt-id"
              value={appointmentId || ""}
              readOnly
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-appt-date">Date</Label>
              <Input
                id="book-appt-date"
                type="date"
                disabled={loading}
                {...register("appointmentDate")}
              />
              {errors.appointmentDate ? (
                <p className="text-destructive text-xs">
                  {errors.appointmentDate.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-appt-time">Time</Label>
              <Input
                id="book-appt-time"
                type="time"
                disabled={loading}
                {...register("appointmentTime")}
              />
              {errors.appointmentTime ? (
                <p className="text-destructive text-xs">
                  {errors.appointmentTime.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="book-appt-type">Type</Label>
            <Controller
              control={control}
              name="appointmentType"
              render={({ field }) => (
                <select
                  id="book-appt-type"
                  className={selectClass}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                >
                  <option value="">Select type</option>
                  {APPOINTMENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.appointmentType ? (
              <p className="text-destructive text-xs">
                {errors.appointmentType.message}
              </p>
            ) : null}
          </div>

          <Controller
            control={control}
            name="stylistId"
            render={({ field }) => (
              <StylistSearchSelect
                label="Stylist"
                stylists={stylists}
                value={field.value}
                onChange={field.onChange}
                loading={stylistsLoading}
                disabled={loading}
              />
            )}
          />
          {errors.stylistId ? (
            <p className="text-destructive text-xs">
              {errors.stylistId.message}
            </p>
          ) : null}

          <SheetFooter className="mt-auto gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Book"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
