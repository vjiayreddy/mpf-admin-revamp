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
import {
  TICKET_CATEGORY_FORM_OPTIONS,
  TICKET_PRIORITY_FORM_OPTIONS,
  TICKET_TYPE_FORM_OPTIONS,
} from "@/config/ticket-filters"
import {
  CREATE_TICKET,
  UPDATE_TICKET_TECH_FIELDS,
  type CreateTicketData,
  type CreateTicketVars,
  type UpdateTicketTechFieldsData,
  type UpdateTicketTechFieldsVars,
} from "@/lib/apollo/queries/tickets"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  ticketType: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

type CreateTicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTicketDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [createTicket, { loading, error: mutationError, reset: resetMutation }] =
    useMutation<CreateTicketData, CreateTicketVars>(CREATE_TICKET)

  const [updateTechFields, { loading: updatingDueDate }] = useMutation<
    UpdateTicketTechFieldsData,
    UpdateTicketTechFieldsVars
  >(UPDATE_TICKET_TECH_FIELDS)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: "",
      description: "",
      ticketType: "",
      category: "",
      priority: "",
      dueDate: "",
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: "",
      description: "",
      ticketType: "",
      category: "",
      priority: "",
      dueDate: "",
    })
    setSubmitError(null)
    resetMutation()
  }, [open, reset, resetMutation])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      // CreateTicketInput has no dueDate — set it via updateTicketTechFields after create.
      const result = await createTicket({
        variables: {
          input: {
            title: values.title.trim(),
            description: values.description.trim(),
            ticketType: values.ticketType,
            category: values.category,
            priority: values.priority,
          },
        },
      })
      const createdId = result.data?.createTicket?._id
      if (!createdId) {
        const msg = "Ticket was created but no id was returned."
        setSubmitError(msg)
        notify.error(msg)
        return
      }

      if (values.dueDate) {
        await updateTechFields({
          variables: {
            ticketId: createdId,
            input: {
              dueDate: new Date(`${values.dueDate}T00:00:00`).toISOString(),
            },
          },
        })
      }

      notify.success("Ticket created")
      onCreated?.()
      onOpenChange(false)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create ticket"
      setSubmitError(msg)
      notify.fromError(err, "Failed to create ticket")
    }
  })

  const busy = loading || updatingDueDate || isSubmitting
  const displayError = submitError || mutationError?.message || null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create ticket</SheetTitle>
          <SheetDescription>
            File a new issue or feature request.
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
            <Label htmlFor="ticket-title">Title</Label>
            <Input id="ticket-title" disabled={busy} {...register("title")} />
            {errors.title ? (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              rows={4}
              disabled={busy}
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-destructive text-xs">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-type">Type</Label>
              <Controller
                control={control}
                name="ticketType"
                render={({ field }) => (
                  <select
                    id="ticket-type"
                    className={selectClass}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={busy}
                  >
                    <option value="">Select</option>
                    {TICKET_TYPE_FORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.ticketType ? (
                <p className="text-destructive text-xs">
                  {errors.ticketType.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-category">Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <select
                    id="ticket-category"
                    className={selectClass}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={busy}
                  >
                    <option value="">Select</option>
                    {TICKET_CATEGORY_FORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.category ? (
                <p className="text-destructive text-xs">
                  {errors.category.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <select
                    id="ticket-priority"
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
              <Label htmlFor="ticket-due">Due date</Label>
              <Input
                id="ticket-due"
                type="date"
                disabled={busy}
                {...register("dueDate")}
              />
            </div>
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
              {busy ? "Creating…" : "Create"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
