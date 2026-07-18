"use client"

import { MoreHorizontalIcon, PencilIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProductListRow } from "@/lib/apollo/queries/products"

type ProductRowActionsProps = {
  row: ProductListRow
}

export function ProductRowActions({ row }: ProductRowActionsProps) {
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
            aria-label="Product actions"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-36">
        <DropdownMenuItem
          onClick={() => router.push(`/products/form?productId=${row._id}`)}
        >
          <PencilIcon className="size-4" />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
