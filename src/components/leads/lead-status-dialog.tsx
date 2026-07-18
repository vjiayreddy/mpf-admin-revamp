"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Link2OffIcon } from "lucide-react"

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
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_REQUIRES_DATE,
} from "@/config/lead-filters"
import { extractDateFormat } from "@/lib/appointments/date-payload"
import {
  ISSUE_UNLINK_LEAD_OTP,
  LINK_LEAD_TO_ORDER,
  UNLINK_LEAD_FROM_ORDER,
  UPDATE_LEAD_STATUS,
  type IssueUnlinkLeadOtpData,
  type IssueUnlinkLeadOtpVars,
  type LeadLinkedOrder,
  type LeadListRow,
  type LinkLeadToOrderData,
  type LinkLeadToOrderVars,
  type UnlinkLeadFromOrderData,
  type UnlinkLeadFromOrderVars,
  type UpdateLeadStatusData,
  type UpdateLeadStatusVars,
} from "@/lib/apollo/queries/leads"
import { latestStatus } from "@/lib/leads/format"
import { cn } from "@/lib/utils"

const statusSchema = z
  .object({
    status: z.string().min(1, "Status is required"),
    reason: z.string().min(1, "Reason is required"),
    dateRecorded: z.string().optional(),
    orderId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      LEAD_STATUS_REQUIRES_DATE.has(values.status) &&
      !values.dateRecorded?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dateRecorded"],
        message: "Date is required for this status",
      })
    }
    if (values.status === "order_closed" && !values.orderId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["orderId"],
        message: "Order id is required when closing as order",
      })
    }
  })

