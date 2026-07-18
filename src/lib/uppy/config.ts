import type { Meta, UppyFile } from "@uppy/core"

/** S3 key prefix used by legacy product image uploads. */
export const PRODUCT_IMAGE_UPLOAD_PATH = "Images/MPFUserImages"

export const PRODUCT_IMAGE_ALLOWED_TYPES = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const

export function getCompanionUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_COMPANION_URL?.trim()
  return url || null
}

/**
 * Prefix file names with the S3 upload path before Companion signs the upload
 * (same behavior as legacy `onBeforeUpload`).
 */
export function withUploadPathPrefix<M extends Meta, B extends Record<string, unknown>>(
  files: Record<string, UppyFile<M, B>>,
  uploadPath: string
): Record<string, UppyFile<M, B>> {
  const next: Record<string, UppyFile<M, B>> = {}

  for (const [id, file] of Object.entries(files)) {
    const rand = Math.ceil(1 + Math.random() * (1000 - 1))
    const prefixed = `${uploadPath}/${rand}${file.name}`
    next[id] = {
      ...file,
      name: prefixed,
      meta: {
        ...file.meta,
        name: prefixed,
      },
    }
  }

  return next
}

export function uploadUrlsFromResult(
  successful: Array<{ uploadURL?: string | null }> | undefined
): string[] {
  if (!successful?.length) return []
  return successful
    .map((file) => file.uploadURL)
    .filter((url): url is string => Boolean(url))
}
