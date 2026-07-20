"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  EMB_STATUS_OPTIONS,
  MARKING_STATUS_OPTIONS,
  PAPER_STATUS_OPTIONS,
  QC_STATUS_OPTIONS,
  SAMPLE_STATUS_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
} from "@/config/embroidery-status"
import { notify } from "@/lib/notify"
import {
  GET_EMBROIDERY_BY_ID,
  SAVE_EMBROIDERY,
  type GetEmbroideryByIdData,
  type GetEmbroideryByIdVars,
  type SaveEmbroideryData,
  type SaveEmbroideryVars,
} from "@/lib/apollo/queries/embroidery"
import {
  firstName,
  formatEmbroideryDate,
} from "@/lib/embroidery/format"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
)

function OpsFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")?.trim() || ""

  const [fetchDetail, { data, loading, error }] = useLazyQuery<
    GetEmbroideryByIdData,
    GetEmbroideryByIdVars
  >(GET_EMBROIDERY_BY_ID, { fetchPolicy: "network-only" })

  const [saveEmbroidery, { loading: saving }] = useMutation<
    SaveEmbroideryData,
    SaveEmbroideryVars
  >(SAVE_EMBROIDERY)

  const detail = data?.getEmbroideryById

  const [embStatus, setEmbStatus] = useState("")
  const [markingStatus, setMarkingStatus] = useState("")
  const [sampleStatus, setSampleStatus] = useState("")
  const [paperStatus, setPaperStatus] = useState("")
  const [approvalStatus, setApprovalStatus] = useState("")
  const [qcStatus, setQcStatus] = useState("")
  const [workshopName, setWorkshopName] = useState("")
  const [estHrs, setEstHrs] = useState("")
  const [workHrs, setWorkHrs] = useState("")
  const [price, setPrice] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [embRemark, setEmbRemark] = useState("")
  const [note, setNote] = useState("")
  const [paperNo, setPaperNo] = useState("")

  useEffect(() => {
    if (!id) return
    void fetchDetail({ variables: { id } })
  }, [id, fetchDetail])

  useEffect(() => {
    if (!detail) return
    setEmbStatus(detail.embStatus ?? "")
    setMarkingStatus(detail.markingStatus ?? "")
    setSampleStatus(detail.sampleStatus ?? "")
    setPaperStatus(detail.paperStatus ?? "")
    setApprovalStatus(detail.approvalStatus ?? "")
    setQcStatus(detail.qcStatus ?? "")
    setWorkshopName(detail.workshopName ?? "")
    setEstHrs(detail.estHrs != null ? String(detail.estHrs) : "")
    setWorkHrs(detail.workHrs != null ? String(detail.workHrs) : "")
    setPrice(detail.price != null ? String(detail.price) : "")
    setEstimatedCost(
      detail.estimatedCost != null ? String(detail.estimatedCost) : ""
    )
    setEmbRemark(detail.embRemark ?? "")
    setNote(detail.note ?? "")
    setPaperNo(detail.paperNo ?? "")
  }, [detail])

  const title = useMemo(() => {
    if (!detail) return "Update embroidery"
    return `Update embroidery · ${detail.embroideryReqNo || detail._id}`
  }, [detail])

  async function onSave() {
    if (!id) return
    try {
      await saveEmbroidery({
        variables: {
          id,
          body: {
            embStatus: embStatus || null,
            markingStatus: markingStatus || null,
            sampleStatus: sampleStatus || null,
            paperStatus: paperStatus || null,
            approvalStatus: approvalStatus || null,
            qcStatus: qcStatus || null,
            workshopName: workshopName || null,
            estHrs: estHrs ? Number(estHrs) : null,
            workHrs: workHrs ? Number(workHrs) : null,
            price: price ? Number(price) : null,
            estimatedCost: estimatedCost ? Number(estimatedCost) : null,
            embRemark: embRemark || null,
            note: note || null,
            paperNo: paperNo || null,
          },
        },
      })
      notify.success("Embroidery updated")
      void fetchDetail({ variables: { id } })
    } catch (err) {
      notify.fromError(err)
    }
  }

  if (!id) {
    return (
      <p className="text-destructive text-sm" role="alert">
        Missing embroidery id. Open this page from the list Product No link.
      </p>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">
            Update workshop statuses, hours, and costs for this embroidery job.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {loading && !detail ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : null}
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          Failed to load embroidery details.
        </p>
      ) : null}

      {detail ? (
        <>
          <section className="bg-card rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold">Summary</h2>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Product</dt>
                <dd>{detail.storeOrderProductNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Customer</dt>
                <dd>{detail.customerName || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stylist</dt>
                <dd>{firstName(detail.stylist)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Order date</dt>
                <dd>{formatEmbroideryDate(detail.orderDate)}</dd>
              </div>
            </dl>
          </section>

          <section className="bg-card grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-emb-status">Emb status</Label>
              <select
                id="ops-emb-status"
                className={selectClass}
                value={embStatus}
                onChange={(e) => setEmbStatus(e.target.value)}
              >
                <option value="">—</option>
                {EMB_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-marking">Marking status</Label>
              <select
                id="ops-marking"
                className={selectClass}
                value={markingStatus}
                onChange={(e) => setMarkingStatus(e.target.value)}
              >
                <option value="">—</option>
                {MARKING_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-sample">Sample status</Label>
              <select
                id="ops-sample"
                className={selectClass}
                value={sampleStatus}
                onChange={(e) => setSampleStatus(e.target.value)}
              >
                <option value="">—</option>
                {SAMPLE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-paper">Paper status</Label>
              <select
                id="ops-paper"
                className={selectClass}
                value={paperStatus}
                onChange={(e) => setPaperStatus(e.target.value)}
              >
                <option value="">—</option>
                {PAPER_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-approval">Approval status</Label>
              <select
                id="ops-approval"
                className={selectClass}
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value)}
              >
                <option value="">—</option>
                {APPROVAL_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-qc">QC status</Label>
              <select
                id="ops-qc"
                className={selectClass}
                value={qcStatus}
                onChange={(e) => setQcStatus(e.target.value)}
              >
                <option value="">—</option>
                {QC_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="ops-workshop">Workshop name</Label>
              <Input
                id="ops-workshop"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-est-hrs">Est. hours</Label>
              <Input
                id="ops-est-hrs"
                type="number"
                value={estHrs}
                onChange={(e) => setEstHrs(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-work-hrs">Work hours</Label>
              <Input
                id="ops-work-hrs"
                type="number"
                value={workHrs}
                onChange={(e) => setWorkHrs(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-price">Price</Label>
              <Input
                id="ops-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-cost">Estimated cost</Label>
              <Input
                id="ops-cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ops-paper-no">Paper no</Label>
              <Input
                id="ops-paper-no"
                value={paperNo}
                onChange={(e) => setPaperNo(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="ops-remark">Emb remark</Label>
              <Input
                id="ops-remark"
                value={embRemark}
                onChange={(e) => setEmbRemark(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="ops-note">Note</Label>
              <Input
                id="ops-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/embroidery")}
            >
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={() => void onSave()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function EmbroideryOpsFormClient() {
  return (
    <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
      <OpsFormInner />
    </Suspense>
  )
}
