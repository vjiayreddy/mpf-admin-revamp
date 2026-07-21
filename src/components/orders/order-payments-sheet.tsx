"use client"

import { useEffect, useId, useState } from "react"
import {
  ImageIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { Controller, useForm } from "react-hook-form"

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
import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import { ORDERS_IMAGE_UPLOAD_PATH } from "@/config/order-form"
import { PAYMENT_MODE_OPTIONS } from "@/config/receipt-filters"
import { extractDateFormat, isoToDateInput } from "@/lib/appointments/date-payload"
import type { OrderPaymentLine } from "@/lib/orders/form"
import { formatRupees } from "@/lib/track-orders/format"
import { uploadUrlsFromResult } from "@/lib/uppy/config"
import { cn } from "@/lib/utils"

type PaymentFormValues = {
  date: string
  modeOfPayment: string
  isAdvance: "true" | "false"
  amount: string
  note: string
  screenShotUrl: string
}

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

function isPaymentVerified(line: OrderPaymentLine) {
  return line.isVerified === true || line.isVerified === "true"
}

function paymentModeLabel(value?: string | null) {
  if (!value) return "—"
  return (
    PAYMENT_MODE_OPTIONS.find((opt) => opt.value === value)?.label || value
  )
}

export type OrderPaymentsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  lines: OrderPaymentLine[]
  orderDate?: string
  orderId?: string
  onSave: (lines: OrderPaymentLine[]) => void
  /** When set, Apply triggers this instead of only local save (list path). */
  saving?: boolean
}

