"use client"

import { useEffect, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileTextIcon,
  Loader2Icon,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getOrderPrintStudio,
  ORDER_PRINT_BANK,
  ORDER_PRINT_TERMS,
} from "@/config/order-print-studios"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import { firstName } from "@/lib/embroidery/format"
import { notify } from "@/lib/notify"
import {
  exportOrderPdf,
  type OrderPdfAction,
} from "@/lib/orders/download-order-pdf"
import { formatProductLabel } from "@/lib/orders/form"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
} from "@/lib/track-orders/format"

function MetaLine({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 text-xs sm:text-sm">
      <dt className="font-semibold">{label}</dt>
      <dd className="break-words">
        {value != null && String(value).trim() ? String(value) : "—"}
      </dd>
    </div>
  )
}

function Thumb({ src, label }: { src?: string | null; label: string }) {
  if (!src?.trim()) {
    return (
      <div
        className="bg-muted size-12 rounded border"
        title={`No ${label}`}
        aria-hidden
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="size-12 rounded border object-cover"
    />
  )
}

export function OrderPrintClient() {
  const params = useParams<{ id: string }>()
  const orderId = params.id
  const [pdfBusy, setPdfBusy] = useState(false)

  const [fetchOrder, { data, loading, error }] = useLazyQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, { fetchPolicy: "network-only" })

  useEffect(() => {
    if (!orderId) return
    void fetchOrder({ variables: { orderId } })
  }, [orderId, fetchOrder])

  const order = data?.getStoreOrderById
  const items = (order?.orderItems ?? []).filter(Boolean) as StoreOrderItem[]
  const studio = getOrderPrintStudio(order?.studioId)
  const studioLabel = studio.name

  const runPdf = async (action: OrderPdfAction) => {
    if (!order || pdfBusy) return
    setPdfBusy(true)
    try {
      await exportOrderPdf(order, action)
      notify.success(
        action === "open" ? "PDF opened in a new tab" : "PDF downloaded"
      )
    } catch (err) {
      notify.fromError(err, "Failed to generate order PDF")
    } finally {
      setPdfBusy(false)
    }
  }

  const phone = order?.customerPhone
    ? `+${(order.customerCountryCode || "91").replace(/^\+/, "")} ${order.customerPhone}`
    : null

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/orders" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to orders
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!order || pdfBusy}
            onClick={() => void runPdf("open")}
          >
            {pdfBusy ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <FileTextIcon className="size-3.5" />
            )}
            Open PDF
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!order || pdfBusy}
            onClick={() => void runPdf("download")}
          >
            {pdfBusy ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <DownloadIcon className="size-3.5" />
            )}
            {pdfBusy ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load order for print.
        </p>
      ) : null}

      {order ? (
        <div className="bg-card space-y-5 rounded-xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
            <div className="min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={studio.logoPath}
                alt={studio.name}
                className="mb-2 h-12 w-auto max-w-[10rem] object-contain"
              />
            </div>
            <div className="max-w-sm text-right text-xs leading-relaxed sm:text-sm">
              <p className="font-semibold">{studio.name}</p>
              {studio.subtitle ? <p>{studio.subtitle}</p> : null}
              <p className="text-muted-foreground mt-1">{studio.address}</p>
              <p className="text-muted-foreground">
                Call: {studio.phone} · Email: {studio.email}
              </p>
              {studio.website ? (
                <p className="text-muted-foreground">{studio.website}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <dl className="space-y-1.5">
              <MetaLine label="Studio" value={studioLabel} />
              <MetaLine
                label="Order No"
                value={order.orderNo != null ? String(order.orderNo) : null}
              />
              <MetaLine
                label="Name"
                value={customerFullName(
                  order.customerFirstName,
                  order.customerLastName
                )}
              />
              <MetaLine label="Mobile" value={phone} />
              <MetaLine label="Email" value={order.customerEmail} />
              <MetaLine label="Stylist" value={firstName(order.stylist)} />
              <MetaLine label="Source" value={order.sourceChannel} />
              <MetaLine label="Sub source" value={order.sourceSubChannel} />
            </dl>
            <dl className="space-y-1.5">
              <MetaLine label="Customer Id" value={order.customerId} />
              <MetaLine label="Height" value={order.customerHeight} />
              <MetaLine label="Weight" value={order.customerWeight} />
              <MetaLine label="City" value={order.customerCity} />
              <MetaLine
                label="Order date"
                value={formatStoreOrderDate(order.orderDate)}
              />
              <MetaLine
                label="Event date"
                value={formatStoreOrderDate(order.eventDate)}
              />
              <MetaLine
                label="Ready date"
                value={formatStoreOrderDate(order.readyDate)}
              />
              <MetaLine
                label="Trial date"
                value={formatStoreOrderDate(order.trialDate)}
              />
              <MetaLine
                label="Delivery"
                value={formatStoreOrderDate(order.deliveryDate)}
              />
            </dl>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-2 py-2 text-xs font-semibold">P.No</th>
                  <th className="px-2 py-2 text-xs font-semibold">Product</th>
                  <th className="px-2 py-2 text-xs font-semibold">Colour</th>
                  <th className="px-2 py-2 text-xs font-semibold">Fab-code</th>
                  <th className="px-2 py-2 text-xs font-semibold">Fabric</th>
                  <th className="px-2 py-2 text-xs font-semibold">Ref</th>
                  <th className="px-2 py-2 text-xs font-semibold">Fit</th>
                  <th className="px-2 py-2 text-xs font-semibold">Trial</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id || String(item.itemNumber)}
                    className="border-b last:border-0"
                  >
                    <td className="px-2 py-2 tabular-nums">
                      {item.itemNumber != null
                        ? String(item.itemNumber)
                        : "—"}
                    </td>
                    <td className="px-2 py-2 font-medium">
                      {formatProductLabel(item.itemName || "") ||
                        item.itemName ||
                        "—"}
                    </td>
                    <td className="px-2 py-2">{item.itemColor || "—"}</td>
                    <td className="px-2 py-2">{item.fabricCode || "—"}</td>
                    <td className="px-2 py-2">
                      <Thumb src={item.fabricImage} label="Fabric" />
                    </td>
                    <td className="px-2 py-2">
                      <Thumb src={item.referenceImage} label="Reference" />
                    </td>
                    <td className="px-2 py-2">
                      <Thumb src={item.fitImage} label="Fit" />
                    </td>
                    <td className="px-2 py-2">
                      {formatStoreOrderDate(item.trialDate)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums">
                      {formatRupees(item.itemPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            {(
              [
                ["Total", formatRupees(order.orderTotal)],
                ["Other Charges", formatRupees(order.otherCharges)],
                ["Deductions", formatRupees(order.deductions)],
                ["Net Amount", formatRupees(order.afterDeductionsTotal)],
                ["Advance", formatRupees(order.payment)],
                ["Balance", formatRupees(order.balanceAmount)],
                ["Order Status", order.orderStatus?.trim() || "—"],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b py-1 last:border-0"
              >
                <span className="font-semibold">{label}</span>
                <span className="tabular-nums">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t pt-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Terms and Conditions
            </h2>
            <ol className="text-muted-foreground list-decimal space-y-1.5 pl-4 text-xs leading-relaxed">
              {ORDER_PRINT_TERMS.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ol>
            {!studio.hideBank ? (
              <p className="pt-2 text-xs leading-relaxed">
                <span className="font-semibold">Bank Account</span>
                <br />
                {ORDER_PRINT_BANK}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
