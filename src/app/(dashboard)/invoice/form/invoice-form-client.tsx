"use client"

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useRouter, useSearchParams } from "next/navigation"
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react"

import { InvoiceItemDialog } from "@/components/invoice/invoice-item-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  DELETE_ORDER_INVOICE_ITEM,
  GET_SINGLE_INVOICE_BY_ID,
  UPDATE_INVOICE,
  type DeleteOrderInvoiceItemVars,
  type GetSingleInvoiceByIdData,
  type GetSingleInvoiceByIdVars,
  type InvoiceItem,
  type UpdateInvoiceData,
  type UpdateInvoiceVars,
} from "@/lib/apollo/queries/invoice"
import {
  dateInputToMpfFilter,
  formatAmount,
  timestampToDateInput,
} from "@/lib/invoice/format"

type FormState = {
  invoiceId: string
  invoiceDate: string
  deliveryNote: string
  modeOfPayment: string
  buyerOrderNo: string
  buyerOrderDate: string
  customerId: string
  dispatchDocNo: string
  dispatchedThrough: string
  destination: string
  termsAndConditions: string
  note: string
  shipToName: string
  shipToGSTNo: string
  shipToState: string
  shipToStateCode: string
  shipToAddress: string
  billToName: string
  billToGSTNo: string
  billToState: string
  billToStateCode: string
  billToAddress: string
  placeOfSupply: string
}

const emptyForm: FormState = {
  invoiceId: "",
  invoiceDate: "",
  deliveryNote: "",
  modeOfPayment: "",
  buyerOrderNo: "",
  buyerOrderDate: "",
  customerId: "",
  dispatchDocNo: "",
  dispatchedThrough: "",
  destination: "",
  termsAndConditions: "",
  note: "",
  shipToName: "",
  shipToGSTNo: "",
  shipToState: "",
  shipToStateCode: "",
  shipToAddress: "",
  billToName: "",
  billToGSTNo: "",
  billToState: "",
  billToStateCode: "",
  billToAddress: "",
  placeOfSupply: "",
}