type StatusFormValues = z.infer<typeof statusSchema>

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type LeadStatusDialogProps = {
  open: boolean
  lead: LeadListRow | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function LeadStatusDialog({
  open,
  lead,
  onOpenChange,
  onSaved,
}: LeadStatusDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [linkedOrders, setLinkedOrders] = useState<LeadLinkedOrder[]>([])
  const [unlinkingOrderId, setUnlinkingOrderId] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [unlinkError, setUnlinkError] = useState<string | null>(null)

  const [updateStatus, { loading: updating }] = useMutation<
    UpdateLeadStatusData,
    UpdateLeadStatusVars
  >(UPDATE_LEAD_STATUS)

  const [linkLead, { loading: linking }] = useMutation<
    LinkLeadToOrderData,
    LinkLeadToOrderVars
  >(LINK_LEAD_TO_ORDER)

  const [issueOtp, { loading: issuingOtp }] = useMutation<
    IssueUnlinkLeadOtpData,
    IssueUnlinkLeadOtpVars
  >(ISSUE_UNLINK_LEAD_OTP)

  const [unlinkLead, { loading: unlinking }] = useMutation<
    UnlinkLeadFromOrderData,
    UnlinkLeadFromOrderVars
  >(UNLINK_LEAD_FROM_ORDER)

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
      orderId: "",
    },
  })

  const watchStatus = watch("status")
  const watchReason = watch("reason")
  const hasLinkedOrders = linkedOrders.length > 0
  const busy = updating || linking || isSubmitting

  useEffect(() => {
    if (!open || !lead) return
    const last = latestStatus(lead.status)
    reset({
      status: last?.name || "",
      reason: last?.note || "",
      dateRecorded: "",
      orderId: "",
    })
    setLinkedOrders(
      (lead.linkedOrders ?? []).filter((o) => Boolean(o?.orderId))
    )
    setUnlinkingOrderId(null)
    setOtp("")
    setUnlinkError(null)
    setSubmitError(null)
  }, [open, lead, reset])

  const handleIssueOtp = async (orderId: string) => {
    if (!lead?._id || !lead.userId) {
      setUnlinkError("Lead is missing _id or userId.")
      return
    }
    setUnlinkError(null)
    setOtp("")
    try {
      await issueOtp({
        variables: {
          input: {
            leadId: lead._id,
            orderId,
            userId: lead.userId,
            note: watchReason || undefined,
          },
        },
      })
      setUnlinkingOrderId(orderId)
    } catch (err) {
      setUnlinkError(
        err instanceof Error ? err.message : "Failed to send unlink OTP"
      )
    }
  }

  const handleConfirmUnlink = async () => {
    if (!lead?._id || !lead.userId || !unlinkingOrderId || !otp.trim()) {
      setUnlinkError("OTP is required.")
      return
    }
    setUnlinkError(null)
    try {
      await unlinkLead({
        variables: {
          input: {
            leadId: lead._id,
            orderId: unlinkingOrderId,
            userId: lead.userId,
            otp: otp.trim(),
          },
        },
      })
      setLinkedOrders((prev) =>
        prev.filter((o) => o.orderId !== unlinkingOrderId)
      )
      setUnlinkingOrderId(null)
      setOtp("")
    } catch (err) {
      setUnlinkError(
        err instanceof Error ? err.message : "Failed to unlink order"
      )
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!lead?._id) return
    if (hasLinkedOrders) {
      setSubmitError("Unlink all linked orders before updating status.")
      return
    }
    setSubmitError(null)

    const variables: UpdateLeadStatusVars = {
      leadId: lead._id,
      status: values.status,
      reason: values.reason.trim(),
      date: null,
    }

    if (
      LEAD_STATUS_REQUIRES_DATE.has(values.status) &&
      values.dateRecorded
    ) {
      variables.date = extractDateFormat(
        new Date(`${values.dateRecorded}T00:00:00`).toISOString()
      )
    }

    try {
      await updateStatus({ variables })

      if (values.status === "order_closed" && values.orderId?.trim()) {
        if (!lead.userId) {
          setSubmitError("Lead is missing userId; cannot link order.")
          return
        }
        await linkLead({
          variables: {
            input: {
              leadId: lead._id,
              orderIds: [values.orderId.trim()],
              userId: lead.userId,
              note: values.reason.trim(),
            },
          },
        })
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to update lead status"
      )
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Update lead status</SheetTitle>
          <SheetDescription>
            {lead?.leadId != null
              ? `Lead #${lead.leadId}`
              : "Change status and reason"}
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

          {hasLinkedOrders ? (
            <p className="text-muted-foreground text-xs">
              Unlink all linked orders before saving a new status.
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <select
                  id="lead-status"
                  className={selectClass}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy || hasLinkedOrders}
                >
                  <option value="">Select status</option>
                  {LEAD_STATUS_OPTIONS.map((opt) => (
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
            <Label htmlFor="lead-reason">Reason</Label>
            <Textarea
              id="lead-reason"
              rows={4}
              disabled={busy}
              {...register("reason")}
            />
            {errors.reason ? (
              <p className="text-destructive text-xs">{errors.reason.message}</p>
            ) : null}
          </div>

          {LEAD_STATUS_REQUIRES_DATE.has(watchStatus) ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-status-date">Status date</Label>
              <Input
                id="lead-status-date"
                type="date"
                disabled={busy || hasLinkedOrders}
                {...register("dateRecorded")}
              />
              {errors.dateRecorded ? (
                <p className="text-destructive text-xs">
                  {errors.dateRecorded.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {watchStatus === "order_closed" && !hasLinkedOrders ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-order-id">Order id</Label>
              <Input
                id="lead-order-id"
                placeholder="Order Mongo id"
                disabled={busy}
                {...register("orderId")}
              />
              {errors.orderId ? (
                <p className="text-destructive text-xs">
                  {errors.orderId.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {hasLinkedOrders ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">
                Linked orders ({linkedOrders.length})
              </p>
              <ul className="space-y-2">
                {linkedOrders.map((order) => {
                  const orderId = order.orderId!
                  const isActive = unlinkingOrderId === orderId
                  return (
                    <li
                      key={orderId}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          #{order.orderSerialNo || orderId}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busy || issuingOtp || unlinking}
                          onClick={() => void handleIssueOtp(orderId)}
                        >
                          <Link2OffIcon className="size-3.5" />
                          {issuingOtp && isActive ? "Sending…" : "Unlink"}
                        </Button>
                      </div>
                      {isActive ? (
                        <div className="mt-3 flex flex-col gap-2">
                          <Label htmlFor={`unlink-otp-${orderId}`}>OTP</Label>
                          <Input
                            id={`unlink-otp-${orderId}`}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            disabled={unlinking}
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={unlinking || !otp.trim()}
                            onClick={() => void handleConfirmUnlink()}
                          >
                            {unlinking ? "Verifying…" : "Confirm unlink"}
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
              {unlinkError ? (
                <p className="text-destructive text-xs" role="alert">
                  {unlinkError}
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
            <Button type="submit" disabled={busy || hasLinkedOrders}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
