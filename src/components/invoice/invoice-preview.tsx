"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import { PencilIcon, PrinterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { InvoiceDetail } from "@/lib/apollo/queries/invoice"
import {
  formatAmount,
  formatInvoiceDate,
  formatRupees,
} from "@/lib/invoice/format"

type InvoicePreviewProps = {
  data: InvoiceDetail
}

function MetaLine({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <p className="text-[10px] leading-relaxed">
      <span className="font-semibold">{label}:</span> {value ?? "NA"}
    </p>
  )
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)

  const paymentModes =
    data.paymentDetails
      ?.map((p) => p.modeOfPayment)
      .filter(Boolean)
      .join(", ") || "NA"

  const handlePrint = () => {
    window.print()
  }

  const isIgst = !!data.taxDetails?.isIgst
  const items = data.items ?? []
  const hsnSummary = data.taxDetails?.hsnSummary ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="print:hidden flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            router.push(`/invoice/form?invoiceId=${data._id}`)
          }
        >
          <PencilIcon className="size-4" />
          Edit
        </Button>
        <Button type="button" variant="default" onClick={handlePrint}>
          <PrinterIcon className="size-4" />
          Print
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/invoice")}
        >
          Back to list
        </Button>
      </div>

      <div
        ref={printRef}
        className="bg-background print:border-0 rounded-lg border p-4 text-sm print:p-0"
      >
        <h2 className="mb-3 text-center text-base font-bold">Tax Invoice</h2>
        <hr className="mb-3" />

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-[10px]">
            <p className="font-bold">
              {data.companyDetails?.name ||
                "MPF Clothing Collections, Pvt. Ltd"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {data.companyDetails?.address ||
                "1st Floor, Plot No.1108, Road No:55, Opp.Peddammagudi Entrance, CBI Colony, Jubilee Hills, Hyderabad, Telangana, 500033."}
            </p>
            <p>
              <span className="font-semibold">GSTN/UN:</span>{" "}
              {data.companyDetails?.gstin || "36AAKCM7229E1ZC"}
            </p>
            <p>
              <span className="font-semibold">State Name:</span>{" "}
              {data.companyDetails?.state || "Telangana"} |{" "}
              <span className="font-semibold">Code:</span>{" "}
              {data.companyDetails?.stateCode || "36"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {data.companyDetails?.email || "accounts@myperfectfit.co.in"}
            </p>
          </div>
          <div className="space-y-0.5">
            <MetaLine label="Invoice No" value={data.invoiceId} />
            <MetaLine
              label="Invoice Date"
              value={formatInvoiceDate(data.invoiceDate?.timestamp)}
            />
            <MetaLine label="Delivery Note" value={data.deliveryNote} />
            <MetaLine label="Mode/Terms of Payment" value={paymentModes} />
            <MetaLine label="Reference No" value={data.buyerOrderNo} />
            <MetaLine
              label="Customer Id"
              value={
                data.otherReferences || data.customerDetails?.customerId
              }
            />
            <MetaLine label="Buyer's Order No" value={data.buyerOrderNo} />
            <MetaLine
              label="Buyer's Order Date"
              value={formatInvoiceDate(data.buyerOrderDate?.timestamp)}
            />
            <MetaLine label="Dispatch Doc No" value={data.dispatchDocNo} />
            <MetaLine
              label="Dispatched through"
              value={data.dispatchedThrough}
            />
            <MetaLine
              label="Destination"
              value={data.destination || "Hyderabad, Telangana"}
            />
          </div>
        </div>

        <hr className="mb-3" />

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-[10px]">
            <p className="text-xs font-bold">Consignee (Ship To)</p>
            <p className="font-semibold">
              {data.addressDetails?.shipToName || "—"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {data.addressDetails?.shipToAddress || "—"}
            </p>
            <p>
              <span className="font-semibold">GSTN/UN:</span>{" "}
              {data.addressDetails?.shipToGSTNo || "—"}
            </p>
            <p>
              <span className="font-semibold">State Name:</span>{" "}
              {data.addressDetails?.shipToState || "—"} |{" "}
              <span className="font-semibold">Code:</span>{" "}
              {data.addressDetails?.shipToStateCode || "—"}
            </p>
          </div>
          <div className="space-y-1 text-[10px]">
            <p className="text-xs font-bold">Buyer (Bill To)</p>
            <p className="font-semibold">
              {data.addressDetails?.billToName || "—"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {data.addressDetails?.billToAddress || "—"}
            </p>
            <p>
              <span className="font-semibold">GSTN/UN:</span>{" "}
              {data.addressDetails?.billToGSTNo || "—"}
            </p>
            <p>
              <span className="font-semibold">State Name:</span>{" "}
              {data.addressDetails?.billToState || "—"} |{" "}
              <span className="font-semibold">Code:</span>{" "}
              {data.addressDetails?.billToStateCode || "—"}
            </p>
            <p>
              <span className="font-semibold">Place of Supply:</span>{" "}
              {data.addressDetails?.placeOfSupply || "—"}
            </p>
          </div>
        </div>

        <hr className="mb-3" />

        <p className="mb-2 text-sm font-semibold">Invoice Items</p>
        <div className="mb-4 overflow-x-auto">
          <table className="w-full border-collapse border text-[10px]">
            <thead className="bg-muted/50">
              <tr>
                {[
                  "S.No",
                  "Description",
                  "HSN/SAC",
                  "Qty",
                  "Tax %",
                  "Rate (Inc)",
                  "Rate (Exc)",
                  "Disc",
                  "Disc Amt",
                  "Tax Amt",
                  "Amount",
                ].map((h) => (
                  <th key={h} className="border px-1.5 py-1 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item._id ?? index}>
                  <td className="border px-1.5 py-1">{index + 1}</td>
                  <td className="border px-1.5 py-1">{item.name || "—"}</td>
                  <td className="border px-1.5 py-1">{item.hsnCode || "—"}</td>
                  <td className="border px-1.5 py-1">{item.qty ?? "—"}</td>
                  <td className="border px-1.5 py-1">
                    {item.taxPercent ?? "—"}
                  </td>
                  <td className="border px-1.5 py-1">
                    {formatAmount(item.priceIncTax)}
                  </td>
                  <td className="border px-1.5 py-1">
                    {formatAmount(item.priceExcTax)}
                  </td>
                  <td className="border px-1.5 py-1">
                    {item.discount ?? "—"}
                    {item.isPercent ? "%" : ""}
                  </td>
                  <td className="border px-1.5 py-1">
                    {formatAmount(item.discountAmt)}
                  </td>
                  <td className="border px-1.5 py-1">
                    {formatAmount(item.taxAmount)}
                  </td>
                  <td className="border px-1.5 py-1">
                    {formatAmount(item.totalAmount)}
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="text-muted-foreground border px-1.5 py-3 text-center"
                  >
                    No items
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <p className="mb-2 text-sm font-semibold">Invoice Summary</p>
        <div className="mb-3 overflow-x-auto">
          <table className="w-full border-collapse border text-[10px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="border px-1.5 py-1" rowSpan={2}>
                  HSN/SAC
                </th>
                <th className="border px-1.5 py-1" rowSpan={2}>
                  Taxable Value
                </th>
                <th
                  className="border px-1.5 py-1"
                  colSpan={isIgst ? 2 : 4}
                >
                  Tax
                </th>
                <th className="border px-1.5 py-1" rowSpan={2}>
                  Total Tax Amount
                </th>
              </tr>
              <tr>
                {isIgst ? (
                  <>
                    <th className="border px-1.5 py-1">IGST Rate</th>
                    <th className="border px-1.5 py-1">IGST Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border px-1.5 py-1">CGST Rate</th>
                    <th className="border px-1.5 py-1">CGST Amount</th>
                    <th className="border px-1.5 py-1">SGST Rate</th>
                    <th className="border px-1.5 py-1">SGST Amount</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {hsnSummary.map((row, index) => (
                <tr key={`${row.hsnCode}-${index}`}>
                  <td className="border px-1.5 py-1 text-center">
                    {row.hsnCode || "—"}
                  </td>
                  <td className="border px-1.5 py-1 text-center">
                    {formatAmount(row.taxableValue)}
                  </td>
                  {isIgst ? (
                    <>
                      <td className="border px-1.5 py-1 text-center">
                        {row.igstRate ?? "—"}
                      </td>
                      <td className="border px-1.5 py-1 text-center">
                        {formatAmount(row.igstAmount)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border px-1.5 py-1 text-center">
                        {row.cgstRate ?? "—"}
                      </td>
                      <td className="border px-1.5 py-1 text-center">
                        {formatAmount(row.cgstAmount)}
                      </td>
                      <td className="border px-1.5 py-1 text-center">
                        {row.sgstRate ?? "—"}
                      </td>
                      <td className="border px-1.5 py-1 text-center">
                        {formatAmount(row.sgstAmount)}
                      </td>
                    </>
                  )}
                  <td className="border px-1.5 py-1 text-center">
                    {formatAmount(row.taxAmount)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="border px-1.5 py-1 text-center">Total</td>
                <td className="border px-1.5 py-1 text-center">
                  {formatAmount(data.taxDetails?.totalTaxableValue)}
                </td>
                {isIgst ? (
                  <>
                    <td className="border px-1.5 py-1" />
                    <td className="border px-1.5 py-1 text-center">
                      {formatAmount(data.taxDetails?.totalIgstAmount)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border px-1.5 py-1" />
                    <td className="border px-1.5 py-1 text-center">
                      {formatAmount(data.taxDetails?.totalCgstAmount)}
                    </td>
                    <td className="border px-1.5 py-1" />
                    <td className="border px-1.5 py-1 text-center">
                      {formatAmount(data.taxDetails?.totalSgstAmount)}
                    </td>
                  </>
                )}
                <td className="border px-1.5 py-1 text-center">
                  {formatAmount(data.taxDetails?.totalTaxAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-4 text-[10px] font-semibold">
          Tax Amount (in words): ₹{data.taxAmountInWords || "—"}
        </p>
        <p className="mb-4 text-sm font-semibold">
          Grand Total: {formatRupees(data.grandTotal)}
          {data.inWords ? (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              ({data.inWords})
            </span>
          ) : null}
        </p>

        <hr className="mb-3" />

        <div className="mb-4 flex justify-between gap-4 text-[10px]">
          <div>
            <p className="font-semibold">Company&apos;s Bank Details:</p>
            <p>
              A/c Holder&apos;s Name:{" "}
              {data.companyDetails?.bankDetails?.holderName ||
                "MPF Collections Pvt Ltd"}
            </p>
            <p>
              Bank Name:{" "}
              {data.companyDetails?.bankDetails?.bankName || "IndusInd Bank"}
            </p>
            <p>
              A/c No:{" "}
              {data.companyDetails?.bankDetails?.AccNo || "205021501216"}
            </p>
            <p>
              IFSC:{" "}
              {data.companyDetails?.bankDetails?.ifscCode || "INDB0000320"}
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold">
              For MPF Collections Private Limited
            </p>
            <p className="mt-16">Authorized Signatory</p>
          </div>
        </div>

        <p className="text-[10px]">
          <span className="font-semibold">Declaration:</span> We declare that
          this invoice shows the actual price of the goods described and that
          all particulars are true and correct.
        </p>

        {data.termsAndConditions ? (
          <div className="mt-4 text-[10px]">
            <p className="mb-1 font-semibold">Terms and Conditions</p>
            <p className="whitespace-pre-wrap">{data.termsAndConditions}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
