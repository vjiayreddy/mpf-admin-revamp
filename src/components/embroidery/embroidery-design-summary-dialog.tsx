"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLazyQuery } from "@apollo/client/react"
import {
  DownloadIcon,
  FilePenIcon,
  FileTextIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { DesignSummaryBootas } from "@/components/embroidery/design-summary/bootas"
import { DesignSummaryHeader } from "@/components/embroidery/design-summary/header"
import { DesignSummaryImages } from "@/components/embroidery/design-summary/images"
import { DesignSummaryMaterials } from "@/components/embroidery/design-summary/materials"
import { DesignSummaryMonograms } from "@/components/embroidery/design-summary/monograms"
import { DesignSummaryWorkDetails } from "@/components/embroidery/design-summary/work-details"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_EMBROIDERY_BY_ID,
  type EmbroideryDetail,
  type GetEmbroideryByIdData,
  type GetEmbroideryByIdVars,
} from "@/lib/apollo/queries/embroidery"
import {
  exportEmbroideryDesignPdf,
  type DesignPdfAction,
} from "@/lib/embroidery/download-design-pdf"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

/** Optional order-line context to enrich draft embDesignDetails (legacy formData/orderItem). */
export type EmbroideryDesignSummaryContext = {
  storeOrderProductName?: string | null
  storeOrderProductNumber?: string | number | null
  fabricImage?: string | null
  referenceImage?: string | null
  fabricImageNote?: string | null
  referenceImageNote?: string | null
  fabricName?: string | null
  fabricColor?: string | null
  customerId?: string | null
  customerName?: string | null
  storeOrderNo?: string | number | null
}

type EmbroideryDesignSummaryDialogProps = {
  embroideryId?: string | null
  embJsonString?: string | null
  context?: EmbroideryDesignSummaryContext | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type NavItem = { id: string; label: string }

function parseDraftDetail(
  embJsonString: string | null | undefined,
  context?: EmbroideryDesignSummaryContext | null
): EmbroideryDetail | null {
  const raw = embJsonString?.trim()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const productNumber =
      context?.storeOrderProductNumber != null
        ? String(context.storeOrderProductNumber)
        : undefined
    return {
      _id: String(parsed._id ?? ""),
      ...parsed,
      storeOrderProductName:
        (parsed.storeOrderProductName as string | undefined) ||
        context?.storeOrderProductName ||
        null,
      storeOrderProductNumber:
        (parsed.storeOrderProductNumber as string | undefined) ||
        productNumber ||
        null,
      fabricImage:
        (parsed.fabricImage as string | undefined) ||
        context?.fabricImage ||
        null,
      referenceImage:
        (parsed.referenceImage as string | undefined) ||
        context?.referenceImage ||
        null,
      fabricImageNote:
        (parsed.fabricImageNote as string | undefined) ||
        context?.fabricImageNote ||
        null,
      referenceImageNote:
        (parsed.referenceImageNote as string | undefined) ||
        context?.referenceImageNote ||
        null,
      fabricName:
        (parsed.fabricName as string | undefined) ||
        context?.fabricName ||
        null,
      fabricColor:
        (parsed.fabricColor as string | undefined) ||
        context?.fabricColor ||
        null,
      customerId:
        (parsed.customerId as string | undefined) ||
        context?.customerId ||
        null,
      customerName:
        (parsed.customerName as string | undefined) ||
        context?.customerName ||
        null,
      storeOrderNo:
        (parsed.storeOrderNo as string | undefined) ||
        (context?.storeOrderNo != null ? String(context.storeOrderNo) : null),
    } as EmbroideryDetail
  } catch {
    return null
  }
}

function hasBootaMetrics(row: EmbroideryDetail) {
  return (row.bootas ?? []).some(
    (b) =>
      Number(b?.size1H) > 0 ||
      Number(b?.size1V) > 0 ||
      Number(b?.backSizeH) > 0 ||
      Number(b?.backSizeV) > 0
  )
}

