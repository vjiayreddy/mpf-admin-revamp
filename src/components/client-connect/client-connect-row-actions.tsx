"use client"

import {
  BookOpenIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ClientConnectListRow } from "@/lib/apollo/queries/client-connect"
import { callPhone, openWhatsApp } from "@/lib/customers/profile-display"

type ClientConnectRowActionsProps = {
  row: ClientConnectListRow
  onOpenDiary: () => void
  onOpenQuickView: () => void
}

export function ClientConnectRowActions({
  row,
  onOpenDiary,
  onOpenQuickView,
}: ClientConnectRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Client connect actions"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            onOpenDiary()
          }}
        >
          <BookOpenIcon className="size-4" />
          Open diary
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onOpenQuickView()
          }}
        >
          <UserIcon className="size-4" />
          Quick view
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openWhatsApp(row.countryCode, row.phone)}
        >
          <MessageCircleIcon className="size-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => callPhone(row.countryCode, row.phone)}
        >
          <PhoneIcon className="size-4" />
          Call
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
