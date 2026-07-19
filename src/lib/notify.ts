import { toast } from "sonner"

/**
 * Global user notifications for CRUD / API outcomes.
 * Prefer this over inline success banners so feedback is always visible.
 */
export const notify = {
  success(message: string, description?: string) {
    return toast.success(message, description ? { description } : undefined)
  },
  error(message: string, description?: string) {
    return toast.error(message, description ? { description } : undefined)
  },
  info(message: string, description?: string) {
    return toast.message(message, description ? { description } : undefined)
  },
  warning(message: string, description?: string) {
    return toast.warning(message, description ? { description } : undefined)
  },
  /** Prefer Error.message when available. */
  fromError(err: unknown, fallback = "Something went wrong") {
    const message =
      err instanceof Error && err.message.trim() ? err.message : fallback
    return toast.error(message)
  },
}
