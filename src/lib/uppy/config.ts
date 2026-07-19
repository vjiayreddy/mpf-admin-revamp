/** S3 key prefix used by legacy product image uploads. */
export const PRODUCT_IMAGE_UPLOAD_PATH = "Images/MPFUserImages"

/** Legacy body-profile measurement photo prefix. */
export const MEASUREMENTS_UPLOAD_PATH = "Images/test_measurements/users"

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
export function withUploadPathPrefix(
  files: Record<string, { name?: string; meta?: Record<string, unknown> }>,
  uploadPath: string
): Record<string, { name?: string; meta?: Record<string, unknown> }> {
  for (const prop of Object.keys(files)) {
    const file = files[prop]
    const rand = Math.ceil(1 + Math.random() * (1000 - 1))
    const prefixed = `${uploadPath}/${rand}${file.name ?? ""}`
    file.name = prefixed
    file.meta = {
      ...(file.meta ?? {}),
      name: prefixed,
    }
  }
  return files
}

type SuccessfulUploadFile = {
  uploadURL?: string | null
  response?: {
    uploadURL?: string | null
  } | null
}

/**
 * Resolve public URLs from Uppy complete results (legacy: response.uploadURL).
 */
export function uploadUrlsFromResult(
  successful: SuccessfulUploadFile[] | undefined
): string[] {
  if (!successful?.length) return []
  return successful
    .map(
      (file) =>
        file.response?.uploadURL || file.uploadURL || null
    )
    .filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url)))
}
