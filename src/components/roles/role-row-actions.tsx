"use client"

import { ShieldIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { RoleListRow } from "@/lib/apollo/queries/roles"

type RoleRowActionsProps = {
  role: RoleListRow
  onPermissions: (role: RoleListRow) => void
}

export function RoleRowActions({ role, onPermissions }: RoleRowActionsProps) {
  return (
    <Button
      type="button"
      size="xs"
      variant="default"
      className="h-7"
      onClick={(e) => {
        e.stopPropagation()
        onPermissions(role)
      }}
    >
      <ShieldIcon className="size-3.5" />
      Permissions
    </Button>
  )
}
