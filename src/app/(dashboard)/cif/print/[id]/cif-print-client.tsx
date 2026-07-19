"use client"

import { useEffect } from "react"
import { useLazyQuery } from "@apollo/client/react"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_SINGLE_CIF,
  crossSellLabels,
  studioName,
  stylistName,
  type GetSingleCifData,
  type GetSingleCifVars,
} from "@/lib/apollo/queries/cif"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-2 border-b py-2 text-sm last:border-0">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd>{value ?? "—"}</dd>
    </div>
  )
}

export function CifPrintClient() {
  const params = useParams<{ id: string }>()
  const cifId = params.id

  const [fetchCif, { data, loading, error }] = useLazyQuery<
    GetSingleCifData,
    GetSingleCifVars
  >(GET_SINGLE_CIF, { fetchPolicy: "network-only" })

  useEffect(() => {
    if (!cifId) return
    void fetchCif({
      variables: { getSingleCustomerInformationId: cifId },
    })
  }, [cifId, fetchCif])

  const cif = data?.getSingleCustomerInformation

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/cif" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to CIF
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => window.print()}
          disabled={!cif}
        >
          <PrinterIcon className="size-3.5" />
          Print
        </Button>
      </div>

      {loading ? <Skeleton className="h-96 w-full" /> : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load CIF for print.
        </p>
      ) : null}

      {cif ? (
        <article className="bg-card rounded-xl border p-6 shadow-sm print:border-0 print:shadow-none">
          <header className="mb-6 border-b pb-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Customer Information Form
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Form #{cif.cifSerialNumber ?? "—"} ·{" "}
              {formatDate(cif.createdDate?.timestamp)}
            </p>
          </header>

          <dl>
            <Row
              label="Name"
              value={`${cif.firstName ?? ""} ${cif.lastName ?? ""}`.trim()}
            />
            <Row
              label="Phone"
              value={
                cif.phone
                  ? `+${cif.countryCode ?? ""} ${cif.phone}`.trim()
                  : null
              }
            />
            <Row label="Email" value={cif.email} />
            <Row label="Gender" value={cif.gender} />
            <Row label="Status" value={cif.customerInfoStatus} />
            <Row label="Studio" value={studioName(cif)} />
            <Row label="Stylist" value={stylistName(cif)} />
            <Row label="Looking for" value={cif.lookingFor} />
            <Row label="Event date" value={formatDate(cif.eventDate?.timestamp)} />
            <Row
              label="Follow-up"
              value={formatDate(cif.followUpDate?.timestamp)}
            />
            <Row label="Rating" value={cif.rating} />
            <Row
              label="Lookbook shared"
              value={cif.isLookBookShared ? "Yes" : "No"}
            />
            <Row label="Cross-sell" value={crossSellLabels(cif)} />
            <Row label="Note" value={cif.note} />
            <Row label="Cross-sell note" value={cif.crossSellingNote} />
            <Row label="Sales remark" value={cif.salesTeamRemarksNote} />
          </dl>

          {(cif.occasionDetails?.length ?? 0) > 0 ? (
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-semibold tracking-tight">
                Occasions
              </h2>
              <div className="space-y-3">
                {cif.occasionDetails?.map((occ, index) => (
                  <div
                    key={`${occ.occasion ?? "occ"}-${index}`}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <p>
                      <span className="font-medium">Occasion: </span>
                      {occ.occasion ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Budget: </span>
                      {occ.budget ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Quote: </span>
                      {occ.priceQuote ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Note: </span>
                      {occ.outfitsNote ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      ) : null}
    </div>
  )
}
