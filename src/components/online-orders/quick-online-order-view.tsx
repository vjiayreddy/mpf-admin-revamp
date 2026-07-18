"use client"

import type { ReactNode } from "react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { OnlineOrderListRow } from "@/lib/apollo/queries/online-orders"
import {
  customerFullName,
  formatAddress,
  formatOnlineOrderDate,
  formatRupees,
} from "@/lib/online-orders/format"
import { cn } from "@/lib/utils"

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="mt-1 text-sm break-words">{value ?? "—"}</div>
    </div>
  )
}

type QuickOnlineOrderViewProps = {
  open: boolean
  order: OnlineOrderListRow | null
  onOpenChange: (open: boolean) => void
}

export function QuickOnlineOrderView({
  open,
  order,
  onOpenChange,
}: QuickOnlineOrderViewProps) {
  const address = order?.address
  const addressLine = address
    ? formatAddress(address)
    : ""
  const statuses = order?.status ?? []
  const items = order?.items ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-xl"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-4 text-left">
          <SheetTitle>Order details</SheetTitle>
          <SheetDescription>
            {order?.orderId
              ? `Order ${order.orderId}`
              : order?._id
                ? `ID ${order._id}`
                : "Online order"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
          {!order ? (
            <p className="text-muted-foreground text-sm">No order selected.</p>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Customer</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail
                    label="Name"
                    value={customerFullName(order.firstName, order.lastName)}
                  />
                  <Detail label="Mobile" value={order.phone || "—"} />
                  <Detail label="Email" value={order.email || "—"} />
                  <Detail label="Order ID" value={order.orderId || "—"} />
                  <Detail
                    label="RazorPay ID"
                    value={order.razorPayId || "—"}
                  />
                  <Detail
                    label="Paid"
                    value={
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                          order.isPaid
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        )}
                      >
                        {order.isPaid ? "Yes" : "No"}
                      </span>
                    }
                  />
                  <Detail
                    label="Order date"
                    value={formatOnlineOrderDate(
                      order.orderDateTime?.timestamp
                    )}
                  />
                  <Detail
                    label="Paid date"
                    value={formatOnlineOrderDate(
                      order.paidDateTime?.timestamp
                    )}
                  />
                  <Detail
                    label="Order total"
                    value={formatRupees(order.orderTotal)}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Shipping address</h3>
                <Detail
                  label="Address"
                  value={addressLine || "—"}
                />
                {address?.phone || address?.email ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {address.phone ? (
                      <Detail label="Address phone" value={address.phone} />
                    ) : null}
                    {address.email ? (
                      <Detail label="Address email" value={address.email} />
                    ) : null}
                  </div>
                ) : null}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Items</h3>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No items.</p>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground text-left text-xs">
                        <tr>
                          <th className="px-3 py-2 font-medium">Product</th>
                          <th className="px-3 py-2 font-medium">Qty</th>
                          <th className="px-3 py-2 font-medium">Image</th>
                          <th className="px-3 py-2 font-medium">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => {
                          const img = item.images?.[0]
                          return (
                            <tr
                              key={item.itemId ?? `${item.name}-${index}`}
                              className="border-t"
                            >
                              <td className="px-3 py-2">
                                {item.name || "—"}
                              </td>
                              <td className="px-3 py-2">{item.qty ?? "—"}</td>
                              <td className="px-3 py-2">
                                {img ? (
                                  // eslint-disable-next-line @next/next/no-img-element -- remote product CDN URLs
                                  <img
                                    src={img}
                                    alt={item.name || "Product"}
                                    className="size-10 rounded object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                {formatRupees(item.price)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Status timeline</h3>
                {statuses.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No status history.
                  </p>
                ) : (
                  <ol className="relative space-y-0 border-l pl-4">
                    {statuses.map((entry, index) => (
                      <li
                        key={entry._id ?? `${entry.name}-${index}`}
                        className="relative pb-4 last:pb-0"
                      >
                        <span
                          className="bg-primary absolute top-1.5 -left-[1.125rem] size-2.5 rounded-full"
                          aria-hidden
                        />
                        <p className="text-sm font-medium">
                          {entry.label || entry.name || "Status"}
                        </p>
                        {entry.note ? (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {entry.note}
                          </p>
                        ) : null}
                        {entry.dateRecorded?.datestamp ? (
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {entry.dateRecorded.datestamp}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
