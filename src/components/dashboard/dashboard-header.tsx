"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRightIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type DashboardHeaderProps = {
  name?: string | null
  role?: string | null
  email?: string | null
  weekRangeLabel: string
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function firstName(name?: string | null, email?: string | null) {
  const fromName = name?.trim().split(/\s+/)[0]
  if (fromName) return fromName
  const fromEmail = email?.split("@")[0]
  return fromEmail || "there"
}

function formatLocalDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
}

export function DashboardHeader({
  name,
  role,
  email,
  weekRangeLabel,
}: DashboardHeaderProps) {
  const displayName = firstName(name, email)
  // Clock-based copy is client-only to avoid SSR/client timezone mismatches.
  const [localNow, setLocalNow] = useState<{
    greeting: string
    dateLabel: string
  } | null>(null)

  useEffect(() => {
    const now = new Date()
    setLocalNow({
      greeting: greetingForHour(now.getHours()),
      dateLabel: formatLocalDateLabel(now),
    })
  }, [])

  return (
    <section className="relative overflow-hidden rounded-2xl border">
      <div
        className="absolute inset-0 bg-gradient-to-br from-muted/80 via-background to-muted/40"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 0% 0%, oklch(0.75 0.04 75 / 0.35), transparent 55%), radial-gradient(ellipse 50% 60% at 100% 100%, oklch(0.7 0.03 230 / 0.2), transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
            Ops home · {weekRangeLabel}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {localNow ? `${localNow.greeting}, ${displayName}` : `Hello, ${displayName}`}
          </h1>
          <p className="text-muted-foreground text-sm">
            {localNow?.dateLabel ?? "\u00a0"}
            {role ? ` · ${role}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/orders/form" />}
            size="lg"
            className="gap-1.5"
          >
            <PlusIcon data-icon="inline-start" />
            New order
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/analytics" />}
            variant="outline"
            size="lg"
            className="gap-1.5"
          >
            Analytics
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
