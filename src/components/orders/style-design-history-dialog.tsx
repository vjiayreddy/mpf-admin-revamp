"use client"

import { useEffect, useMemo, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { Loader2Icon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GET_STORE_ORDER_BY_ID,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import {
  GET_STYLING_CONFIG,
  type GetStylingConfigData,
  type GetStylingConfigVars,
} from "@/lib/apollo/queries/styling-config"
import { formatProductLabel } from "@/lib/orders/form"
import { cn } from "@/lib/utils"

export type StyleDesignHistoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string | null
  orderNo?: string | number | null
}

type StyleAttr = {
  catId?: string | null
  image?: string | null
  master_name?: string | null
  name?: string | null
  value?: string | null
}

type StyleDesign = {
  handDesign?: string | null
  monogramLetter?: string | null
  note?: string | null
  styleAttributes?: StyleAttr[] | null
}

function attrLabel(
  attr: StyleAttr,
  labelByMaster: Map<string, string>
) {
  const master = attr.master_name?.trim() || ""
  return (
    labelByMaster.get(master) ||
    master.replace(/^master_/, "").replace(/_/g, " ") ||
    attr.name ||
    "Attribute"
  )
}

function StyleBlock({
  title,
  design,
  labelByMaster,
  compareAttrs,
}: {
  title: string
  design?: StyleDesign | null
  labelByMaster: Map<string, string>
  compareAttrs?: StyleAttr[] | null
}) {
  if (!design) {
    return (
      <div className="rounded-lg border px-3 py-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">No design data.</p>
      </div>
    )
  }

  const compareMap = new Map(
    (compareAttrs ?? []).map((a) => [a.master_name || a.name || "", a.value])
  )

  return (
    <div className="space-y-2 rounded-lg border px-3 py-2">
      <p className="text-sm font-medium">{title}</p>
      <dl className="grid gap-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Hand design</dt>
          <dd>{design.handDesign?.trim() || "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Monogram</dt>
          <dd>{design.monogramLetter?.trim() || "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Note</dt>
          <dd className="whitespace-pre-wrap">{design.note?.trim() || "—"}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {(design.styleAttributes ?? []).length === 0 ? (
          <span className="text-muted-foreground text-xs">No attributes</span>
        ) : (
          (design.styleAttributes ?? []).map((attr, index) => {
            const key = attr.master_name || attr.name || ""
            const changed =
              compareAttrs != null && compareMap.get(key) !== attr.value
            return (
              <span
                key={`${key}-${index}`}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px]",
                  changed && "border-amber-500/50 bg-amber-500/10"
                )}
              >
                {attrLabel(attr, labelByMaster)}
                {attr.value ? `: ${attr.value}` : ""}
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

export function StyleDesignHistoryDialog({
  open,
  onOpenChange,
  orderId,
  orderNo,
}: StyleDesignHistoryDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null)

  const [fetchOrder, { data, loading, error }] = useLazyQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, { fetchPolicy: "network-only" })

  const [fetchConfig, { data: configData }] = useLazyQuery<
    GetStylingConfigData,
    GetStylingConfigVars
  >(GET_STYLING_CONFIG)

  useEffect(() => {
    if (!open || !orderId) return
    setSelectedIndex(0)
    setExpandedVersion(null)
    void fetchOrder({ variables: { orderId } })
  }, [open, orderId, fetchOrder])

  const items = useMemo(
    () =>
      ((data?.getStoreOrderById?.orderItems ?? []).filter(Boolean) as StoreOrderItem[]),
    [data?.getStoreOrderById?.orderItems]
  )

  const selected = items[selectedIndex]
  const catId = selected?.itemCatId?.trim() || ""

  useEffect(() => {
    if (!open || !catId || catId === "NA") return
    void fetchConfig({ variables: { catId } })
  }, [open, catId, fetchConfig])

  const labelByMaster = useMemo(() => {
    const map = new Map<string, string>()
    for (const attr of configData?.getStylingConfig?.attributes ?? []) {
      if (attr.masterName)
        map.set(attr.masterName, attr.label || attr.masterName)
    }
    return map
  }, [configData?.getStylingConfig?.attributes])

  const history = selected?.styleDesignHistory ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Style design history
            {orderNo != null ? ` · Order ${orderNo}` : ""}
          </DialogTitle>
          <DialogDescription>
            Current design and prior versions per product.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2Icon className="size-4 animate-spin" />
            Loading…
          </p>
        ) : null}
        {error ? (
          <p className="text-destructive text-sm">Failed to load order.</p>
        ) : null}

        {!loading && !error ? (
          <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[12rem_1fr]">
            <ScrollArea className="h-48 rounded-lg border md:h-[28rem]">
              <div className="p-1">
                {items.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-3 text-sm">
                    No products.
                  </p>
                ) : (
                  items.map((item, index) => {
                    const versions = item.styleDesignHistory?.length ?? 0
                    return (
                      <button
                        key={item._id || String(index)}
                        type="button"
                        className={cn(
                          "hover:bg-accent flex w-full flex-col rounded-md px-2 py-1.5 text-left text-sm",
                          index === selectedIndex && "bg-accent"
                        )}
                        onClick={() => {
                          setSelectedIndex(index)
                          setExpandedVersion(null)
                        }}
                      >
                        <span className="truncate font-medium">
                          {formatProductLabel(item.itemName || "") || "Item"}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {item.itemNumber != null
                            ? String(item.itemNumber)
                            : "—"}
                          {versions > 0 ? ` · ${versions} version(s)` : ""}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            <ScrollArea className="h-[28rem]">
              <div className="space-y-3 pr-3">
                {!selected ? (
                  <p className="text-muted-foreground text-sm">
                    Select a product.
                  </p>
                ) : (
                  <>
                    <StyleBlock
                      title="Current design"
                      design={selected.styleDesign}
                      labelByMaster={labelByMaster}
                    />
                    {history.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No prior style versions for this product.
                      </p>
                    ) : (
                      history.map((entry, versionIndex) => {
                        const openVersion = expandedVersion === versionIndex
                        return (
                          <div key={versionIndex} className="space-y-2">
                            <button
                              type="button"
                              className="hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm"
                              onClick={() =>
                                setExpandedVersion(
                                  openVersion ? null : versionIndex
                                )
                              }
                            >
                              <span className="font-medium">
                                Version {history.length - versionIndex}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {openVersion ? "Hide" : "Show"}
                              </span>
                            </button>
                            {openVersion ? (
                              <StyleBlock
                                title={`Version ${history.length - versionIndex}`}
                                design={entry?.styleDesign}
                                labelByMaster={labelByMaster}
                                compareAttrs={
                                  selected.styleDesign?.styleAttributes
                                }
                              />
                            ) : null}
                          </div>
                        )
                      })
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
