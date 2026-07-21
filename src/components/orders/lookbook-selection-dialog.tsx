"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  getStyleClubGraphqlUrl,
  type LookbookPickPayload,
} from "@/lib/orders/lookbook"
import { cn } from "@/lib/utils"

const GET_LOOKBOOKS_QUERY = `
  query GetLookBooksByFilter(
    $filters: LookBookFilterInput!
    $page: Int
    $limit: Int
  ) {
    getLookBooksByFilter(filters: $filters, page: $page, limit: $limit) {
      lookbooks {
        _id
        lookId
        name
        title
        note
        images {
          url
          isVideo
          type
        }
      }
    }
  }
`

type StyleClubLookbook = {
  _id?: string
  lookId?: string | number
  name?: string
  title?: string
  note?: string
  images?: Array<{
    url?: string
    isVideo?: boolean
    type?: string
  }>
}

type FlatLookbookImage = LookbookPickPayload & {
  key: string
}

export type LookbookSelectionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (data: LookbookPickPayload) => void
}

async function fetchLookbooks(searchTerm: string): Promise<StyleClubLookbook[]> {
  const response = await fetch(getStyleClubGraphqlUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_LOOKBOOKS_QUERY,
      variables: {
        filters: { searchTerm },
        page: 1,
        limit: 100,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Lookbook request failed (${response.status})`)
  }

  const result = (await response.json()) as {
    data?: {
      getLookBooksByFilter?: { lookbooks?: StyleClubLookbook[] }
    }
    errors?: Array<{ message?: string }>
  }

  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message || "Lookbook GraphQL error")
  }

  return result.data?.getLookBooksByFilter?.lookbooks ?? []
}

/**
 * Legacy parity: browse Style Club lookbooks and pick a still image
 * for order item Ref / Fit tiles.
 */
export function LookbookSelectionDialog({
  open,
  onOpenChange,
  onSelectImage,
}: LookbookSelectionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookbooks, setLookbooks] = useState<StyleClubLookbook[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedUrl, setSelectedUrl] = useState("")

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400)
    return () => window.clearTimeout(t)
  }, [open, searchTerm])

  const load = useCallback(async (term: string) => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchLookbooks(term)
      setLookbooks(rows)
    } catch (err) {
      setLookbooks([])
      setError(err instanceof Error ? err.message : "Failed to load lookbooks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setSelectedUrl("")
    void load(debouncedSearch)
  }, [open, debouncedSearch, load])

  useEffect(() => {
    if (open) return
    setSearchTerm("")
    setDebouncedSearch("")
    setSelectedUrl("")
    setError(null)
  }, [open])

  const images = useMemo(() => {
    const flat: FlatLookbookImage[] = []
    for (const lookbook of lookbooks) {
      const stills = (lookbook.images ?? []).filter(
        (img) => img?.url && !img.isVideo
      )
      const allUrls = (lookbook.images ?? [])
        .map((img) => img.url)
        .filter((url): url is string => Boolean(url?.trim()))

      stills.forEach((image, index) => {
        const url = image.url!.trim()
        flat.push({
          key: `${lookbook._id ?? lookbook.lookId ?? "lb"}-${index}-${url}`,
          url,
          lookBookId: lookbook._id,
          lookbookName: lookbook.name || "-",
          lookBookNo: lookbook.lookId,
          lookBookTitle: lookbook.title || "-",
          lookBookNotes: lookbook.note || "-",
          lookBookImages: allUrls,
        })
      })
    }
    return flat
  }, [lookbooks])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select from lookbook</DialogTitle>
          <DialogDescription>
            Pick a Style Club lookbook image for this order item.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b px-5 py-3">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lookbook name, title, or ID…"
              className="pr-9 pl-9"
            />
            {searchTerm ? (
              <button
                type="button"
                aria-label="Clear search"
                className="text-muted-foreground hover:bg-muted absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md"
                onClick={() => setSearchTerm("")}
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="text-muted-foreground flex min-h-64 items-center justify-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Loading lookbooks…
            </div>
          ) : null}

          {!loading && error ? (
            <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-6 text-center text-sm">
              {error}
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void load(debouncedSearch)}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : null}

          {!loading && !error && images.length === 0 ? (
            <p className="text-muted-foreground py-16 text-center text-sm">
              No images found
            </p>
          ) : null}

          {!loading && !error && images.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image) => {
                const selected = selectedUrl === image.url
                return (
                  <button
                    key={image.key}
                    type="button"
                    className={cn(
                      "bg-card overflow-hidden rounded-lg border text-left transition-shadow hover:shadow-md",
                      selected && "border-primary ring-primary/30 ring-2"
                    )}
                    onClick={() => {
                      setSelectedUrl(image.url)
                      onSelectImage(image)
                      onOpenChange(false)
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.lookBookTitle || "Lookbook image"}
                      className="bg-muted aspect-[3/4] w-full object-contain"
                    />
                    <div className="space-y-0.5 px-2 py-1.5">
                      <p className="text-primary truncate text-xs font-semibold">
                        {image.lookBookTitle || "—"}
                      </p>
                      {image.lookBookNo != null &&
                      String(image.lookBookNo).trim() ? (
                        <p className="text-muted-foreground truncate text-[11px]">
                          LookId: {image.lookBookNo}
                        </p>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
