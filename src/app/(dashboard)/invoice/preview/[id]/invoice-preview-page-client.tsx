"use client"

import { useEffect } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { useParams } from "next/navigation"

import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_SINGLE_INVOICE_BY_ID,
  type GetSingleInvoiceByIdData,
  type GetSingleInvoiceByIdVars,
} from "@/lib/apollo/queries/invoice"

export function InvoicePreviewPageClient() {
  const params = useParams<{ id: string }>()
  const invoiceId = params?.id

  const [fetchInvoice, { data, loading, error }] = useLazyQuery<
    GetSingleInvoiceByIdData,
    GetSingleInvoiceByIdVars
  >(GET_SINGLE_INVOICE_BY_ID, {
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (invoiceId) {
      void fetchInvoice({ variables: { invoiceId } })
    }
  }, [invoiceId, fetchInvoice])

  const invoice = data?.getSingleInvoiceById

  return (
    <div className="flex flex-col gap-4">
      <div className="print:hidden flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Invoice preview
        </h1>
        <p className="text-muted-foreground text-sm">
          {invoice?.invoiceId
            ? `Invoice ${invoice.invoiceId}`
            : "Loading tax invoice…"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load invoice. Check the ID and your session.
        </p>
      ) : null}

      {!loading && !error && invoice ? (
        <InvoicePreview data={invoice} />
      ) : null}

      {!loading && !error && !invoice && invoiceId ? (
        <p className="text-muted-foreground text-sm">Invoice not found.</p>
      ) : null}
    </div>
  )
}
