"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { navigation, type NavItem } from "@/config/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function isActive(pathname: string, href?: string) {
  if (!href) return false
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLeaf({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href ?? "#"} />}
        isActive={active}
        tooltip={item.title}
      >
        {Icon ? <Icon /> : null}
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const Icon = item.icon
  const childActive = item.children?.some((c) => isActive(pathname, c.href))

  return (
    <Collapsible
      defaultOpen={childActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton tooltip={item.title} isActive={childActive} />
          }
        >
          {Icon ? <Icon /> : null}
          <span>{item.title}</span>
          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton
                  render={<Link href={child.href} />}
                  isActive={isActive(pathname, child.href)}
                >
                  <span>{child.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Operations</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigation.map((item) =>
            item.children?.length ? (
              <NavGroup key={item.title} item={item} />
            ) : (
              <NavLeaf key={item.title} item={item} />
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
