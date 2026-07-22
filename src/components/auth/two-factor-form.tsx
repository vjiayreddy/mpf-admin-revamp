"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { captureEvent, identifyUser } from "@/lib/posthog/client"
import { cn } from "@/lib/utils"

type VerifyMode = "totp" | "backup"

export function TwoFactorForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [mode, setMode] = useState<VerifyMode>("totp")
  const [trustDevice, setTrustDevice] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function finishLogin() {
    const session = await authClient.getSession()
    const user = session.data?.user
    const sessionId = user?.activeStylistSessionId
    if (sessionId && typeof window !== "undefined") {
      window.localStorage.setItem("active_session_id", sessionId)
    }

    if (user?.id) {
      identifyUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? null,
      })
      captureEvent("user_logged_in", {
        email: user.email,
        role: user.role ?? undefined,
        two_factor: true,
      })
    }

    router.push("/")
    router.refresh()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    try {
      const trimmed = code.trim()
      if (!trimmed) {
        setError("Enter your verification code")
        return
      }

      const result =
        mode === "totp"
          ? await authClient.twoFactor.verifyTotp({
              code: trimmed,
              trustDevice,
            })
          : await authClient.twoFactor.verifyBackupCode({
              code: trimmed,
              trustDevice,
            })

      if (result.error) {
        setError(result.error.message ?? "Invalid verification code")
        return
      }

      await finishLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bg-background flex min-h-svh flex-col justify-center px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <Image
          src="/logos/mpflogo.png"
          alt="My Perfect Fit"
          width={180}
          height={48}
          className="h-10 w-auto rounded-[5px] object-contain sm:h-11"
          priority
        />

        <div className="mt-10 space-y-2 sm:mt-14">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
            Two-factor authentication
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {mode === "totp"
              ? "Enter the 6-digit code from your authenticator app."
              : "Enter one of your one-time backup codes."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">
              {mode === "totp" ? "Authenticator code" : "Backup code"}
            </Label>
            <Input
              id="code"
              inputMode={mode === "totp" ? "numeric" : "text"}
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={mode === "totp" ? "123456" : "xxxx-xxxx"}
              required
              className="h-11 tracking-widest"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="size-4 rounded border"
            />
            Trust this device for 30 days
          </label>

          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className={cn(
              "h-12 w-full rounded-md bg-neutral-950 text-base font-medium text-white",
              "hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            )}
          >
            {pending ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>

        <div className="text-muted-foreground mt-6 flex flex-col gap-2 text-center text-sm">
          <button
            type="button"
            className="hover:text-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setMode((m) => (m === "totp" ? "backup" : "totp"))
              setCode("")
              setError(null)
            }}
          >
            {mode === "totp"
              ? "Use a backup code instead"
              : "Use authenticator code instead"}
          </button>
          <Link
            href="/login"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
