"use client"

import { useEffect, useId, useRef, useState } from "react"
import AwsS3 from "@uppy/aws-s3"
import Compressor from "@uppy/compressor"
import Uppy, { type UploadResult } from "@uppy/core"
import ImageEditor from "@uppy/image-editor"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import ScreenCapture from "@uppy/screen-capture"
import Webcam from "@uppy/webcam"
import { Loader2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCompanionUrl, withUploadPathPrefix } from "@/lib/uppy/config"

import "@uppy/core/dist/style.css"
import "@uppy/dashboard/dist/style.css"
import "@uppy/webcam/dist/style.css"
import "@uppy/image-editor/dist/style.css"
import "@uppy/screen-capture/dist/style.css"

type UppyFileUploadProps = {
  open: boolean
  uploadPath: string
  /** Unique Uppy instance id. Defaults to a React useId-based value. */
  uppyId?: string
  maxNumberOfFiles?: number
  allowedFileTypes?: string[]
  /** Camera capture via @uppy/webcam (My Device is always available). */
  enableWebcam?: boolean
  enableImageEditor?: boolean
  enableCompressor?: boolean
  enableScreenCapture?: boolean
  onClose: () => void
  onCompleted: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void
}

/**
 * Lazy-mounted Uppy dashboard matching legacy Companion + @uppy/aws-s3 v3 setup.
 */
export function UppyFileUpload(props: UppyFileUploadProps) {
  if (!props.open) return null

  const companionUrl = getCompanionUrl()
  if (!companionUrl) {
    return <MissingCompanionDialog onClose={props.onClose} />
  }

  return <UppyFileUploadActive {...props} companionUrl={companionUrl} />
}

function MissingCompanionDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background max-w-md rounded-lg border p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-medium">Companion URL missing</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Set <code className="text-xs">NEXT_PUBLIC_COMPANION_URL</code> in your
          environment (e.g.{" "}
          <code className="text-xs">https://imageupload.mpfstyleclub.com</code>
          ), then restart the dev server.
        </p>
        <Button type="button" className="mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

function UppyFileUploadActive({
  uploadPath,
  uppyId: uppyIdProp,
  maxNumberOfFiles = 5,
  allowedFileTypes = [".png", ".jpg", ".jpeg", ".webp"],
  enableWebcam = true,
  enableImageEditor = true,
  enableCompressor = true,
  enableScreenCapture = true,
  onClose,
  onCompleted,
  companionUrl,
}: UppyFileUploadProps & { companionUrl: string }) {
  const reactId = useId()
  const uppyId = uppyIdProp ?? `mpf-uppy-${reactId}`
  const uploadPathRef = useRef(uploadPath)
  const onCompletedRef = useRef(onCompleted)
  const [uppy, setUppy] = useState<Uppy<
    Record<string, unknown>,
    Record<string, unknown>
  > | null>(null)
  const [bootError, setBootError] = useState<string | null>(null)

  useEffect(() => {
    uploadPathRef.current = uploadPath
  }, [uploadPath])

  useEffect(() => {
    onCompletedRef.current = onCompleted
  }, [onCompleted])

  useEffect(() => {
    let instance: Uppy<Record<string, unknown>, Record<string, unknown>> | null =
      null

    try {
      instance = new Uppy({
        id: uppyId,
        autoProceed: false,
        allowMultipleUploads: true,
        restrictions: {
          maxNumberOfFiles,
          maxFileSize: 20_000_000,
          allowedFileTypes,
        },
        onBeforeUpload: (files) =>
          withUploadPathPrefix(
            files as Record<
              string,
              { name?: string; meta?: Record<string, unknown> }
            >,
            uploadPathRef.current
          ) as typeof files,
      }).use(AwsS3, {
        // Same as legacy: Companion signs uploads via companionUrl.
        limit: 4,
        companionUrl,
      })

      if (enableWebcam) {
        instance.use(Webcam, {
          modes: ["picture"],
          mobileNativeCamera: true,
          showVideoSourceDropdown: true,
        })
      }

      if (enableScreenCapture) {
        instance.use(ScreenCapture, {
          preferredVideoMimeType: "video/webm",
        })
      }

      if (enableCompressor) {
        instance.use(Compressor, { quality: 0.3, limit: 10 })
      }

      if (enableImageEditor) {
        instance.use(ImageEditor, {
          id: "ImageEditor",
          quality: 0.3,
        })
      }

      instance.on("complete", (result) => {
        onCompletedRef.current(result)
      })

      setUppy(instance)
    } catch (err) {
      setBootError(
        err instanceof Error ? err.message : "Failed to start uploader"
      )
      instance?.close({ reason: "unmount" })
    }

    return () => {
      instance?.cancelAll()
      instance?.close({ reason: "unmount" })
      setUppy(null)
    }
    // Boot once per open mount; parent remounts when closed/reopened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uppyId, companionUrl])

  const dashboardPlugins = [
    enableWebcam ? "Webcam" : null,
    enableScreenCapture ? "ScreenCapture" : null,
    enableImageEditor ? "ImageEditor" : null,
  ].filter(Boolean) as string[]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upload images"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Upload images</p>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Close upload"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <div className="min-h-[320px] overflow-auto p-3">
          {bootError ? (
            <p className="text-destructive text-sm" role="alert">
              {bootError}
            </p>
          ) : null}

          {!uppy && !bootError ? (
            <div className="text-muted-foreground flex min-h-[280px] flex-col items-center justify-center gap-2 text-sm">
              <Loader2Icon className="size-5 animate-spin" />
              Preparing uploader…
            </div>
          ) : null}

          {uppy ? (
            <Dashboard
              uppy={uppy}
              height={400}
              width="100%"
              proudlyDisplayPoweredByUppy={false}
              note="File size must not exceed 20 MB"
              plugins={dashboardPlugins}
              doneButtonHandler={onClose}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
