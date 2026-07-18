"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

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
import { Textarea } from "@/components/ui/textarea"
import { APPOINTMENT_STATUS_OPTIONS } from "@/config/appointment-filters"
import {
  extractDateFormat,
  isoToDateInput,
} from "@/lib/appointments/date-payload"
import {
  UPDATE_APPOINTMENT_STATUS,
  type AppointmentListRow,
  type UpdateAppointmentStatusData,
  type UpdateAppointmentStatusVars,
} from "@/lib/apollo/queries/appointments"
import { cn } from "@/lib/utils"

const statusSchema = z
  .object({
    status: z.string().min(1, "Status is required"),
    reason: z.string().min(1, "Reason is required"),
    dateRecorded: z.string().optional(),
    orderValue: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.status === "follow_up" && !values.dateRecorded) {
      ctx.addIssue({
        code: "custom",
        path: ["dateRecorded"],
        message: "Follow-up date is required",
      })
    }
    if (values.status === "ordered") {
      const n = Number(values.orderValue)
      if (!values.orderValue || Number.isNaN(n)) {
        ctx.addIssue({
          code: "custom",
          path: ["orderValue"],
          message: "Order value is required",
        })
      }
    }
  })

type StatusFormValues = z.infer<typeof statusSchema>

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

/** Map API display/enum strings to select option values. */
function normalizeStatusValue(raw?: string | null): string {
  if (!raw) return ""
  const trimmed = raw.trim()
  const byValue = APPOINTMENT_STATUS_OPTIONS.find(
    (o) => o.value === trimmed || o.value === trimmed.toLowerCase()
  )
  if (byValue) return byValue.value
  const normalized = trimmed.toLowerCase().replace(/\s+/g, "_")
  const byNormalized = APPOINTMENT_STATUS_OPTIONS.find(
    (o) => o.value === normalized
  )
  if (byNormalized) return byNormalized.value
  const byLabel = APPOINTMENT_STATUS_OPTIONS.find(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase()
  )
  return byLabel?.value ?? ""
}

function apolloErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message)
  }
  return "Failed to update status"
}

type AppointmentStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentListRow | null
  onUpdated?: (patch?: Partial<AppointmentListRow>) => void
}

export function AppointmentStatusDialog({
  open,
  onOpenChange,
  appointment,
  onUpdated,
}: AppointmentStatusDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [updateStatus, { loading, error: mutationError, reset: resetMutation }] =
    useMutation<UpdateAppointmentStatusData, UpdateAppointmentStatusVars>(
      UPDATE_APPOINTMENT_STATUS
    )

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: "",
      reason: "",
      dateRecorded: "",
      orderValue: "",
    },
  })

  const watchStatus = watch("status")

  useEffect(() => {
    if (!open || !appointment) return
    const last = appointment.status?.[appointment.status.length - 1]
    reset({
      status: normalizeStatusValue(last?.name || appointment.currentStatus),
      reason: last?.note || "",
      dateRecorded: isoToDateInput(appointment.followUpDate?.timestamp),
      orderValue:
        appointment.orderValue != null ? String(appointment.orderValue) : "",
    })
    setSubmitError(null)
    resetMutation()
  }, [open, appointment, reset, resetMutation])

  const onSubmit = handleSubmit(async (values) => {
    if (!appointment?._id) return
    setSubmitError(null)

    const variables: UpdateAppointmentStatusVars = {
      appointmentId: appointment._id,
      status: values.status,
      reason: values.reason.trim(),
    }

    if (values.status === "follow_up" && values.dateRecorded) {
      variables.date = extractDateFormat(
        new Date(`${values.dateRecorded}T00:00:00`).toISOString()
      )
    }
    if (values.status === "ordered") {
      variables.orderValue = parseFloat(values.orderValue || "0")
    }

    try {
      const result = await updateStatus({ variables })
      const updatedId = result.data?.updateAppointmentStatus?._id
      if (!updatedId) {
        setSubmitError("Status update did not return a confirmation.")
        return
      }
      onUpdated?.({
        currentStatus: values.status,
        orderValue:
          values.status === "ordered"
            ? parseFloat(values.orderValue || "0")
            : appointment.orderValue,
        status: [
          ...(appointment.status ?? []),
          {
            name: values.status,
            note: values.reason.trim(),
            dateRecorded: { timestamp: new Date().toISOString() },
          },
        ],
        ...(values.status === "follow_up" && values.dateRecorded
          ? {
              followUpDate: {
                timestamp: new Date(
                  `${values.dateRecorded}T00:00:00`
                ).toISOString(),
              },
            }
          : {}),
      })
      onOpenChange(false)
    } catch (err) {
      setSubmitError(apolloErrorMessage(err))
    }
  })

  const busy = loading || isSubmitting
  const displayError = submitError || mutationError?.message || null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Update appointment status</SheetTitle>
          <SheetDescription>
            {appointment?.appointmentId
              ? `Appointment #${appointment.appointmentId}`
              : "Change status and reason"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
        >
          {displayError ? (
            <p className="text-destructive text-sm" role="alert">
              {displayError}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appt-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <select
                  id="appt-status"
                  className={selectClass}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                >
                  <option value="">Select status</option>
                  {APPOINTMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.status ? (
              <p className="text-destructive text-xs">{errors.status.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appt-reason">Reason</Label>
            <Textarea
              id="appt-reason"
              rows={4}
              disabled={busy}
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-destructive text-xs">{errors.reason.message}</p>
            ) : null}
          </div>

          {watchStatus === "follow_up" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appt-follow-up">Follow-up date</Label>
              <Input
                id="appt-follow-up"
                type="date"
                disabled={busy}
                {...register("dateRecorded")}
              />
              {errors.dateRecorded ? (
                <p className="text-destructive text-xs">
                  {errors.dateRecorded.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {watchStatus === "ordered" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appt-order-value">Order value</Label>
              <Input
                id="appt-order-value"
                type="number"
                step="0.01"
                disabled={busy}
                {...register("orderValue")}
              />
              {errors.orderValue ? (
                <p className="text-destructive text-xs">
                  {errors.orderValue.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <SheetFooter className="mt-auto gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Submit"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
