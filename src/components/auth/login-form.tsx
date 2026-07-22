"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { LoginProfessionSlider } from "@/components/auth/login-profession-slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { captureEvent, identifyUser } from "@/lib/posthog/client"
import { cn } from "@/lib/utils"

const underlineInputClass = cn(
  "h-11 rounded-none border-0 border-b border-neutral-300 bg-transparent px-0 shadow-none",
  "placeholder:text-neutral-400 md:text-base",
  "focus-visible:border-neutral-900 focus-visible:ring-0 dark:border-neutral-600 dark:focus-visible:border-white"
)

export function LoginForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [source, setSource] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
        browser:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        device:
          typeof navigator !== "undefined" ? navigator.platform : undefined,
      })

      if (result.error) {
        setError(result.error.message ?? "Login failed")
        return
      }

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
        })
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
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <LoginProfessionSlider className="h-full min-h-[42vh] lg:min-h-svh" />

      <div className="bg-background flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
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
              Welcome Back!
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sign in with your MPF admin email and password.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="sr-only">
                Display name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
                autoComplete="name"
                required
                className={underlineInputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
                className={underlineInputClass}
              />
            </div>
            <div className="relative flex flex-col gap-1.5">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                required
                minLength={5}
                className={cn(underlineInputClass, "pr-10")}
              />
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-0 -translate-y-1/2 p-1.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>

            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className={cn(
                "mt-1 h-12 w-full rounded-md bg-neutral-950 text-base font-medium text-white",
                "transition-transform duration-200 hover:bg-neutral-800 hover:scale-[1.01]",
                "active:scale-[0.99] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              )}
            >
              {pending ? "Signing in…" : "Login Now"}
            </Button>
          </form>

          <p className="text-muted-foreground mt-10 text-center text-[11px]">
            Secure admin access for My Perfect Fit stylists and studios.
          </p>
        </div>
      </div>
    </div>
  )
}
