"use client"

import { useMemo } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type OrdersListRow,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
} from "@/lib/track-orders/format"
import { firstName } from "@/lib/embroidery/format"

export type QuickOrderViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrdersListRow | null
}

export function QuickOrderView({
  open,
  onOpenChange,
  order,
}: QuickOrderViewProps) {
  const orderId = order?._id?.trim() || ""
  const canFetch = open && Boolean(orderId)

  const { data, loading, error } = useQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, {
    variables: { orderId },
    skip: !canFetch,
    fetchPolicy: "network-only",
  })

  const detail = data?.getStoreOrderById
  const items = (detail?.orderItems ?? []).filter(Boolean) as StoreOrderItem[]

  const title = useMemo(() => {
    const no = detail?.orderNo ?? order?.orderNo
    return `Order ${no != null ? String(no) : "—"}`
  }, [detail?.orderNo, order?.orderNo])

  const name = customerFullName(
    detail?.customerFirstName || order?.customerFirstName,
    detail?.customerLastName || order?.customerLastName
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="space-y-1 border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold tracking-tight">
            {title}
          </SheetTitle>
          <SheetDescription>
            {name}
            {order?.customerId ? ` · Cus. ${order.customerId}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading order…
            </p>
          ) : null}
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              Failed to load order details.
            </p>
          ) : null}

          {!loading && !error && detail ? (
            <div className="space-y-5">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Status</dt>
                  <dd className="font-medium">
                    {detail.orderStatus?.trim() || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Stylist</dt>
                  <dd className="font-medium">
                    {firstName(detail.stylist) || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Order date</dt>
                  <dd className="font-medium">
                    {formatStoreOrderDate(detail.orderDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Trial date</dt>
                  <dd className="font-medium">
                    {formatStoreOrderDate(detail.trialDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Delivery</dt>
                  <dd className="font-medium">
                    {formatStoreOrderDate(detail.deliveryDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Phone</dt>
                  <dd className="font-medium">
                    {detail.customerPhone?.trim() || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Order total</dt>
                  <dd className="font-medium">
                    {formatRupees(detail.orderTotal)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Balance</dt>
                  <dd className="font-medium">
                    {formatRupees(detail.balanceAmount)}
                  </dd>
                </div>
              </dl>

              {detail.remark?.trim() ? (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Remark</p>
                  <p className="text-sm whitespace-pre-wrap">{detail.remark}</p>
                </div>
              ) : null}

              <div>
                <h3 className="mb-2 text-sm font-semibold tracking-tight">
                  Products ({items.length})
                </h3>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No products.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-xs font-semibold">
                            Product
                          </th>
                          <th className="px-3 py-2 text-xs font-semibold">
                            No
                          </th>
                          <th className="px-3 py-2 text-xs font-semibold">
                            Color
                          </th>
                          <th className="px-3 py-2 text-xs font-semibold">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item._id} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">
                              {item.itemName || "—"}
                            </td>
                            <td className="text-muted-foreground px-3 py-2 tabular-nums">
                              {item.itemNumber != null
                                ? String(item.itemNumber)
                                : "—"}
                            </td>
                            <td className="px-3 py-2">
                              {item.itemColor || "—"}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatRupees(item.itemPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
