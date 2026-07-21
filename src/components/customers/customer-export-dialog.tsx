"use client"

import { useEffect, useMemo, useState } from "react"
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
import { CUSTOMER_FILTER_PARAMS } from "@/config/customer-filters"
import { authClient } from "@/lib/auth-client"
import { mpfUserIdFromAccessToken } from "@/lib/auth/mpf-user-id"
import {
  INITIATE_USER_EXPORT_OTP,
  VERIFY_USER_EXPORT_OTP,
  type InitiateUserExportOtpData,
  type InitiateUserExportOtpVars,
  type VerifyUserExportOtpData,
  type VerifyUserExportOtpVars,
} from "@/lib/apollo/queries/receipts"
import {
  CUSTOMERS_EXPORT_LIMIT,
  GET_USERS_BY_FILTER,
  type GetUsersByFilterData,
  type GetUsersByFilterVars,
} from "@/lib/apollo/queries/users"
import { buildUsersFilterFromSearchParams } from "@/lib/customers/build-users-filter"
import { notify } from "@/lib/notify"

type ExportStep = "reason" | "otp" | "download"

type CustomerExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: URLSearchParams
}

function parseTeamsRoleFilter(teamsJson: string | null | undefined): unknown[] {
  if (!teamsJson) return []
  try {
    const teams = JSON.parse(teamsJson) as unknown
    if (Array.isArray(teams) && teams.length > 0) {
      return [teams[0]]
    }
  } catch {
    // ignore
  }
  return []
}

function formatRegisteredDate(value?: string | null) {
  if (!value) return "N/A"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "N/A"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function CustomerExportDialog({
  open,
  onOpenChange,
  searchParams,
}: CustomerExportDialogProps) {
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

  const sessionRoleFilter = useMemo(
    () => parseTeamsRoleFilter(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const [initiateOtp, { loading: initiating }] = useMutation<
    InitiateUserExportOtpData,
    InitiateUserExportOtpVars
  >(INITIATE_USER_EXPORT_OTP)

  const [verifyOtp, { loading: verifying }] = useMutation<
    VerifyUserExportOtpData,
    VerifyUserExportOtpVars
  >(VERIFY_USER_EXPORT_OTP)

  const [fetchUsers, { loading: exporting }] = useLazyQuery<
    GetUsersByFilterData,
    GetUsersByFilterVars
  >(GET_USERS_BY_FILTER, {
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (!open) return
    setStep("reason")
    setError(null)
    setDownloadHistoryId(null)
    reset({ reason: "", otp: "" })
  }, [open, reset])

  const hasRegisteredDateRange =
    Boolean(searchParams.get(CUSTOMER_FILTER_PARAMS.startCreatedDate)) &&
    Boolean(searchParams.get(CUSTOMER_FILTER_PARAMS.endCreatedDate))

  const runExport = async () => {
    setError(null)
    try {
      const filter = buildUsersFilterFromSearchParams(
        searchParams,
        sessionRoleFilter
      )
      const result = await fetchUsers({
        variables: {
          page: 1,
          limit: CUSTOMERS_EXPORT_LIMIT,
          filter,
        },
      })
      const users = result.data?.getUsersByFilter ?? []
      if (users.length === 0) {
        const msg = "No customers found for the selected filters."
        setError(msg)
        notify.warning(msg)
        return
      }

      const rows = users.map((payload) => ({
        firstName: payload.firstName ?? "",
        lastName: payload.lastName ?? "",
        customerSrNo: payload.customerSrNo ?? "",
        phone: payload.phone
          ? `${payload.countryCode ?? ""}${payload.phone}`
          : "",
        email: payload.email ?? "",
        RegisteredDate: formatRegisteredDate(payload.createdAt),
        stylist: payload.stylist?.[0]?.name ?? "",
        userStatus: payload.userStatus ?? "",
      }))

      const date = new Date()
      const fileName = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-exported-User-data.xlsx`
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, fileName)
      notify.success("Customers exported")
      onOpenChange(false)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to export customers. Try again."
      setError(msg)
      notify.fromError(err, "Failed to export customers. Try again.")
    }
  }

  const onSendOtp = handleSubmit(async ({ reason }) => {
    setError(null)
    const userId = mpfUserIdFromAccessToken(session?.user?.mpfAccessToken)
    if (!userId) {
      setError("Missing MPF user id in session. Sign out and sign in again.")
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
      notify.success("OTP sent to your registered mobile number")
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
          <SheetTitle>Export customers</SheetTitle>
          <SheetDescription>
            OTP-gated Excel export for the current customer filters.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          {!hasRegisteredDateRange ? (
            <p className="text-destructive text-sm" role="alert">
              Select Registered start and end dates in More filters before
              exporting.
            </p>
          ) : null}

          {step === "reason" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customer-export-reason">
                  Reason for exporting the data
                </Label>
                <Textarea
                  id="customer-export-reason"
                  rows={3}
                  disabled={busy || !hasRegisteredDateRange}
                  {...register("reason")}
                />
              </div>
              <Button
                type="button"
                disabled={busy || !hasRegisteredDateRange}
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
                <Label htmlFor="customer-export-otp">OTP</Label>
                <Input
                  id="customer-export-otp"
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
                (up to {CUSTOMERS_EXPORT_LIMIT.toLocaleString()} rows).
              </p>
              <Button
                type="button"
                disabled={busy}
                onClick={() => void runExport()}
              >
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
