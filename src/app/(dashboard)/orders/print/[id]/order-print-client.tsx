"use client"

import { useEffect } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import { formatProductLabel } from "@/lib/orders/form"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
} from "@/lib/track-orders/format"
import { firstName } from "@/lib/embroidery/format"

function Meta({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 border-b py-1.5 text-sm last:border-0">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd>{value != null && String(value).trim() ? String(value) : "—"}</dd>
    </div>
  )
}

export function OrderPrintClient() {
  const params = useParams<{ id: string }>()
  const orderId = params.id

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/orders" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to orders
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => window.print()}
          disabled={!order}
        >
          <PrinterIcon className="size-3.5" />
          Print
        </Button>
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
        <div className="bg-background space-y-6 rounded-lg border p-6 print:border-0 print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Order {order.orderNo != null ? String(order.orderNo) : "—"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {customerFullName(
                  order.customerFirstName,
                  order.customerLastName
                )}
                {order.customerId ? ` · Cus. ${order.customerId}` : ""}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{order.orderStatus || "—"}</p>
              <p className="text-muted-foreground">
                {formatStoreOrderDate(order.orderDate)}
              </p>
            </div>
          </div>

          <dl>
            <Meta
              label="Phone"
              value={
                order.customerPhone
                  ? `+${(order.customerCountryCode || "91").replace(/^\+/, "")} ${order.customerPhone}`
                  : null
              }
            />
            <Meta label="Stylist" value={firstName(order.stylist)} />
            <Meta
              label="Trial date"
              value={formatStoreOrderDate(order.trialDate)}
            />
            <Meta
              label="Delivery"
              value={formatStoreOrderDate(order.deliveryDate)}
            />
            <Meta label="Order total" value={formatRupees(order.orderTotal)} />
            <Meta label="Balance" value={formatRupees(order.balanceAmount)} />
          </dl>

          {order.remark?.trim() ? (
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Remark
              </p>
              <p className="text-sm whitespace-pre-wrap">{order.remark}</p>
            </div>
          ) : null}

          <div>
            <h2 className="mb-2 text-sm font-semibold tracking-tight">
              Products ({items.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold">Product</th>
                    <th className="px-3 py-2 text-xs font-semibold">No</th>
                    <th className="px-3 py-2 text-xs font-semibold">Color</th>
                    <th className="px-3 py-2 text-xs font-semibold">Occasion</th>
                    <th className="px-3 py-2 text-xs font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id || String(item.itemNumber)}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-2 font-medium">
                        {formatProductLabel(item.itemName || "") ||
                          item.itemName ||
                          "—"}
                      </td>
                      <td className="text-muted-foreground px-3 py-2 tabular-nums">
                        {item.itemNumber != null
                          ? String(item.itemNumber)
                          : "—"}
                      </td>
                      <td className="px-3 py-2">{item.itemColor || "—"}</td>
                      <td className="px-3 py-2">{item.occasion || "—"}</td>
                      <td className="px-3 py-2 tabular-nums">
                        {formatRupees(item.itemPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
