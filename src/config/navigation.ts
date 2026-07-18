import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bell,
  BookOpen,
  Box,
  Calendar,
  ClipboardCheck,
  FileText,
  FormInput,
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  Ruler,
  Scissors,
  Shield,
  ShoppingBag,
  Shirt,
  Ticket,
  Users,
  UsersRound,
} from "lucide-react"

export type NavItem = {
  title: string
  href?: string
  icon?: LucideIcon
  children?: { title: string; href: string }[]
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Look Book",
    href: "/lookbook",
    icon: BookOpen,
  },
  {
    title: "Naira",
    icon: MessageSquare,
    children: [
      { title: "Chat with Naira", href: "/naira" },
      { title: "Naira pricing", href: "/naira/pricing" },
    ],
  },
  {
    title: "Users",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: UsersRound,
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Customer Informations",
    href: "/cif",
    icon: FormInput,
  },
  {
    title: "Client Connect",
    href: "/client-connect",
    icon: BookOpen,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: Package,
  },
  {
    title: "Receipts",
    href: "/receipts",
    icon: Receipt,
  },
  {
    title: "Online Orders",
    href: "/online-orders",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    href: "/products",
    icon: Shirt,
  },
  {
    title: "Measurements",
    href: "/measurements",
    icon: Ruler,
  },
  {
    title: "Track Orders",
    icon: Box,
    children: [
      { title: "List", href: "/track-orders" },
      { title: "Calendar", href: "/track-orders/calendar" },
    ],
  },
  {
    title: "Embroidery",
    icon: Scissors,
    children: [
      { title: "Running Emb List", href: "/embroidery" },
      { title: "Completed Emb List", href: "/embroidery/completed" },
    ],
  },
  {
    title: "Quality Check",
    href: "/quality-check",
    icon: ClipboardCheck,
  },
  {
    title: "Trial",
    href: "/trial",
    icon: Shirt,
  },
  {
    title: "Invoice",
    href: "/invoice",
    icon: FileText,
  },
  {
    title: "Role Management",
    icon: Shield,
    children: [
      { title: "Roles", href: "/roles" },
      { title: "Team Members", href: "/team-members" },
    ],
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Ticket Tracker",
    href: "/ticket-tracker",
    icon: Ticket,
  },
  {
    title: "Release Versions",
    href: "/release-versions",
    icon: Bell,
  },
]

export function getPageTitle(pathname: string): string {
  for (const item of navigation) {
    if (item.href === pathname) return item.title
    if (item.children) {
      const child = item.children.find((c) => c.href === pathname)
      if (child) return child.title
    }
  }
  return "Dashboard"
}
