"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useMutation, useQuery } from "@apollo/client/react"
import { ImageIcon, Loader2Icon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GET_BODY_PROFILE,
  SAVE_BODY_PROFILE,
  firstBodyProfile,
  type BodyProfileDetails,
  type GetBodyProfileData,
  type GetBodyProfileVars,
  type SaveBodyProfileData,
  type SaveBodyProfileVars,
} from "@/lib/apollo/queries/body-profile"
import { notify } from "@/lib/notify"
import {
  MEASUREMENTS_UPLOAD_PATH,
  uploadUrlsFromResult,
} from "@/lib/uppy/config"

/** Load Uppy only when needed — keeps the Pics tab itself snappy. */
const UppyFileUpload = dynamic(
  () =>
    import("@/components/upload/uppy-file-upload").then(
      (m) => m.UppyFileUpload
    ),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
        <div className="bg-background flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg">
          <Loader2Icon className="size-4 animate-spin" />
          Loading uploader…
        </div>
      </div>
    ),
  }
)

type PicKey = "frontPicture" | "sidePicture" | "backPicture"

const PIC_LABELS: Record<PicKey, string> = {
  frontPicture: "Front",
  sidePicture: "Side",
  backPicture: "Back",
}

type UploadPicsPanelProps = {
  userId: string
}

function PicSlot({
  label,
  url,
  onUpload,
  onClear,
  busy,
}: {
  label: string
  url?: string | null
  onUpload: () => void
  onClear: () => void
  busy?: boolean
}) {
  return (
    <div className="bg-card flex flex-col gap-2 rounded-lg border p-3">
      <p className="text-sm font-medium">{label}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={label}
          className="bg-muted aspect-[3/4] w-full rounded-md object-cover"
        />
      ) : (
        <div className="bg-muted text-muted-foreground flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-md text-sm">
          <ImageIcon className="size-8 opacity-50" />
          No photo
        </div>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="flex-1"
          disabled={busy}
          onClick={onUpload}
        >
          <UploadIcon className="size-3.5" />
          Upload
        </Button>
        {url ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={onClear}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function UploadPicsPanel({ userId }: UploadPicsPanelProps) {
  const [uploadKey, setUploadKey] = useState<PicKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery<
    GetBodyProfileData,
    GetBodyProfileVars
  >(GET_BODY_PROFILE, {
    variables: { userId },
    fetchPolicy: "cache-first",
  })

  const [saveBodyProfile, { loading: saving }] = useMutation<
    SaveBodyProfileData,
    SaveBodyProfileVars
  >(SAVE_BODY_PROFILE)

  const profile = firstBodyProfile(data)

  const uploadPath = useMemo(
    () => `${MEASUREMENTS_UPLOAD_PATH}/${userId}`,
    [userId]
  )

  const savePicture = async (
    key: PicKey,
    imgUrl: string | null,
    current: BodyProfileDetails
  ) => {
    setError(null)
    try {
      const {
        frontPicture,
        sidePicture,
        backPicture,
        firstName,
        lastName,
        email,
        phone,
        countryCode,
        height,
        weight,
        age,
        shoulderTypeId,
        bodyPostureId,
        bodyShapeId,
        fitPreferenceId,
      } = current

      await saveBodyProfile({
        variables: {
          basicInfo: {
            userId,
            firstName: firstName ?? undefined,
            lastName: lastName ?? undefined,
            email: email ?? undefined,
            phone: phone ?? undefined,
            countryCode: countryCode ?? undefined,
            height: Math.round(Number(height) || 0),
            weight: Math.round(Number(weight) || 0),
            age: Math.round(Number(age) || 0),
            shoulderTypeId: shoulderTypeId ?? undefined,
            bodyPostureId: bodyPostureId ?? undefined,
            bodyShapeId: bodyShapeId ?? undefined,
            fitPreferenceId: fitPreferenceId ?? undefined,
            frontPicture: key === "frontPicture" ? imgUrl : frontPicture,
            sidePicture: key === "sidePicture" ? imgUrl : sidePicture,
            backPicture: key === "backPicture" ? imgUrl : backPicture,
          },
        },
      })
      await refetch()
      notify.success(
        imgUrl
          ? `${PIC_LABELS[key]} photo saved`
          : `${PIC_LABELS[key]} photo cleared`
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save picture"
      setError(msg)
      notify.fromError(err, "Failed to save picture")
    }
  }

  if (loading && !profile) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!profile) {
    return (
      <div className="bg-card rounded-lg border p-6 text-sm">
        <p className="font-medium">Body profile required</p>
        <p className="text-muted-foreground mt-1">
          Save a body profile on the Body Profile tab before managing photos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Upload front, side, and back photos. Images go to S3, then the body
        profile is updated with the URL.
      </p>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <PicSlot
          label="Front"
          url={profile.frontPicture}
          busy={saving}
          onUpload={() => setUploadKey("frontPicture")}
          onClear={() => void savePicture("frontPicture", null, profile)}
        />
        <PicSlot
          label="Side"
          url={profile.sidePicture}
          busy={saving}
          onUpload={() => setUploadKey("sidePicture")}
          onClear={() => void savePicture("sidePicture", null, profile)}
        />
        <PicSlot
          label="Back"
          url={profile.backPicture}
          busy={saving}
          onUpload={() => setUploadKey("backPicture")}
          onClear={() => void savePicture("backPicture", null, profile)}
        />
      </div>

      {uploadKey ? (
        <UppyFileUpload
          open
          uppyId={`body-pics-${uploadKey}-${userId}`}
          uploadPath={uploadPath}
          maxNumberOfFiles={1}
          enableImageEditor={false}
          enableCompressor={false}
          enableWebcam
          allowedFileTypes={[".png", ".jpg", ".jpeg", ".webp"]}
          onClose={() => setUploadKey(null)}
          onCompleted={(result) => {
            const key = uploadKey
            setUploadKey(null)
            if (!key) return
            const urls = uploadUrlsFromResult(result.successful)
            const url = urls[0]
            if (!url) {
              setError("Upload finished but no URL was returned.")
              notify.error("Upload finished but no URL was returned.")
              return
            }
            void savePicture(key, url, profile)
          }}
        />
      ) : null}
    </div>
  )
}
