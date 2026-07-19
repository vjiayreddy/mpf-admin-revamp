"use client"

import { useRouter } from "next/navigation"
import { LayoutGridIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CUSTOMER_MODULE_SHORTCUTS } from "@/config/customer-profile"

type ModuleShortcutsMenuProps = {
  userId: string
}

export function ModuleShortcutsMenu({ userId }: ModuleShortcutsMenuProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[#e0c97a] bg-[#fffdf8]/90 text-[#5c4508] hover:bg-[#f5e6c8]"
          />
        }
      >
        <LayoutGridIcon className="size-3.5" />
        Modules
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Customer modules</DropdownMenuLabel>
          {CUSTOMER_MODULE_SHORTCUTS.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.title}
                onClick={() => router.push(item.href(userId))}
              >
                <Icon className="size-3.5" />
                {item.title}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
