import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/lib/auth"

/**
 * Validate the real session (not cookie presence). Stale cookies must not
 * bounce the user back to `/` — that caused a GET / 307 redirect loop.
 */
export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect("/")
  }

  return <LoginForm />
}
