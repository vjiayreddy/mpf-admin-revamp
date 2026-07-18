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
  isoToDateInput,
  isoToTimeInput,
} from "@/lib/appointments/date-payload"
import {
  SAVE_LEAD_APPOINTMENT,
  type AppointmentListRow,
  type SaveLeadAppointmentData,
  type SaveLeadAppointmentVars,
} from "@/lib/apollo/queries/appointments"
import { cn } from "@/lib/utils"

const editSchema = z.object({
  appointmentId: z.string().min(1),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  appointmentType: z.string().min(1, "Type is required"),
  stylistId: z.string().min(1, "Stylist is required"),
})

type EditFormValues = z.infer<typeof editSchema>

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

/** Only send address when all GraphQL-required String! fields are present. */
function buildCompleteAddressPayload(appointment: AppointmentListRow) {
  const a = appointment.address
  if (!a) return undefined

  const firstName = a.firstName?.trim()
  const lastName = a.lastName?.trim()
  const email = a.email?.trim()
  const phone = a.phone?.trim()
  const countryCode = a.countryCode?.trim()
  const postalCode = a.postalCode?.trim()
  const address1 = a.address1?.trim()
  const country = a.country?.trim()
  const state = a.state?.trim()
  const city = a.city?.trim()
  const landmark = (a.landmark ?? "").trim()

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !countryCode ||
    !postalCode ||
    !address1 ||
    !country ||
    !state ||
    !city
  ) {
    return undefined
  }

  return {
    firstName,
    lastName,
    email,
    phone,
    countryCode,
    postalCode,
    address1,
    landmark,
    country,
    state,
    city,
    ...(a.address2 ? { address2: a.address2 } : {}),
    userId: appointment.userId || "",
  }
}

type AppointmentEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: AppointmentListRow | null
  onUpdated?: (patch?: Partial<AppointmentListRow>) => void
}

export function AppointmentEditDialog({
  open,
  onOpenChange,
  appointment,
  onUpdated,
}: AppointmentEditDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
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
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      appointmentId: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "",
      stylistId: "",
    },
  })

  useEffect(() => {
    if (!open || !appointment) return
    reset({
      appointmentId: String(appointment.appointmentId ?? ""),
      appointmentDate: isoToDateInput(appointment.appointmentDate?.timestamp),
      appointmentTime: isoToTimeInput(
        appointment.appointmentSelectedTimestamp
      ),
      appointmentType: appointment.appointmentType ?? "",
      stylistId:
        appointment.stylist?.[0]?._id ||
        appointment.stylistIds?.[0] ||
        "",
    })
    setSubmitError(null)
  }, [open, appointment, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!appointment?._id) return
    setSubmitError(null)

    const dateIso = dateAndTimeToIso(
      values.appointmentDate,
      values.appointmentTime
    )
    const timeIso = dateIso

    // GraphQL LeadAppointmentInput.address requires many String! fields —
    // only include address when the row already has a complete payload.
    const address = buildCompleteAddressPayload(appointment)

    try {
      const result = await saveAppointment({
        variables: {
          body: {
            _id: appointment._id,
            appointmentId: Number(values.appointmentId),
            userId: appointment.userId,
            leadId: appointment.leadId,
            appointmentDate: extractAppointDateFormat(dateIso, timeIso),
            appointmentType: values.appointmentType,
            appointmentSelectedTimestamp: timeIso,
            stylistIds: [values.stylistId],
            ...(address ? { address } : {}),
          },
        },
      })
      if (!result.data?.saveLeadAppointment?._id) {
        setSubmitError("Appointment update did not return a confirmation.")
        return
      }

      const stylist = stylists.find((s) => s._id === values.stylistId)
      onUpdated?.({
        appointmentType: values.appointmentType,
        appointmentSelectedTimestamp: timeIso,
        appointmentDate: {
          ...appointment.appointmentDate,
          timestamp: dateIso,
        },
        stylistIds: [values.stylistId],
        stylist: stylist
          ? [{ _id: stylist._id, name: stylist.name }]
          : appointment.stylist,
      })
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update appointment"
      )
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit appointment</SheetTitle>
          <SheetDescription>
            Update date, time, type, and stylist.
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
            <Label htmlFor="edit-appt-id">Appointment ID</Label>
            <Input
              id="edit-appt-id"
              readOnly
              disabled
              {...register("appointmentId")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-appt-date">Date</Label>
              <Input
                id="edit-appt-date"
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
              <Label htmlFor="edit-appt-time">Time</Label>
              <Input
                id="edit-appt-time"
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
            <Label htmlFor="edit-appt-type">Type</Label>
            <Controller
              control={control}
              name="appointmentType"
              render={({ field }) => (
                <select
                  id="edit-appt-type"
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
              {loading ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
