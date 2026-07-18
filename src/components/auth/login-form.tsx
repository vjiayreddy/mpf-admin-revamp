"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Scissors } from "lucide-react"

import { authClient } from "@/lib/auth-client"
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

export function LoginForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [source, setSource] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)

    try {
      const result = await authClient.signIn.credentials({
        source,
        password,
        name,
        browser: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        device: typeof navigator !== "undefined" ? navigator.platform : undefined,
      })

      if (result.error) {
        setError(result.error.message ?? "Login failed")
        return
      }

      const session = await authClient.getSession()
      const sessionId = session.data?.user?.activeStylistSessionId
      if (sessionId && typeof window !== "undefined") {
        window.localStorage.setItem("active_session_id", sessionId)
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
          <Scissors className="size-5" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">My Perfect Fit</p>
          <p className="text-muted-foreground text-sm">Admin sign in</p>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in with your MPF admin email and password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="you@myperfectfit.co.in"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                minLength={5}
              />
            </div>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="text-muted-foreground justify-center text-xs">
          Authenticated via MPF GraphQL · session via Better Auth
        </CardFooter>
      </Card>
    </div>
  )
}
