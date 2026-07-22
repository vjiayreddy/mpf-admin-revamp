"use client"

import Link from "next/link"
import {
  BarChart3Icon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  RulerIcon,
  ScissorsIcon,
  UsersIcon,
} from "lucide-react"

const ACTIONS = [
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
    <section className="flex w-full flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          Quick actions
        </h2>
        <p className="text-muted-foreground text-sm">
          Start work without hunting the sidebar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7">
        {ACTIONS.map((action) => {
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
