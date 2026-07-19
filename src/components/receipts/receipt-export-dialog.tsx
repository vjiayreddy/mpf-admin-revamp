"use client"

import { useEffect, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useForm } from "react-hook-form"
import * as XLSX from "xlsx"

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
import { RECEIPT_FILTER_PARAMS } from "@/config/receipt-filters"
import { authClient } from "@/lib/auth-client"
import {
  GET_STORE_ORDER_PAYMENTS,
  INITIATE_USER_EXPORT_OTP,
  RECEIPTS_EXPORT_LIMIT,
  VERIFY_USER_EXPORT_OTP,
  type GetStoreOrderPaymentsData,
  type GetStoreOrderPaymentsVars,
  type InitiateUserExportOtpData,
  type InitiateUserExportOtpVars,
  type VerifyUserExportOtpData,
  type VerifyUserExportOtpVars,
} from "@/lib/apollo/queries/receipts"
import { buildReceiptsQueryVars } from "@/lib/receipts/build-receipts-filter"
import { formatReceiptDate } from "@/lib/receipts/format"
import { notify } from "@/lib/notify"

type ExportStep = "reason" | "otp" | "download"

type ReceiptExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
}

export function ReceiptExportDialog({
  open,
  onOpenChange,
  searchParams,
}: ReceiptExportDialogProps) {
  const { data: session } = authClient.useSession()
  const [step, setStep] = useState<ExportStep>("reason")
  const [error, setError] = useState<string | null>(null)
  const [downloadHistoryId, setDownloadHistoryId] = useState<string | null>(
    null
  )

  const { register, handleSubmit, reset } = useForm<{
    reason: string
    otp: string
  }>({
    defaultValues: { reason: "", otp: "" },
  })

  const [initiateOtp, { loading: initiating }] = useMutation<
    InitiateUserExportOtpData,
    InitiateUserExportOtpVars
  >(INITIATE_USER_EXPORT_OTP)

  const [verifyOtp, { loading: verifying }] = useMutation<
    VerifyUserExportOtpData,
    VerifyUserExportOtpVars
  >(VERIFY_USER_EXPORT_OTP)

  const [fetchPayments, { loading: exporting }] = useLazyQuery<
    GetStoreOrderPaymentsData,
    GetStoreOrderPaymentsVars
  >(GET_STORE_ORDER_PAYMENTS, {
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (!open) return
    setStep("reason")
    setError(null)
    setDownloadHistoryId(null)
    reset({ reason: "", otp: "" })
  }, [open, reset])

  const hasDateRange =
    Boolean(searchParams.get(RECEIPT_FILTER_PARAMS.paymentStartDate)) &&
    Boolean(searchParams.get(RECEIPT_FILTER_PARAMS.paymentEndDate))

  const runExport = async () => {
    setError(null)
    try {
      const result = await fetchPayments({
        variables: buildReceiptsQueryVars(
          searchParams,
          0,
          RECEIPTS_EXPORT_LIMIT
        ),
      })
      const payments = result.data?.getStoreOrderPayments?.payments ?? []
      if (payments.length === 0) {
        const msg = "No payments found for the selected filters."
        setError(msg)
        notify.warning(msg)
        return
      }

      const rows = payments.map((payload) => ({
        paymentDate: formatReceiptDate(payload.paymentDate?.timestamp),
        isVerified: payload.isVerified === true ? "Verified" : "Not Verified",
        customerId: payload.customerId ?? "",
        firstName: payload.customerFirstName ?? "",
        lastName: payload.customerLastName ?? "",
        stylist: payload.stylistName ?? "",
        orderDate: formatReceiptDate(payload.orderDate?.timestamp),
        netAmount: payload.netAmount ?? "",
        payment: payload.paymentAmount ?? "",
        modeOfPayment: payload.paymentMode ?? "",
      }))

      const date = new Date()
      const fileName = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-exported-payment-data.xlsx`
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, fileName)
      notify.success("Receipts exported")
      onOpenChange(false)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to export payments. Try again."
      setError(msg)
      notify.fromError(err, "Failed to export payments. Try again.")
    }
  }

  const onSendOtp = handleSubmit(async ({ reason }) => {
    setError(null)
    const userId = session?.user?.id
    if (!userId) {
      setError("Missing user session.")
      return
    }
    if (!reason.trim()) {
      setError("Reason is required.")
      return
    }
    try {
      const result = await initiateOtp({
        variables: {
          userId,
          module: "USER",
          reason: reason.trim(),
        },
      })
      const id = result.data?.initiateUserDownloadData
      if (!id) {
        setError("Failed to initiate OTP.")
        return
      }
      setDownloadHistoryId(id)
      setStep("otp")
      notify.success("OTP sent")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send OTP."
      setError(msg)
      notify.fromError(err, "Failed to send OTP.")
    }
  })

  const onVerifyOtp = handleSubmit(async ({ otp }) => {
    setError(null)
    if (!downloadHistoryId) {
      setError("Missing download session. Request OTP again.")
      return
    }
    if (!otp.trim()) {
      setError("OTP is required.")
      return
    }
    try {
      await verifyOtp({
        variables: {
          downloadHistoryId,
          otp: otp.trim(),
        },
      })
      setStep("download")
      notify.success("OTP verified")
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "OTP verification failed."
      setError(msg)
      notify.fromError(err, "OTP verification failed.")
    }
  })

  const busy = initiating || verifying || exporting

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Export receipts</SheetTitle>
          <SheetDescription>
            OTP-gated Excel export for the current payment filters.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {!hasDateRange ? (
            <p className="text-destructive text-sm" role="alert">
              Select payment start and end dates in More filters before
              exporting.
            </p>
          ) : null}

          {step === "reason" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="export-reason">
                  Reason for exporting the data
                </Label>
                <Textarea
                  id="export-reason"
                  rows={3}
                  disabled={busy || !hasDateRange}
                  {...register("reason")}
                />
              </div>
              <Button
                type="button"
                disabled={busy || !hasDateRange}
                onClick={onSendOtp}
              >
                {initiating ? "Sending OTP…" : "Send OTP"}
              </Button>
            </div>
          ) : null}

          {step === "otp" ? (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                Enter the OTP sent to your registered mobile number.
              </p>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="export-otp">OTP</Label>
                <Input
                  id="export-otp"
                  disabled={busy}
                  {...register("otp")}
                />
              </div>
              <Button type="button" disabled={busy} onClick={onVerifyOtp}>
                {verifying ? "Verifying…" : "Verify OTP"}
              </Button>
            </div>
          ) : null}

          {step === "download" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                OTP verified. Download the Excel file for the current filters
                (up to {RECEIPTS_EXPORT_LIMIT.toLocaleString()} rows).
              </p>
              <Button type="button" disabled={busy} onClick={() => void runExport()}>
                {exporting ? "Preparing…" : "Download Excel"}
              </Button>
            </div>
          ) : null}

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
