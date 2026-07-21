"use client"

import { useEffect, useState } from "react"
import { Trash2Icon, UploadIcon } from "lucide-react"

import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TRIAL_IMAGE_UPLOAD_PATH } from "@/config/trial-filters"
import type { OrderTrialProductInput } from "@/lib/apollo/queries/trial"
import { uploadUrlsFromResult } from "@/lib/uppy/config"

type TrialAssetsFormProps = {
  open: boolean
  product: OrderTrialProductInput | null
  onClose: () => void
  onSave: (product: OrderTrialProductInput) => void
}

export function TrialAssetsForm({
  open,
  product,
  onClose,
  onSave,
}: TrialAssetsFormProps) {
  const [draft, setDraft] = useState<OrderTrialProductInput | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadKind, setUploadKind] = useState<"images" | "fabric" | "video">(
    "images"
  )

  useEffect(() => {
    if (open && product) {
      setDraft({
        ...product,
        trialImageLinks: product.trialImageLinks ?? [],
      })
    }
    if (!open) setDraft(null)
  }, [open, product])

  const images = draft?.trialImageLinks ?? []

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose()
        }}
      >
        <DialogContent
          className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle>
              Trail assets — {draft?.name || "Product"}
            </DialogTitle>
            <DialogDescription>
              Item {draft?.itemNumber ?? "—"}
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Trail images</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      setUploadKind("images")
                      setUploadOpen(true)
                    }}
                  >
                    <UploadIcon className="size-3.5" />
                    Upload
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {images.length === 0 ? (
                    <span className="text-muted-foreground text-xs">
                      No images
                    </span>
                  ) : (
                    images.map((url) => (
                      <div
                        key={url}
                        className="relative size-16 overflow-hidden rounded-md border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-0.5 right-0.5 rounded bg-black/60 p-0.5 text-white"
                          onClick={() =>
                            setDraft((d) =>
                              d
                                ? {
                                    ...d,
                                    trialImageLinks: (
                                      d.trialImageLinks ?? []
                                    ).filter((u) => u !== url),
                                  }
                                : d
                            )
                          }
                          aria-label="Remove image"
                        >
                          <Trash2Icon className="size-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Fabric image</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      setUploadKind("fabric")
                      setUploadOpen(true)
                    }}
                  >
                    <UploadIcon className="size-3.5" />
                    Upload
                  </Button>
                </div>
                {draft.fabricImageLink ? (
                  <div className="relative inline-block size-16 overflow-hidden rounded-md border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draft.fabricImageLink}
                      alt=""
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0.5 right-0.5 rounded bg-black/60 p-0.5 text-white"
                      onClick={() =>
                        setDraft((d) =>
                          d ? { ...d, fabricImageLink: null } : d
                        )
                      }
                      aria-label="Remove fabric"
                    >
                      <Trash2Icon className="size-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    No fabric image
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trial-video-url">Trail video URL</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      setUploadKind("video")
                      setUploadOpen(true)
                    }}
                  >
                    <UploadIcon className="size-3.5" />
                    Upload
                  </Button>
                </div>
                <Input
                  id="trial-video-url"
                  value={draft.trialVideoLink || ""}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, trialVideoLink: e.target.value || null } : d
                    )
                  }
                  placeholder="https://…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trial-product-note">Trail note</Label>
                <Textarea
                  id="trial-product-note"
                  rows={3}
                  value={draft.trialNote || ""}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, trialNote: e.target.value } : d
                    )
                  }
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!draft}
              onClick={() => {
                if (!draft) return
                onSave(draft)
                onClose()
              }}
            >
              Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {uploadOpen ? (
        <UppyFileUpload
          open
          uppyId={`trial-assets-${uploadKind}`}
          uploadPath={TRIAL_IMAGE_UPLOAD_PATH}
          maxNumberOfFiles={uploadKind === "images" ? 8 : 1}
          enableImageEditor={uploadKind !== "video"}
          enableCompressor={uploadKind !== "video"}
          allowedFileTypes={
            uploadKind === "video"
              ? [".mp4", ".mov", ".webm"]
              : [".png", ".jpg", ".jpeg", ".webp"]
          }
          onClose={() => setUploadOpen(false)}
          onCompleted={(result) => {
            const urls = uploadUrlsFromResult(result.successful)
            setUploadOpen(false)
            if (!urls.length) return
            setDraft((d) => {
              if (!d) return d
              if (uploadKind === "images") {
                return {
                  ...d,
                  trialImageLinks: [...(d.trialImageLinks ?? []), ...urls],
                }
              }
              if (uploadKind === "fabric") {
                return { ...d, fabricImageLink: urls[0] }
              }
              return { ...d, trialVideoLink: urls[0] }
            })
          }}
        />
      ) : null}
    </>
  )
}
