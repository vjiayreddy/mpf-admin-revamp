"use client"

import { CameraIcon, MessageCircleIcon, PhoneIcon } from "lucide-react"

import { ModuleShortcutsMenu } from "@/components/customers/profile/module-shortcuts-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { CustomerOrderStats } from "@/lib/apollo/queries/customer-order-stats"
import type { CustomerProfileUser } from "@/lib/apollo/queries/get-user"
import {
  callPhone,
  customerInitials,
  displayCustomerName,
  formatInr,
  formatProfileDate,
  openWhatsApp,
} from "@/lib/customers/profile-display"

type CustomerProfileHeaderProps = {
  user: CustomerProfileUser | null
  orderStats: CustomerOrderStats | null
  loading?: boolean
  onUploadPhoto?: () => void
}

export function CustomerProfileHeader({
  user,
  orderStats,
  loading,
  onUploadPhoto,
}: CustomerProfileHeaderProps) {
  if (loading && !user) {
    return (
      <div className="flex flex-col gap-4 overflow-hidden rounded-xl border border-[#e8d5a3]/80 bg-gradient-to-br from-[#faf6eb] via-[#fffdf8] to-[#f0e2b8]/70 p-5 sm:flex-row sm:items-center">
        <Skeleton className="size-20 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const name = displayCustomerName(user)
  const location = [user.cityName, user.stateName, user.countryName]
    .filter(Boolean)
    .join(", ")

  const metaParts = [
    user.customerSrNo != null ? `Customer #${user.customerSrNo}` : null,
    location || null,
    user.createdAt ? `Joined ${formatProfileDate(user.createdAt)}` : null,
    user.stylist?.[0]?.name ? `Stylist · ${user.stylist[0].name}` : null,
  ].filter(Boolean)

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#e0c97a]/70 bg-gradient-to-br from-[#faf6eb] via-[#fffdf8] to-[#f3e6bc] shadow-[0_1px_0_rgba(166,124,0,0.08)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#c9a227] via-[#d4af37] to-[#b8860b]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-[#d4af37]/20 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-20 size-52 rounded-full bg-[#c9a227]/15 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
      />

      <div className="relative flex flex-col gap-5 p-5 pl-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-20 rounded-2xl shadow-sm ring-2 ring-[#f5e6c8] after:rounded-2xl">
              {user.images?.profile ? (
                <AvatarImage
                  src={user.images.profile}
                  alt={name}
                  className="rounded-2xl object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-2xl bg-[#efe2b8] text-lg font-medium text-[#7a5c10]">
                {customerInitials(user)}
              </AvatarFallback>
            </Avatar>
            {onUploadPhoto ? (
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                className="absolute -right-1.5 -bottom-1.5 size-7 rounded-full border border-[#e8d5a3] bg-[#fffdf8] shadow-sm"
                onClick={onUploadPhoto}
                aria-label="Upload profile photo"
              >
                <CameraIcon className="size-3.5 text-[#9a7618]" />
              </Button>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="min-w-0 space-y-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-[#1c1708]">
                {name}
              </h1>
              {metaParts.length > 0 ? (
                <p className="text-sm leading-relaxed text-[#7a6a3a]">
                  {metaParts.map((part, index) => (
                    <span key={part}>
                      {index > 0 ? (
                        <span className="mx-1.5 text-[#d4af37]/70" aria-hidden>
                          ·
                        </span>
                      ) : null}
                      {part}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => openWhatsApp(user.countryCode, user.phone)}
                disabled={!user.phone}
              >
                <MessageCircleIcon className="size-3.5" />
                WhatsApp
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-[#e0c97a] bg-[#fffdf8]/90 text-[#5c4508] hover:bg-[#f5e6c8]"
                onClick={() => callPhone(user.countryCode, user.phone)}
                disabled={!user.phone}
              >
                <PhoneIcon className="size-3.5" />
                Call
              </Button>
              <ModuleShortcutsMenu userId={user._id} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:min-w-[230px]">
          <div className="rounded-xl border border-[#e8d5a3]/90 bg-[#fffdf8]/85 px-3.5 py-3 shadow-sm backdrop-blur-sm">
            <p className="text-[11px] font-medium tracking-wide text-[#9a7618] uppercase">
              Orders
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#1c1708]">
              {orderStats?.totalCount ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#d4af37]/50 bg-gradient-to-br from-[#f5e6c8] to-[#e8d5a3]/80 px-3.5 py-3 shadow-sm">
            <p className="text-[11px] font-medium tracking-wide text-[#7a5c10] uppercase">
              Order value
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[#5c4508]">
              {formatInr(orderStats?.totalAmount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
