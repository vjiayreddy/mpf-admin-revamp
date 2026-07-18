"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import AwsS3 from "@uppy/aws-s3"
import Compressor from "@uppy/compressor"
import Uppy, { type UploadResult } from "@uppy/core"
import ImageEditor from "@uppy/image-editor"
import DashboardModal from "@uppy/react/dashboard-modal"

import {
  getCompanionUrl,
  withUploadPathPrefix,
} from "@/lib/uppy/config"

import "@uppy/core/css/style.min.css"
import "@uppy/dashboard/css/style.min.css"
import "@uppy/image-editor/css/style.min.css"

type UppyFileUploadProps = {
  open: boolean
  uploadPath: string
  maxNumberOfFiles?: number
  allowedFileTypes?: string[]
  onClose: () => void
  onCompleted: (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => void
}

export function UppyFileUpload({
  open,
  uploadPath,
  maxNumberOfFiles = 5,
  allowedFileTypes = [".png", ".jpg", ".jpeg", ".webp"],
  onClose,
  onCompleted,
}: UppyFileUploadProps) {
  const companionUrl = getCompanionUrl()
  const uploadPathRef = useRef(uploadPath)
  const onCompletedRef = useRef(onCompleted)

  useEffect(() => {
    uploadPathRef.current = uploadPath
  }, [uploadPath])

  useEffect(() => {
    onCompletedRef.current = onCompleted
  }, [onCompleted])

  const [uppy] = useState(() => {
    const instance = new Uppy({
      id: "mpf-product-image-upload",
      autoProceed: false,
      allowMultipleUploadBatches: true,
      restrictions: {
        maxNumberOfFiles,
        maxFileSize: 20_000_000,
        allowedFileTypes,
      },
      onBeforeUpload: (files) =>
        withUploadPathPrefix(files, uploadPathRef.current),
    })
      .use(AwsS3, {
        limit: 4,
        endpoint: companionUrl || "",
      })
      .use(ImageEditor, {
        quality: 0.3,
      })
      .use(Compressor, {
        quality: 0.3,
        limit: 10,
      })

    instance.on("complete", (result) => {
      onCompletedRef.current(result)
    })

    return instance
  })

  useEffect(() => {
    uppy.setOptions({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize: 20_000_000,
        allowedFileTypes,
      },
    })
  }, [uppy, maxNumberOfFiles, allowedFileTypes])

  useEffect(() => {
    if (!open) {
      uppy.cancelAll()
    }
  }, [open, uppy])

  useEffect(() => {
    return () => {
      uppy.cancelAll()
      uppy.destroy()
    }
  }, [uppy])

  const missingCompanion = useMemo(() => !companionUrl, [companionUrl])

  if (missingCompanion) {
    if (!open) return null
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-background max-w-md rounded-lg border p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm font-medium">Companion URL missing</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Set{" "}
            <code className="text-xs">NEXT_PUBLIC_COMPANION_URL</code> in your
            environment (e.g.{" "}
            <code className="text-xs">https://imageupload.mpfstyleclub.com</code>
            ), then restart the dev server.
          </p>
          <button
            type="button"
            className="bg-primary text-primary-foreground mt-4 inline-flex h-8 items-center rounded-md px-3 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardModal
      uppy={uppy}
      open={open}
      onRequestClose={onClose}
      closeModalOnClickOutside
      proudlyDisplayPoweredByUppy={false}
      note="Images up to 20 MB · PNG, JPG, WEBP"
    />
  )
}
