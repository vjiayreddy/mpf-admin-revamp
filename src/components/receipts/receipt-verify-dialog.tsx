"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"

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
  PAYMENT_MODE_OPTIONS,
  RECEIPT_VERIFICATION_OPTIONS,
} from "@/config/receipt-filters"
import {
  VERIFY_STORE_ORDER_PAYMENT,
  type ReceiptListRow,
  type VerifyStoreOrderPaymentData,
  type VerifyStoreOrderPaymentVars,
} from "@/lib/apollo/queries/receipts"
import { isoToDateInput } from "@/lib/customers/date-filter"
import { paymentDateInputToMpfFilter } from "@/lib/receipts/format"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type FormValues = {
  date: string
  amount: string
  modeOfPayment: string
  accountRemark: string
}

type ReceiptVerifyDialogProps = {
  open: boolean
  payment: ReceiptListRow | null
  onOpenChange: (open: boolean) => void
  onUpdated?: (patch: Partial<ReceiptListRow>) => void
}

export function ReceiptVerifyDialog({
  open,
  payment,
  onOpenChange,
  onUpdated,
}: ReceiptVerifyDialogProps) {
  const [verificationStatus, setVerificationStatus] = useState("Not verified")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [verifyPayment, { loading }] = useMutation<
    VerifyStoreOrderPaymentData,
    VerifyStoreOrderPaymentVars
  >(VERIFY_STORE_ORDER_PAYMENT)

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      date: "",
      amount: "",
      modeOfPayment: "",
      accountRemark: "",
    },
  })

  useEffect(() => {
    if (!open || !payment) return
    setVerificationStatus(payment.isVerified ? "Verified" : "Not verified")
    setSubmitError(null)
    reset({
      date: isoToDateInput(payment.paymentDate?.timestamp ?? null),
      amount:
        payment.paymentAmount != null ? String(payment.paymentAmount) : "",
      modeOfPayment: payment.paymentMode ?? "",
      accountRemark: payment.paymentAccountRemark ?? "",
    })
  }, [open, payment, reset])

  const alreadyVerified = payment?.isVerified === true
  const canSubmit =
    verificationStatus === "Verified" && !alreadyVerified && !!payment

  const onSubmit = handleSubmit(async (values) => {
    if (!payment?.orderId || !payment.paymentId) {
      const msg = "Missing order or payment id."
      setSubmitError(msg)
      notify.error(msg)
      return
    }
    if (!canSubmit) return

    setSubmitError(null)
    const datePayload = paymentDateInputToMpfFilter(values.date)

    try {
      await verifyPayment({
        variables: {
          body: {
            orderId: payment.orderId,
            paymentId: payment.paymentId,
            ...(values.modeOfPayment
              ? { modeOfPayment: values.modeOfPayment }
              : {}),
            ...(values.accountRemark.trim()
              ? { accountRemark: values.accountRemark.trim() }
              : {}),
            ...(datePayload ? { date: datePayload } : {}),
            ...(values.amount !== ""
              ? { amount: Number(values.amount) }
              : {}),
          },
        },
      })

      onUpdated?.({
        isVerified: true,
        paymentMode: values.modeOfPayment || payment.paymentMode,
        paymentAccountRemark:
          values.accountRemark.trim() || payment.paymentAccountRemark,
        paymentAmount:
          values.amount !== ""
            ? Number(values.amount)
            : payment.paymentAmount,
        ...(datePayload
          ? { paymentDate: { timestamp: datePayload.timestamp } }
          : {}),
      })
      onOpenChange(false)
      notify.success("Payment verified")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to verify payment."
      setSubmitError(msg)
      notify.fromError(err, "Failed to verify payment.")
    }
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Payment details</SheetTitle>
          <SheetDescription>
            Review and verify this store-order payment.
            {payment?.orderNo ? ` · Order ${payment.orderNo}` : null}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verificationStatus">
              Verification by accounts team
            </Label>
            <select
              id="verificationStatus"
              className={selectClass}
              value={verificationStatus}
              disabled={loading || alreadyVerified}
              onChange={(e) => setVerificationStatus(e.target.value)}
            >
              {RECEIPT_VERIFICATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {alreadyVerified ? (
              <p className="text-muted-foreground text-xs">
                This payment is already verified.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              disabled={loading || alreadyVerified}
              {...register("date")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              disabled={loading || alreadyVerified}
              {...register("amount")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="modeOfPayment">Payment type</Label>
            <select
              id="modeOfPayment"
              className={selectClass}
              disabled={loading || alreadyVerified}
              {...register("modeOfPayment")}
            >
              <option value="">Select mode</option>
              {PAYMENT_MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="accountRemark">Account team remarks</Label>
            <Textarea
              id="accountRemark"
              rows={4}
              disabled={loading || alreadyVerified}
              {...register("accountRemark")}
            />
          </div>

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>

        <SheetFooter className="gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {canSubmit ? (
            <Button type="button" disabled={loading} onClick={onSubmit}>
              {loading ? "Submitting…" : "Submit"}
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
