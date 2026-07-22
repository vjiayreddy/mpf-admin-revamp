"use client"

import { useState } from "react"
import QRCode from "react-qr-code"
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

type EnableState = {
  totpURI: string
  backupCodes: string[]
} | null

export function SecurityTwoFactorCard() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const enabled = Boolean(session?.user?.twoFactorEnabled)

  const [enableState, setEnableState] = useState<EnableState>(null)
  const [verifyCode, setVerifyCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [freshBackupCodes, setFreshBackupCodes] = useState<string[] | null>(
    null
  )

  async function startEnable() {
    setError(null)
    setMessage(null)
    setFreshBackupCodes(null)
    setPending(true)
    try {
      const result = await authClient.twoFactor.enable({
        issuer: "My Perfect Fit Admin",
      })
      if (result.error) {
        setError(result.error.message ?? "Could not start 2FA setup")
        return
      }
      if (!result.data?.totpURI) {
        setError("Missing TOTP setup data")
        return
      }
      setEnableState({
        totpURI: result.data.totpURI,
        backupCodes: result.data.backupCodes ?? [],
      })
      setVerifyCode("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start 2FA setup")
    } finally {
      setPending(false)
    }
  }

  async function confirmEnable() {
    setError(null)
    setMessage(null)
    setPending(true)
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: verifyCode.trim(),
      })
      if (result.error) {
        setError(result.error.message ?? "Invalid authenticator code")
        return
      }
      setFreshBackupCodes(enableState?.backupCodes ?? null)
      setEnableState(null)
      setVerifyCode("")
      setMessage("Two-factor authentication is now enabled.")
      await authClient.getSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setPending(false)
    }
  }

  async function disableTwoFactor() {
    setError(null)
    setMessage(null)
    setPending(true)
    try {
      const result = await authClient.twoFactor.disable({})
      if (result.error) {
        setError(result.error.message ?? "Could not disable 2FA")
        return
      }
      setEnableState(null)
      setFreshBackupCodes(null)
      setMessage("Two-factor authentication has been disabled.")
      await authClient.getSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not disable 2FA")
    } finally {
      setPending(false)
    }
  }

  async function regenerateBackupCodes() {
    setError(null)
    setMessage(null)
    setPending(true)
    try {
      const result = await authClient.twoFactor.generateBackupCodes({})
      if (result.error) {
        setError(result.error.message ?? "Could not regenerate backup codes")
        return
      }
      setFreshBackupCodes(result.data?.backupCodes ?? [])
      setMessage("New backup codes generated. Save them somewhere safe.")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not regenerate backup codes"
      )
    } finally {
      setPending(false)
    }
  }

  if (sessionPending) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading security settings…
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {enabled ? (
            <ShieldCheck className="text-primary size-5" />
          ) : (
            <ShieldOff className="text-muted-foreground size-5" />
          )}
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          {enabled
            ? "Your account requires an authenticator code after password sign-in."
            : "Add an authenticator app step after your MPF password for stronger account protection."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {message}
          </p>
        ) : null}

        {enableState ? (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              Scan this QR code with Google Authenticator, Authy, or 1Password,
              then enter the 6-digit code to finish setup.
            </p>
            <div className="bg-background mx-auto rounded-lg border p-4">
              <QRCode value={enableState.totpURI} size={180} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="setup-code">Authenticator code</Label>
              <Input
                id="setup-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="123456"
                className="max-w-xs tracking-widest"
              />
            </div>
            {enableState.backupCodes.length > 0 ? (
              <BackupCodesList
                title="Save these backup codes now"
                codes={enableState.backupCodes}
              />
            ) : null}
          </div>
        ) : null}

        {freshBackupCodes && freshBackupCodes.length > 0 ? (
          <BackupCodesList
            title="Your backup codes"
            codes={freshBackupCodes}
          />
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {!enabled && !enableState ? (
          <Button onClick={() => void startEnable()} disabled={pending}>
            {pending ? "Starting…" : "Enable 2FA"}
          </Button>
        ) : null}

        {enableState ? (
          <>
            <Button
              onClick={() => void confirmEnable()}
              disabled={pending || verifyCode.trim().length < 6}
            >
              {pending ? "Verifying…" : "Confirm and enable"}
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => {
                setEnableState(null)
                setVerifyCode("")
                setError(null)
              }}
            >
              Cancel
            </Button>
          </>
        ) : null}

        {enabled && !enableState ? (
          <>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => void regenerateBackupCodes()}
            >
              Regenerate backup codes
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => void disableTwoFactor()}
            >
              Disable 2FA
            </Button>
          </>
        ) : null}
      </CardFooter>
    </Card>
  )
}

function BackupCodesList({
  title,
  codes,
}: {
  title: string
  codes: string[]
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="mb-2 text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mb-3 text-xs">
        Each code can be used once if you lose access to your authenticator.
      </p>
      <ul className="grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-3">
        {codes.map((code) => (
          <li key={code} className="bg-muted rounded px-2 py-1 text-center">
            {code}
          </li>
        ))}
      </ul>
    </div>
  )
}
