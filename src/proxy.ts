import { NextRequest, NextResponse } from "next/server"

/** Lightweight session presence check — avoids bundling better-auth into proxy. */
function hasSessionCookie(request: NextRequest): boolean {
  const names = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth-session_token",
    "__Secure-better-auth-session_token",
  ]
  return names.some((name) => Boolean(request.cookies.get(name)?.value))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/two-factor") ||
    pathname.startsWith("/api/auth")
  const isPublicShared =
    pathname.startsWith("/shared/trail-details") ||
    pathname.startsWith("/shared/order-details")

  // Only gate protected routes. Do NOT bounce /login → / on cookie presence alone —
  // a stale cookie + dashboard getSession() null causes an infinite 307 loop.
  if (!isAuthRoute && !isPublicShared && !hasSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