export function OrderPaymentsSheet({
  open,
  onOpenChange,
  lines,
  orderDate,
  orderId,
  onSave,
  saving,
}: OrderPaymentsSheetProps) {
  const formId = useId()
  const [draft, setDraft] = useState<OrderPaymentLine[]>([])
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const { register, control, handleSubmit, reset, setValue, watch } =
    useForm<PaymentFormValues>({
      defaultValues: {
        date: "",
        modeOfPayment: "",
        isAdvance: "true",
        amount: "",
        note: "",
        screenShotUrl: "",
      },
    })

  const screenShotUrl = watch("screenShotUrl")

  useEffect(() => {
    if (!open) return
    setDraft(lines.map((line) => ({ ...line })))
    setEditIndex(null)
    reset({
      date: orderDate || isoToDateInput(new Date().toISOString()),
      modeOfPayment: "",
      isAdvance: "true",
      amount: "",
      note: "",
      screenShotUrl: "",
    })
  }, [open, lines, orderDate, reset])

  const total = draft.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)

  const onAddOrUpdate = (values: PaymentFormValues) => {
    const existing =
      editIndex != null ? draft[editIndex] : ({} as OrderPaymentLine)
    if (isPaymentVerified(existing)) return

    const dateIso = values.date
      ? new Date(`${values.date}T00:00:00`).toISOString()
      : ""
    const next: OrderPaymentLine = {
      ...existing,
      date: dateIso ? extractDateFormat(dateIso) : null,
      modeOfPayment: values.modeOfPayment,
      isAdvance: values.isAdvance === "true",
      amount: Number(values.amount) || 0,
      note: values.note.trim(),
      screenShotUrl: values.screenShotUrl.trim() || null,
    }

    setDraft((prev) => {
      if (editIndex != null) {
        const copy = [...prev]
        copy[editIndex] = next
        return copy
      }
      return [...prev, next]
    })
    setEditIndex(null)
    reset({
      date: orderDate || isoToDateInput(new Date().toISOString()),
      modeOfPayment: "",
      isAdvance: "true",
      amount: "",
      note: "",
      screenShotUrl: "",
    })
  }

  const uploadPath = orderId
    ? `${ORDERS_IMAGE_UPLOAD_PATH}/${orderId}`
    : ORDERS_IMAGE_UPLOAD_PATH

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
          <SheetHeader className="space-y-1 border-b px-5 py-4">
            <SheetTitle>Advance payments</SheetTitle>
            <SheetDescription>
              Add payment lines for this order. Verified payments cannot be
              edited.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <form
              id={formId}
              className="grid gap-3"
              onSubmit={handleSubmit(onAddOrUpdate)}
            >
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-date`}>Date</Label>
                <Input
                  id={`${formId}-date`}
                  type="date"
                  min={orderDate || undefined}
                  {...register("date", { required: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-mode`}>Mode of payment</Label>
                <Controller
                  name="modeOfPayment"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select
                      id={`${formId}-mode`}
                      className={selectClass}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="">Select mode</option>
                      {PAYMENT_MODE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-advance`}>Advance?</Label>
                <Controller
                  name="isAdvance"
                  control={control}
                  render={({ field }) => (
                    <select
                      id={`${formId}-advance`}
                      className={selectClass}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-amount`}>Amount</Label>
                <Input
                  id={`${formId}-amount`}
                  type="number"
                  min={0}
                  step="1"
                  {...register("amount", { required: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-note`}>Note</Label>
                <Textarea
                  id={`${formId}-note`}
                  rows={2}
                  {...register("note")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Screenshot</Label>
                {screenShotUrl ? (
                  <div className="relative overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenShotUrl}
                      alt="Payment screenshot"
                      className="h-28 w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute top-2 right-2 size-7"
                      onClick={() => setValue("screenShotUrl", "")}
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadOpen(true)}
                  >
                    <ImageIcon className="size-4" />
                    Upload screenshot
                  </Button>
                )}
              </div>
              <Button type="submit" size="sm" className="w-fit">
                <PlusIcon className="size-4" />
                {editIndex != null ? "Update payment" : "Add payment"}
              </Button>
            </form>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Payments ({draft.length})</span>
                <span className="tabular-nums">{formatRupees(total)}</span>
              </div>
              {draft.length === 0 ? (
                <p className="text-muted-foreground text-sm">No payments yet.</p>
              ) : (
                <ul className="space-y-2">
                  {draft.map((line, index) => {
                    const verified = isPaymentVerified(line)
                    return (
                      <li
                        key={`${line.modeOfPayment}-${index}`}
                        className="bg-muted/30 flex items-start justify-between gap-2 rounded-lg border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {paymentModeLabel(line.modeOfPayment)} ·{" "}
                            {formatRupees(line.amount)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {isoToDateInput(line.date?.timestamp) || "—"}
                            {line.isAdvance === true ||
                            line.isAdvance === "true"
                              ? " · Advance"
                              : ""}
                            {verified ? " · Verified" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-7"
                            disabled={verified}
                            aria-label="Edit payment"
                            onClick={() => {
                              setEditIndex(index)
                              reset({
                                date:
                                  isoToDateInput(line.date?.timestamp) ||
                                  orderDate ||
                                  "",
                                modeOfPayment: line.modeOfPayment || "",
                                isAdvance:
                                  line.isAdvance === true ||
                                  line.isAdvance === "true"
                                    ? "true"
                                    : "false",
                                amount: String(line.amount ?? 0),
                                note: line.note || "",
                                screenShotUrl: line.screenShotUrl || "",
                              })
                            }}
                          >
                            <PencilIcon className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-7"
                            disabled={verified}
                            aria-label="Delete payment"
                            onClick={() =>
                              setDraft((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          <SheetFooter className="border-t px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => {
                onSave(draft)
              }}
            >
              {saving ? "Saving…" : "Apply"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <UppyFileUpload
        open={uploadOpen}
        uploadPath={uploadPath}
        maxNumberOfFiles={1}
        allowedFileTypes={["image/*"]}
        onClose={() => setUploadOpen(false)}
        onCompleted={(result) => {
          const urls = uploadUrlsFromResult(result.successful)
          if (urls[0]) setValue("screenShotUrl", urls[0])
          setUploadOpen(false)
        }}
      />
    </>
  )
}
