"use client"

import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PrinterIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CifListRow } from "@/lib/apollo/queries/cif"

type CifRowActionsProps = {
  row: CifListRow
  onView: () => void
}

export function CifRowActions({ row, onView }: CifRowActionsProps) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="CIF actions"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuItem onClick={onView}>
          <EyeIcon className="size-4" />
          Quick view
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/cif/form?cifId=${row._id}`)}
        >
          <PencilIcon className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/cif/print/${row._id}`)}
        >
          <PrinterIcon className="size-4" />
          Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
