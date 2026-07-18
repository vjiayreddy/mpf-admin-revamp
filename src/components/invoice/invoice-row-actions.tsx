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
import type { InvoiceListRow } from "@/lib/apollo/queries/invoice"

type InvoiceRowActionsProps = {
  row: InvoiceListRow
}

export function InvoiceRowActions({ row }: InvoiceRowActionsProps) {
  const router = useRouter()
  const previewPath = `/invoice/preview/${row._id}`
  const formPath = `/invoice/form?invoiceId=${row._id}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Invoice actions"
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuItem onClick={() => router.push(previewPath)}>
          <EyeIcon className="size-4" />
          View invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(formPath)}>
          <PencilIcon className="size-4" />
          Edit invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(previewPath)}>
          <PrinterIcon className="size-4" />
          Print invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
