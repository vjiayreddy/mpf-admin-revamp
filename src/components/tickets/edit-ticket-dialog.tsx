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
import { TICKET_PRIORITY_FORM_OPTIONS } from "@/config/ticket-filters"
import { isoToDateInput } from "@/lib/customers/date-filter"
import {
  UPDATE_TICKET_TECH_FIELDS,
  type TicketDetail,
  type TicketListRow,
  type UpdateTicketTechFieldsData,
  type UpdateTicketTechFieldsVars,
} from "@/lib/apollo/queries/tickets"
import { cn } from "@/lib/utils"

const editSchema = z.object({
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type EditTicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: TicketDetail | TicketListRow | null
  onUpdated?: (patch: Partial<TicketListRow>) => void
}

export function EditTicketDialog({
  open,
  onOpenChange,
  ticket,
  onUpdated,
}: EditTicketDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [updateTicket, { loading, error: mutationError, reset: resetMutation }] =
    useMutation<UpdateTicketTechFieldsData, UpdateTicketTechFieldsVars>(
      UPDATE_TICKET_TECH_FIELDS
    )

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { priority: "", dueDate: "" },
  })

  useEffect(() => {
    if (!open || !ticket) return
    reset({
      priority: ticket.priority ?? "",
      dueDate: isoToDateInput(ticket.dueDate ?? null),
    })
    setSubmitError(null)
    resetMutation()
  }, [open, ticket, reset, resetMutation])

  const onSubmit = handleSubmit(async (values) => {
    if (!ticket?._id) return
    setSubmitError(null)

    const dueDateIso = values.dueDate
      ? new Date(`${values.dueDate}T00:00:00`).toISOString()
      : null

    try {
      const result = await updateTicket({
        variables: {
          ticketId: ticket._id,
          input: {
            priority: values.priority,
            dueDate: dueDateIso,
          },
        },
      })
      if (!result.data?.updateTicketTechFields?._id) {
        setSubmitError("Update did not return a confirmation.")
        return
      }
      onUpdated?.({
        priority: values.priority,
        dueDate: dueDateIso,
      })
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update ticket"
      )
    }
  })

  const busy = loading || isSubmitting
  const displayError = submitError || mutationError?.message || null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit ticket</SheetTitle>
          <SheetDescription>
            Update priority and due date
            {ticket?.ticketId ? ` for ${ticket.ticketId}` : ""}.
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

          <div className="bg-muted/40 space-y-1 rounded-lg border p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Title: </span>
              {ticket?.title || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Category: </span>
              {ticket?.category || "—"}
            </p>
            <p className="text-muted-foreground text-xs">
              Title, description, type, and category cannot be changed here.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-priority">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <select
                  id="edit-priority"
                  className={selectClass}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                >
                  <option value="">Select</option>
                  {TICKET_PRIORITY_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.priority ? (
              <p className="text-destructive text-xs">
                {errors.priority.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-due">Due date</Label>
            <Input
              id="edit-due"
              type="date"
              disabled={busy}
              {...register("dueDate")}
            />
          </div>

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
              {busy ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
