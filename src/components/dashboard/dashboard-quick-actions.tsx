"use client"

import Link from "next/link"
import {
  BarChart3Icon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  PlusIcon,
  RulerIcon,
  ScissorsIcon,
  UsersIcon,
} from "lucide-react"

const SECONDARY_ACTIONS = [
  {
    label: "Appointments",
    href: "/appointments",
    icon: CalendarDaysIcon,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: UsersIcon,
  },
  {
    label: "Trial",
    href: "/trial",
    icon: RulerIcon,
  },
  {
    label: "Quality check",
    href: "/quality-check",
    icon: ClipboardCheckIcon,
  },
  {
    label: "Embroidery",
    href: "/embroidery",
    icon: ScissorsIcon,
  },
  {
    label: "Invoice",
    href: "/invoice",
    icon: FileTextIcon,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3Icon,
  },
] as const

export function DashboardQuickActions() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">Quick actions</h2>
        <p className="text-muted-foreground text-sm">
          Start work without hunting the sidebar.
        </p>
      </div>

      <Link
        href="/orders/form"
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-3 rounded-xl px-4 py-4 transition-colors"
      >
        <span className="bg-primary-foreground/15 flex size-10 items-center justify-center rounded-lg">
          <PlusIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">New order</span>
          <span className="block text-xs opacity-80">
            Create a store order for a customer
          </span>
        </span>
      </Link>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {SECONDARY_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              className="hover:bg-muted/40 bg-card flex flex-col gap-2.5 rounded-xl border p-3.5 transition-colors"
            >
              <Icon className="text-muted-foreground size-4" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