export function EmbroideryDesignSummaryDialog({
  embroideryId,
  embJsonString,
  context,
  open,
  onOpenChange,
}: EmbroideryDesignSummaryDialogProps) {
  const router = useRouter()
  const [pdfBusy, setPdfBusy] = useState(false)
  const [activeSection, setActiveSection] = useState("emb-summary-order")
  const scrollRef = useRef<HTMLDivElement>(null)

  const embId = embroideryId?.trim() || null
  const isDraft = !embId

  const [fetchDetail, { data, loading, error }] = useLazyQuery<
    GetEmbroideryByIdData,
    GetEmbroideryByIdVars
  >(GET_EMBROIDERY_BY_ID, { fetchPolicy: "network-only" })

  useEffect(() => {
    if (!open || !embId) return
    setPdfBusy(false)
    void fetchDetail({ variables: { id: embId } })
  }, [open, embId, fetchDetail])

  useEffect(() => {
    if (!open) {
      setActiveSection("emb-summary-order")
      setPdfBusy(false)
    }
  }, [open])

  const draftRow = useMemo(
    () =>
      open && !embId ? parseDraftDetail(embJsonString, context) : null,
    [open, embId, embJsonString, context]
  )

  const draftParseFailed =
    open &&
    !embId &&
    Boolean(embJsonString?.trim()) &&
    draftRow == null

  const fetched = data?.getEmbroideryById
  const fetchedMatches =
    Boolean(embId) &&
    Boolean(fetched) &&
    (fetched?._id === embId || !fetched?._id)
  const row: EmbroideryDetail | undefined = fetchedMatches
    ? fetched
    : (draftRow ?? undefined)

  const navItems = useMemo((): NavItem[] => {
    if (!row) return []
    const items: NavItem[] = [
      { id: "emb-summary-order", label: "Order" },
      { id: "emb-summary-images", label: "Images" },
      { id: "emb-summary-work", label: "Work" },
    ]
    if (hasBootaMetrics(row)) {
      items.push({ id: "emb-summary-bootas", label: "Bootas" })
    }
    if ((row.monograms?.length ?? 0) > 0) {
      items.push({ id: "emb-summary-monograms", label: "Monograms" })
    }
    if ((row.workMaterialSamples?.length ?? 0) > 0) {
      items.push({ id: "emb-summary-materials", label: "Materials" })
    }
    return items
  }, [row])

  useEffect(() => {
    const root = scrollRef.current
    if (!open || !root || !row) return

    const sections = navItems
      .map((item) => root.querySelector<HTMLElement>(`#${item.id}`))
      .filter((el): el is HTMLElement => Boolean(el))

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]?.target?.id
        if (top) setActiveSection(top)
      },
      { root, rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] }
    )

    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [open, row, navItems])

  const scrollToSection = (id: string) => {
    const root = scrollRef.current
    const el = root?.querySelector<HTMLElement>(`#${id}`)
    if (!root || !el) return
    const rootRect = root.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = root.scrollTop + (elRect.top - rootRect.top) - 12
    root.scrollTo({ top, behavior: "smooth" })
    setActiveSection(id)
  }

  const runPdfExport = async (action: DesignPdfAction) => {
    if (!row || pdfBusy) return
    setPdfBusy(true)
    try {
      await exportEmbroideryDesignPdf(row, action)
      notify.success(
        action === "open" ? "PDF opened in a new tab" : "PDF downloaded"
      )
    } catch (err) {
      notify.fromError(err, "Failed to generate PDF")
    } finally {
      setPdfBusy(false)
    }
  }

  const productTitle =
    row?.storeOrderProductName?.trim() ||
    row?.embroideryReqNo ||
    (isDraft ? "Draft embroidery" : "Embroidery design")

  const subtitle = row
    ? [
        row.embroideryReqNo && `Req ${row.embroideryReqNo}`,
        row.storeOrderProductNumber,
        row.fabricName && `Fabric ${row.fabricName}`,
        row.fabricColor,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Review design details, then download or open a PDF to print."

  const showLoading = Boolean(embId) && loading && !row
  const pdfDisabled = !row || showLoading || pdfBusy

  const sectionIndexes = useMemo(() => {
    if (!row) {
      return { boota: undefined as number | undefined, monogram: undefined as number | undefined, material: undefined as number | undefined }
    }
    let cursor = 4
    const boota = hasBootaMetrics(row) ? cursor++ : undefined
    const monogram = (row.monograms?.length ?? 0) > 0 ? cursor++ : undefined
    const material =
      (row.workMaterialSamples?.length ?? 0) > 0 ? cursor++ : undefined
    return { boota, monogram, material }
  }, [row])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(96vh,58rem)] w-[calc(100%-1rem)] max-w-6xl flex-col gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="bg-background/95 supports-backdrop-filter:bg-background/85 shrink-0 border-b px-4 py-3.5 backdrop-blur sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {isDraft ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                  >
                    Draft
                  </Badge>
                ) : (
                  <Badge variant="secondary">Saved design</Badge>
                )}
                {row?.embStatus ? (
                  <Badge variant="outline">{row.embStatus}</Badge>
                ) : null}
              </div>
              <DialogTitle className="truncate text-base sm:text-lg">
                {productTitle}
              </DialogTitle>
              <DialogDescription className="line-clamp-2 text-xs sm:text-sm">
                {subtitle}
              </DialogDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {row?._id ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    onOpenChange(false)
                    router.push(
                      `/embroidery/form?id=${encodeURIComponent(row._id)}`
                    )
                  }}
                >
                  <FilePenIcon className="size-3.5" />
                  Update form
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8"
                disabled={pdfDisabled}
                onClick={() => void runPdfExport("open")}
              >
                <FileTextIcon className="size-3.5" />
                Open PDF
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8"
                disabled={pdfDisabled}
                onClick={() => void runPdfExport("download")}
              >
                {pdfBusy ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <DownloadIcon className="size-3.5" />
                )}
                {pdfBusy ? "Generating…" : "Download"}
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-8"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>

          {navItems.length > 0 ? (
            <nav
              aria-label="Design sections"
              className="mt-3 -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    activeSection === item.id
                      ? "border-foreground/20 bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : null}
        </DialogHeader>

        <div
          ref={scrollRef}
          className="from-muted/50 via-muted/30 to-background min-h-0 flex-1 overflow-y-auto bg-gradient-to-b"
        >
          {showLoading ? (
            <div className="mx-auto flex max-w-5xl flex-col gap-4 p-5 sm:p-6">
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : null}

          {error && embId ? (
            <div className="mx-auto max-w-5xl p-6" role="alert">
              <div className="border-destructive/30 bg-destructive/5 rounded-2xl border px-4 py-3 text-sm">
                Failed to load embroidery design details.
              </div>
            </div>
          ) : null}

          {draftParseFailed ? (
            <div className="mx-auto max-w-5xl p-6" role="alert">
              <div className="border-destructive/30 bg-destructive/5 rounded-2xl border px-4 py-3 text-sm">
                Could not parse embroidery draft details.
              </div>
            </div>
          ) : null}

          {row && !showLoading ? (
            <div className="mx-auto flex max-w-5xl flex-col gap-8 p-5 pb-10 sm:p-6 sm:pb-12">
              <DesignSummaryHeader row={row} isDraft={isDraft} />
              <DesignSummaryImages row={row} />
              <DesignSummaryWorkDetails row={row} />
              <DesignSummaryBootas
                bootas={row.bootas}
                sectionIndex={sectionIndexes.boota}
              />
              <DesignSummaryMonograms
                monograms={row.monograms}
                sectionIndex={sectionIndexes.monogram}
              />
              <DesignSummaryMaterials
                samples={row.workMaterialSamples}
                sectionIndex={sectionIndexes.material}
              />
              <p className="text-muted-foreground pb-1 text-center text-[11px] tracking-wide">
                MyPerfectFit · Embroidery design summary
              </p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
