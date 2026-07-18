"use client"

import { useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"

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
import {
  ADD_ORDER_INVOICE_ITEM,
  GET_ALL_HSN_CODES,
  UPDATE_ORDER_INVOICE_ITEM,
  type AddOrderInvoiceItemVars,
  type GetAllHsnCodesData,
  type HsnCodeOption,
  type InvoiceItem,
  type UpdateOrderInvoiceItemVars,
} from "@/lib/apollo/queries/invoice"

type InvoiceItemDialogProps = {
  open: boolean
  invoiceId: string
  item: InvoiceItem | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function InvoiceItemDialog({
  open,
  invoiceId,
  item,
  onOpenChange,
  onSaved,
}: InvoiceItemDialogProps) {
  const [name, setName] = useState("")
  const [hsnCode, setHsnCode] = useState("")
  const [qty, setQty] = useState("1")
  const [priceIncTax, setPriceIncTax] = useState("")
  const [discount, setDiscount] = useState("0")
  const [taxPercent, setTaxPercent] = useState("")
  const [hsnQuery, setHsnQuery] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const [fetchHsn, { data: hsnData }] = useLazyQuery<GetAllHsnCodesData>(
    GET_ALL_HSN_CODES,
    { fetchPolicy: "cache-first" }
  )

  const [addItem, { loading: adding }] = useMutation<
    unknown,
    AddOrderInvoiceItemVars
  >(ADD_ORDER_INVOICE_ITEM)

  const [updateItem, { loading: updating }] = useMutation<
    unknown,
    UpdateOrderInvoiceItemVars
  >(UPDATE_ORDER_INVOICE_ITEM)

  useEffect(() => {
    if (open) {
      void fetchHsn()
    }
  }, [open, fetchHsn])

  useEffect(() => {
    if (!open) return
    if (item) {
      setName(item.name || "")
      setHsnCode(item.hsnCode || "")
      setQty(item.qty != null ? String(item.qty) : "1")
      setPriceIncTax(
        item.priceIncTax != null ? String(item.priceIncTax) : ""
      )
      setDiscount(item.discount != null ? String(item.discount) : "0")
      setTaxPercent(
        item.taxPercent != null ? String(item.taxPercent) : ""
      )
      setHsnQuery(item.hsnCode || "")
    } else {
      setName("")
      setHsnCode("")
      setQty("1")
      setPriceIncTax("")
      setDiscount("0")
      setTaxPercent("")
      setHsnQuery("")
    }
    setFormError(null)
  }, [open, item])

  const hsnOptions = useMemo(() => {
    const all = hsnData?.getAllHsnCodes ?? []
    const q = hsnQuery.trim().toLowerCase()
    if (!q) return all.slice(0, 20)
    return all
      .filter(
        (h) =>
          h.hsnCode?.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q)
      )
      .slice(0, 20)
  }, [hsnData, hsnQuery])

  const selectHsn = (option: HsnCodeOption) => {
    setHsnCode(option.hsnCode || "")
    setHsnQuery(option.hsnCode || "")
    if (option.taxPercent != null) {
      setTaxPercent(String(option.taxPercent))
    }
  }

  const saving = adding || updating

  const handleSave = async () => {
    setFormError(null)
    if (!name.trim()) {
      setFormError("Name is required.")
      return
    }
    if (!hsnCode.trim()) {
      setFormError("HSN code is required.")
      return
    }

    const itemInput = {
      name: name.trim(),
      hsnCode: hsnCode.trim(),
      qty: Number(qty) || 0,
      priceIncTax: Number(priceIncTax) || 0,
      discount: Number(discount) || 0,
      taxPercent: Number(taxPercent) || 0,
      isPercent: true,
    }

    try {
      if (item?._id) {
        await updateItem({
          variables: {
            invoiceId,
            itemId: item._id,
            itemInput,
          },
        })
      } else {
        await addItem({
          variables: { invoiceId, itemInput },
        })
      }
      onSaved()
      onOpenChange(false)
    } catch {
      setFormError("Failed to save item. Try again.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {item ? "Update invoice item" : "Add invoice item"}
          </SheetTitle>
          <SheetDescription>
            Line items use price including tax and percent discount.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative space-y-1.5">
            <Label htmlFor="item-hsn">HSN code</Label>
            <Input
              id="item-hsn"
              value={hsnQuery}
              onChange={(e) => {
                setHsnQuery(e.target.value)
                setHsnCode(e.target.value)
              }}
              placeholder="Search HSN…"
              autoComplete="off"
            />
            {hsnOptions.length > 0 && hsnQuery.trim() ? (
              <ul className="bg-popover absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-md border text-sm shadow-md">
                {hsnOptions.map((opt) => (
                  <li key={opt._id}>
                    <button
                      type="button"
                      className="hover:bg-muted w-full px-3 py-1.5 text-left"
                      onClick={() => selectHsn(opt)}
                    >
                      <span className="font-medium">{opt.hsnCode}</span>
                      {opt.description ? (
                        <span className="text-muted-foreground">
                          {" "}
                          — {opt.description}
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-qty">Qty</Label>
              <Input
                id="item-qty"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-tax">Tax %</Label>
              <Input
                id="item-tax"
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-price">Rate (incl. tax)</Label>
              <Input
                id="item-price"
                type="number"
                value={priceIncTax}
                onChange={(e) => setPriceIncTax(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-discount">Discount %</Label>
              <Input
                id="item-discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          {formError ? (
            <p className="text-destructive text-sm" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        <SheetFooter>
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
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