function Field({
  id,
  label,
  children,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className ?? "space-y-1.5"}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

export function InvoiceFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceIdParam = searchParams.get("invoiceId")

  const [form, setForm] = useState<FormState>(emptyForm)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InvoiceItem | null>(null)

  const [fetchInvoice, { data, loading, error }] = useLazyQuery<
    GetSingleInvoiceByIdData,
    GetSingleInvoiceByIdVars
  >(GET_SINGLE_INVOICE_BY_ID, {
    fetchPolicy: "network-only",
  })

  const [updateInvoice, { loading: saving }] = useMutation<
    UpdateInvoiceData,
    UpdateInvoiceVars
  >(UPDATE_INVOICE)

  const [deleteItem, { loading: deleting }] = useMutation<
    unknown,
    DeleteOrderInvoiceItemVars
  >(DELETE_ORDER_INVOICE_ITEM)

  const invoice = data?.getSingleInvoiceById

  const reload = useCallback(() => {
    if (!invoiceIdParam) return
    void fetchInvoice({ variables: { invoiceId: invoiceIdParam } })
  }, [fetchInvoice, invoiceIdParam])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!invoice) return
    const payments =
      invoice.paymentDetails
        ?.map((p) => p.modeOfPayment)
        .filter(Boolean)
        .join(", ") || ""

    setForm({
      invoiceId: invoice.invoiceId || "",
      invoiceDate: timestampToDateInput(invoice.invoiceDate?.timestamp),
      deliveryNote: invoice.deliveryNote || "",
      modeOfPayment: payments,
      buyerOrderNo:
        invoice.buyerOrderNo != null ? String(invoice.buyerOrderNo) : "",
      buyerOrderDate: timestampToDateInput(invoice.buyerOrderDate?.timestamp),
      customerId: invoice.customerDetails?.customerId || "",
      // Use real fields — do not copy customerId into dispatch/other refs
      dispatchDocNo:
        invoice.dispatchDocNo != null ? String(invoice.dispatchDocNo) : "",
      dispatchedThrough: invoice.dispatchedThrough || "",
      destination: invoice.destination || "",
      termsAndConditions: invoice.termsAndConditions || "",
      note: invoice.note || "",
      shipToName: invoice.addressDetails?.shipToName || "",
      shipToGSTNo: invoice.addressDetails?.shipToGSTNo || "",
      shipToState: invoice.addressDetails?.shipToState || "",
      shipToStateCode: invoice.addressDetails?.shipToStateCode || "",
      // Use shipToAddress from API (legacy incorrectly used billToAddress)
      shipToAddress: invoice.addressDetails?.shipToAddress || "",
      billToName: invoice.addressDetails?.billToName || "",
      billToGSTNo: invoice.addressDetails?.billToGSTNo || "",
      billToState: invoice.addressDetails?.billToState || "",
      billToStateCode: invoice.addressDetails?.billToStateCode || "",
      billToAddress: invoice.addressDetails?.billToAddress || "",
      placeOfSupply: invoice.addressDetails?.placeOfSupply || "",
    })
  }, [invoice])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!invoiceIdParam || !invoice) return
    setSaveError(null)

    const invoiceDate = dateInputToMpfFilter(form.invoiceDate)
    if (!invoiceDate) {
      setSaveError("Invoice date is required.")
      return
    }

    const buyerOrderDate = dateInputToMpfFilter(form.buyerOrderDate)
    const customer = invoice.customerDetails

    try {
      await updateInvoice({
        variables: {
          invoiceId: invoiceIdParam,
          orderInvoiceInput: {
            invoiceDate,
            destination: form.destination,
            dispatchDocNo: form.dispatchDocNo,
            dispatchedThrough: form.dispatchedThrough,
            otherReferences: form.customerId || invoice.otherReferences || "",
            termsAndConditions: form.termsAndConditions,
            deliveryNote: form.deliveryNote,
            ...(form.buyerOrderNo
              ? { buyerOrderNo: Number(form.buyerOrderNo) }
              : {}),
            ...(buyerOrderDate ? { buyerOrderDate } : {}),
            note: form.note,
            customerDetails: {
              userId: customer?.userId,
              phone: customer?.phone,
              lastName: customer?.lastName,
              firstName: customer?.firstName,
              email: customer?.email,
            },
            addressDetails: {
              billToAddress: form.billToAddress,
              billToName: form.billToName,
              billToState: form.billToState,
              billToStateCode: form.billToStateCode,
              shipToAddress: form.shipToAddress,
              shipToName: form.shipToName,
              shipToState: form.shipToState,
              shipToStateCode: form.shipToStateCode,
              billToGSTNo: form.billToGSTNo,
              shipToGSTNo: form.shipToGSTNo,
              placeOfSupply: form.placeOfSupply,
            },
          },
        },
      })
      router.push("/invoice")
    } catch {
      setSaveError("Failed to save invoice. Try again.")
    }
  }

  const handleDeleteItem = async () => {
    if (!invoiceIdParam || !deletingItem?._id) return
    try {
      await deleteItem({
        variables: {
          invoiceId: invoiceIdParam,
          itemId: deletingItem._id,
        },
      })
      setDeletingItem(null)
      reload()
    } catch {
      setSaveError("Failed to delete item.")
    }
  }

  if (!invoiceIdParam) {
    return (
      <p className="text-destructive text-sm" role="alert">
        Missing invoiceId. Open an invoice from the list to edit.
      </p>
    )
  }

  const items = invoice?.items ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit tax invoice
        </h1>
        <p className="text-muted-foreground text-sm">
          Update invoice header, addresses, and line items.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load invoice.
        </p>
      ) : null}

      {!loading && invoice ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <Field id="invoiceId" label="Invoice No">
              <Input id="invoiceId" value={form.invoiceId} readOnly />
            </Field>
            <Field id="invoiceDate" label="Invoice date">
              <Input
                id="invoiceDate"
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setField("invoiceDate", e.target.value)}
                required
              />
            </Field>
            <Field id="modeOfPayment" label="Mode of payment">
              <Input
                id="modeOfPayment"
                value={form.modeOfPayment}
                readOnly
              />
            </Field>
            <Field id="customerId" label="Customer Id">
              <Input id="customerId" value={form.customerId} readOnly />
            </Field>
            <Field id="buyerOrderNo" label="Buyer's order no">
              <Input
                id="buyerOrderNo"
                value={form.buyerOrderNo}
                onChange={(e) => setField("buyerOrderNo", e.target.value)}
              />
            </Field>
            <Field id="buyerOrderDate" label="Buyer's order date">
              <Input
                id="buyerOrderDate"
                type="date"
                value={form.buyerOrderDate}
                onChange={(e) => setField("buyerOrderDate", e.target.value)}
              />
            </Field>
            <Field id="dispatchDocNo" label="Dispatch doc number">
              <Input
                id="dispatchDocNo"
                value={form.dispatchDocNo}
                onChange={(e) => setField("dispatchDocNo", e.target.value)}
              />
            </Field>
            <Field id="dispatchedThrough" label="Dispatched through">
              <Input
                id="dispatchedThrough"
                value={form.dispatchedThrough}
                onChange={(e) =>
                  setField("dispatchedThrough", e.target.value)
                }
              />
            </Field>
            <Field
              id="destination"
              label="Destination"
              className="space-y-1.5 sm:col-span-2"
            >
              <Input
                id="destination"
                value={form.destination}
                onChange={(e) => setField("destination", e.target.value)}
              />
            </Field>
            <Field
              id="deliveryNote"
              label="Delivery note"
              className="space-y-1.5 sm:col-span-2"
            >
              <Textarea
                id="deliveryNote"
                value={form.deliveryNote}
                onChange={(e) => setField("deliveryNote", e.target.value)}
                rows={3}
              />
            </Field>
            <Field
              id="termsAndConditions"
              label="Terms and conditions"
              className="space-y-1.5 sm:col-span-2"
            >
              <Textarea
                id="termsAndConditions"
                value={form.termsAndConditions}
                onChange={(e) =>
                  setField("termsAndConditions", e.target.value)
                }
                rows={4}
              />
            </Field>
            <Field
              id="note"
              label="Note"
              className="space-y-1.5 sm:col-span-2"
            >
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
                rows={2}
              />
            </Field>
          </section>

          <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <h2 className="text-base font-semibold sm:col-span-2">
              Consignee (Ship To)
            </h2>
            <Field id="shipToName" label="Name">
              <Input
                id="shipToName"
                value={form.shipToName}
                onChange={(e) => setField("shipToName", e.target.value)}
              />
            </Field>
            <Field id="shipToGSTNo" label="GSTN/UN">
              <Input
                id="shipToGSTNo"
                value={form.shipToGSTNo}
                onChange={(e) => setField("shipToGSTNo", e.target.value)}
              />
            </Field>
            <Field id="shipToState" label="State">
              <Input
                id="shipToState"
                value={form.shipToState}
                onChange={(e) => setField("shipToState", e.target.value)}
              />
            </Field>
            <Field id="shipToStateCode" label="State code">
              <Input
                id="shipToStateCode"
                value={form.shipToStateCode}
                onChange={(e) => setField("shipToStateCode", e.target.value)}
              />
            </Field>
            <Field
              id="shipToAddress"
              label="Address"
              className="space-y-1.5 sm:col-span-2"
            >
              <Textarea
                id="shipToAddress"
                value={form.shipToAddress}
                onChange={(e) => setField("shipToAddress", e.target.value)}
                rows={2}
              />
            </Field>
          </section>

          <section className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <h2 className="text-base font-semibold sm:col-span-2">
              Buyer (Bill To)
            </h2>
            <Field id="billToName" label="Name">
              <Input
                id="billToName"
                value={form.billToName}
                onChange={(e) => setField("billToName", e.target.value)}
              />
            </Field>
            <Field id="billToGSTNo" label="GSTN/UN">
              <Input
                id="billToGSTNo"
                value={form.billToGSTNo}
                onChange={(e) => setField("billToGSTNo", e.target.value)}
              />
            </Field>
            <Field id="billToState" label="State">
              <Input
                id="billToState"
                value={form.billToState}
                onChange={(e) => setField("billToState", e.target.value)}
              />
            </Field>
            <Field id="billToStateCode" label="State code">
              <Input
                id="billToStateCode"
                value={form.billToStateCode}
                onChange={(e) => setField("billToStateCode", e.target.value)}
              />
            </Field>
            <Field id="placeOfSupply" label="Place of supply">
              <Input
                id="placeOfSupply"
                value={form.placeOfSupply}
                onChange={(e) => setField("placeOfSupply", e.target.value)}
              />
            </Field>
            <Field
              id="billToAddress"
              label="Address"
              className="space-y-1.5 sm:col-span-2"
            >
              <Textarea
                id="billToAddress"
                value={form.billToAddress}
                onChange={(e) => setField("billToAddress", e.target.value)}
                rows={2}
              />
            </Field>
          </section>

          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Invoice items</h2>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingItem(null)
                  setItemDialogOpen(true)
                }}
              >
                <PlusIcon className="size-4" />
                Add item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted/50 text-left text-xs">
                  <tr>
                    {[
                      "S.No",
                      "Description",
                      "HSN",
                      "Qty",
                      "Tax %",
                      "Rate Inc",
                      "Amount",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="border-b px-2 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item._id ?? index} className="border-b">
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{item.name || "—"}</td>
                      <td className="px-2 py-2">{item.hsnCode || "—"}</td>
                      <td className="px-2 py-2">{item.qty ?? "—"}</td>
                      <td className="px-2 py-2">{item.taxPercent ?? "—"}</td>
                      <td className="px-2 py-2">
                        {formatAmount(item.priceIncTax)}
                      </td>
                      <td className="px-2 py-2">
                        {formatAmount(item.totalAmount)}
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Edit item"
                            onClick={() => {
                              setEditingItem(item)
                              setItemDialogOpen(true)
                            }}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Delete item"
                            onClick={() => setDeletingItem(item)}
                          >
                            <TrashIcon className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-muted-foreground px-2 py-6 text-center"
                      >
                        No items yet. Add a line item to continue.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          {saveError ? (
            <p className="text-destructive text-sm" role="alert">
              {saveError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save invoice"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/invoice/preview/${invoiceIdParam}`)
              }
            >
              Preview
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/invoice")}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {invoiceIdParam ? (
        <InvoiceItemDialog
          open={itemDialogOpen}
          invoiceId={invoiceIdParam}
          item={editingItem}
          onOpenChange={setItemDialogOpen}
          onSaved={reload}
        />
      ) : null}

      {deletingItem ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm space-y-4 rounded-lg border p-4 shadow-lg">
            <h3 className="font-semibold">Delete item?</h3>
            <p className="text-muted-foreground text-sm">
              Remove &quot;{deletingItem.name || "this item"}&quot; from the
              invoice.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingItem(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeleteItem()}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
