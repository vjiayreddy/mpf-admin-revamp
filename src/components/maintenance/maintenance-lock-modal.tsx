"use client"

import { ConstructionIcon, ScissorsIcon } from "lucide-react"

import {
  formatMaintenanceCountdown,
  formatMaintenanceWhen,
} from "@/lib/maintenance/format"
import type { MaintenanceState } from "@/lib/maintenance/types"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

type MaintenanceLockModalProps = {
  state: MaintenanceState
}

/** Non-dismissible full-screen lock while maintenance is active. */
export function MaintenanceLockModal({ state }: MaintenanceLockModalProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const etaLabel = formatMaintenanceWhen(state.endsAtEstimate)
  const endsAtMs = state.endsAtEstimate
    ? Date.parse(state.endsAtEstimate)
    : NaN
  const remainingMs = Number.isFinite(endsAtMs)
    ? Math.max(0, endsAtMs - now)
    : null
  const countdown =
    remainingMs != null ? formatMaintenanceCountdown(remainingMs) : null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden p-4 sm:p-8"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="maintenance-lock-title"
      aria-describedby="maintenance-lock-desc"
    >
      {/* Atmosphere */}
      <div
        className="absolute inset-0 bg-[#0c0e12]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.35 0.04 75 / 0.45), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, oklch(0.28 0.03 250 / 0.35), transparent 50%), radial-gradient(ellipse 40% 30% at 0% 80%, oklch(0.3 0.04 40 / 0.25), transparent 45%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex w-full max-w-lg flex-col items-center text-center",
          "animate-in fade-in zoom-in-95 duration-500"
        )}
      >
        <div className="mb-8 flex items-center gap-2 text-[11px] font-medium tracking-[0.22em] text-white/45 uppercase">
          <ScissorsIcon className="size-3.5 opacity-80" aria-hidden />
          My Perfect Fit
        </div>

        <div className="relative mb-7">
          <div
            className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl"
            aria-hidden
          />
          <div className="border-white/10 bg-white/5 relative flex size-16 items-center justify-center rounded-2xl border shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]">
            <ConstructionIcon
              className="size-7 text-amber-200/90"
              strokeWidth={1.5}
              aria-hidden
            />
            <span
              className="absolute -top-0.5 -right-0.5 flex size-3"
              aria-hidden
            >
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400/60 opacity-60" />
              <span className="relative inline-flex size-3 rounded-full bg-amber-400" />
            </span>
          </div>
        </div>

        <p className="mb-3 text-[11px] font-medium tracking-[0.2em] text-amber-200/70 uppercase">
          Service maintenance
        </p>

        <h1
          id="maintenance-lock-title"
          className="font-serif text-[1.75rem] leading-tight tracking-tight text-white sm:text-3xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          We’ll be right back
        </h1>

        <p
          id="maintenance-lock-desc"
          className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55"
        >
          {state.message ||
            "The portal is temporarily unavailable while we deploy updates. Please wait until maintenance is complete."}
        </p>

        {countdown && remainingMs != null && remainingMs > 0 ? (
          <div className="mt-8 w-full">
            <p className="mb-3 text-[10px] font-medium tracking-[0.18em] text-white/35 uppercase">
              Estimated time remaining
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {countdown.totalHours > 0 ? (
                <>
                  <CountdownUnit value={countdown.hours} label="hrs" />
                  <Colon />
                </>
              ) : null}
              <CountdownUnit value={countdown.minutes} label="min" />
              <Colon />
              <CountdownUnit value={countdown.seconds} label="sec" />
            </div>
          </div>
        ) : etaLabel ? (
          <p className="mt-8 text-sm text-white/40">
            Estimated completion{" "}
            <span className="text-white/70">{etaLabel}</span>
          </p>
        ) : null}

        <div className="mt-10 h-px w-16 bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <p className="mt-6 max-w-sm text-xs leading-relaxed text-white/30">
          This screen clears automatically when maintenance ends. You don’t
          need to refresh.
        </p>
      </div>
    </div>
  )
}

function Colon() {
  return (
    <span className="pb-4 text-xl font-light text-white/25" aria-hidden>
      :
    </span>
  )
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[4.25rem] flex-col items-center">
      <span className="border-white/10 bg-white/[0.06] w-full rounded-xl border px-3 py-3 font-mono text-2xl font-medium tracking-tight text-white tabular-nums shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] sm:text-3xl">
        {value}
      </span>
      <span className="mt-1.5 text-[10px] tracking-wider text-white/30 uppercase">
        {label}
      </span>
    </div>
  )
}
