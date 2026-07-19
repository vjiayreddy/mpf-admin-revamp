"use client"

import { ExpandIcon } from "lucide-react"

import {
  BODY_PROFILE_ATTRIBUTES,
  resolveBodyAttributeName,
} from "@/config/body-profile-attributes"
import type { BodyProfileDetails } from "@/lib/apollo/queries/body-profile"
import { bodyProfileImageUrls } from "@/lib/apollo/queries/body-profile"
import { cn } from "@/lib/utils"

function cmToFeetInches(cm?: number | null): string {
  if (cm == null || !Number.isFinite(cm) || cm <= 0) return "N/A"
  const realFeet = (cm * 0.3937) / 12
  const feet = Math.floor(realFeet)
  const inches = Math.round((realFeet - feet) * 12)
  return `${feet}.${inches} Inch`
}

type LabeledPhoto = {
  label: string
  url: string
}

function labeledBodyPhotos(profile?: BodyProfileDetails | null): LabeledPhoto[] {
  if (!profile) return []
  const entries: Array<{ label: string; url?: string | null }> = [
    { label: "Front", url: profile.frontPicture },
    { label: "Side", url: profile.sidePicture },
    { label: "Back", url: profile.backPicture },
  ]
  const photos: LabeledPhoto[] = []
  for (const entry of entries) {
    const url = entry.url?.trim()
    if (url) photos.push({ label: entry.label, url })
  }
  return photos
}

export type MeasurementBodySummaryProps = {
  profile?: BodyProfileDetails | null
  onPhotoClick?: (images: string[], index: number) => void
  className?: string
}

export function MeasurementBodySummary({
  profile,
  onPhotoClick,
  className,
}: MeasurementBodySummaryProps) {
  const labeled = labeledBodyPhotos(profile)
  const galleryUrls = bodyProfileImageUrls(profile)
  const name = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-muted/50 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
        Basic details
      </div>
      <dl className="grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Name</dt>
          <dd className="font-medium">{name || "N/A"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Age</dt>
          <dd className="font-medium">{profile?.age ?? "N/A"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Weight</dt>
          <dd className="font-medium">
            {profile?.weight != null ? `${profile.weight} Kg` : "N/A"}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Height</dt>
          <dd className="font-medium">{cmToFeetInches(profile?.height)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Body posture</dt>
          <dd className="font-medium">
            {resolveBodyAttributeName(
              profile?.bodyPostureId,
              BODY_PROFILE_ATTRIBUTES.postureType
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Shoulder</dt>
          <dd className="font-medium">
            {resolveBodyAttributeName(
              profile?.shoulderTypeId,
              BODY_PROFILE_ATTRIBUTES.shoulderType
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground w-28 shrink-0">Fit type</dt>
          <dd className="font-medium">
            {resolveBodyAttributeName(
              profile?.fitPreferenceId,
              BODY_PROFILE_ATTRIBUTES.preferenceType
            )}
          </dd>
        </div>
      </dl>

      <div>
        <div className="bg-muted/50 mb-3 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase">
          Client pictures
        </div>
        {labeled.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {labeled.map((photo, index) => (
              <button
                key={`${photo.label}-${photo.url}`}
                type="button"
                className="group border-border bg-muted/20 hover:border-foreground/30 focus-visible:ring-ring relative flex flex-col overflow-hidden rounded-lg border text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => onPhotoClick?.(galleryUrls, index)}
              >
                <div className="bg-background flex h-56 w-full items-center justify-center sm:h-64">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Client ${photo.label.toLowerCase()} picture`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="border-border flex items-center justify-between border-t px-2.5 py-1.5">
                  <span className="text-xs font-medium">{photo.label}</span>
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                    <ExpandIcon className="size-3" />
                    Enlarge
                  </span>
                </div>
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">No photos</p>
        )}
      </div>
    </div>
  )
}
