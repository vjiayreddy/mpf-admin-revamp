import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/api/auth")
  const isPublicShared =
    pathname.startsWith("/shared/trail-details") ||
    pathname.startsWith("/shared/order-details")

  if (!sessionCookie && !isAuthRoute && !isPublicShared) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionCookie && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
