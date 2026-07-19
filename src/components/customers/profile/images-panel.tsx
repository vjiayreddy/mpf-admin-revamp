"use client"

import { useQuery } from "@apollo/client/react"
import { ImageIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_BODY_PROFILE,
  bodyProfileImageUrls,
  type GetBodyProfileData,
  type GetBodyProfileVars,
} from "@/lib/apollo/queries/body-profile"

const SLOTS = [
  { key: "frontPicture", label: "Front" },
  { key: "sidePicture", label: "Side" },
  { key: "backPicture", label: "Back" },
] as const

type ImagesPanelProps = {
  userId: string
  enabled: boolean
}

export function ImagesPanel({ userId, enabled }: ImagesPanelProps) {
  const { data, loading, error } = useQuery<
    GetBodyProfileData,
    GetBodyProfileVars
  >(GET_BODY_PROFILE, {
    variables: { userId },
    skip: !enabled || !userId,
    fetchPolicy: "cache-and-network",
  })

  const profile = data?.getBodyProfile?.[0] ?? null
  const urls = bodyProfileImageUrls(profile)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium">Body images</h2>
        <p className="text-muted-foreground text-sm">
          Front, side, and back photos from the customer body profile.
        </p>
      </div>

      {loading && !profile ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm">
          Failed to load body images. Please try again.
        </p>
      ) : null}

      {!loading && !error && urls.length === 0 ? (
        <div className="bg-muted/30 rounded-xl border border-dashed px-6 py-12 text-center">
          <ImageIcon className="text-muted-foreground mx-auto size-8" />
          <p className="mt-3 font-medium">No body images</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Photos will appear here once captured in measurements.
          </p>
        </div>
      ) : null}

      {profile ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {SLOTS.map((slot) => {
            const url = profile[slot.key]?.trim()
            return (
              <div
                key={slot.key}
                className="bg-card ring-foreground/10 overflow-hidden rounded-xl ring-1"
              >
                <div className="bg-muted/40 relative aspect-[3/4]">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={`${slot.label} body photo`}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-sm">
                      <ImageIcon className="size-6 opacity-50" />
                      No {slot.label.toLowerCase()} photo
                    </div>
                  )}
                </div>
                <div className="border-t px-3 py-2 text-sm font-medium">
                  {slot.label}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
