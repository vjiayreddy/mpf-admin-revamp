import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const MAX_BYTES = 8 * 1024 * 1024

function allowedHosts(): Set<string> {
  const hosts = new Set<string>()
  const add = (raw?: string | null) => {
    if (!raw?.trim()) return
    try {
      hosts.add(new URL(raw.trim()).hostname.toLowerCase())
    } catch {
      /* ignore */
    }
  }
  add(process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL)
  add(process.env.NEXT_PUBLIC_COMPANION_URL)
  // Common MPF image hosts
  hosts.add("mpf-public-data.s3.ap-south-1.amazonaws.com")
  hosts.add("s3.ap-south-1.amazonaws.com")
  hosts.add("imageupload.mpfstyleclub.com")
  return hosts
}

function isAllowedImageUrl(raw: string): boolean {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false
  const host = url.hostname.toLowerCase()
  const allowed = allowedHosts()
  if (allowed.has(host)) return true
  // Allow any Amazon S3 host used for public assets
  if (host.endsWith(".amazonaws.com") && host.includes("s3")) return true
  // MPF-related CDNs / apps
  if (
    host.includes("myperfectfit") ||
    host.includes("mpfstyleclub") ||
    host.includes("mystyleclub") ||
    host.includes("mpf-")
  ) {
    return true
  }
  return false
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")?.trim()
  if (!imageUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 })
  }
  if (!isAllowedImageUrl(imageUrl)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 })
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: { Accept: "image/*,*/*" },
      cache: "no-store",
    })
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: 502 }
      )
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    if (!contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
      return NextResponse.json(
        { error: "Not an image" },
        { status: 415 }
      )
    }

    const buffer = Buffer.from(await upstream.arrayBuffer())
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 })
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType.startsWith("image/")
          ? contentType
          : "image/jpeg",
        "Cache-Control": "private, max-age=300",
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 })
  }
}
