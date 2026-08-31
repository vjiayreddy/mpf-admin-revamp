import { mkdirSync } from "node:fs"
import { dirname, isAbsolute, resolve } from "node:path"

/**
 * Resolve a libsql/sqlite `file:` URL to an absolute path and ensure the
 * parent directory exists. Relative paths are resolved from `process.cwd()`.
 * Remote URLs (libsql:, http:, https:) are returned unchanged.
 */
export function resolveLocalSqliteUrl(url: string): string {
  if (!url.startsWith("file:")) {
    return url
  }

  const raw = url.slice("file:".length)
  let filePath = raw

  if (raw.startsWith("///")) {
    // file:///absolute/path → /absolute/path
    filePath = raw.slice(2)
  } else if (raw.startsWith("//")) {
    try {
      filePath = decodeURIComponent(new URL(url).pathname)
    } catch {
      filePath = raw
    }
  }

  // file:/C:/... on Windows → C:/...
  if (process.platform === "win32" && /^\/[A-Za-z]:[\\/]/.test(filePath)) {
    filePath = filePath.slice(1)
  }

  const absolute = isAbsolute(filePath)
    ? filePath
    : resolve(process.cwd(), filePath)

  mkdirSync(dirname(absolute), { recursive: true })
  return `file:${absolute}`
}
