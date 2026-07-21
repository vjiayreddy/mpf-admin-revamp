"use client"

import { useEffect, useId, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { OrderMoneyLine } from "@/lib/orders/form"
import { formatRupees } from "@/lib/track-orders/format"

type MoneyFormValues = {
  name: string
  amount: string
  note: string
}

export type OrderMoneyLinesSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  lines: OrderMoneyLine[]
  onSave: (lines: OrderMoneyLine[]) => void
}

export function OrderMoneyLinesSheet({
  open,
  onOpenChange,
  title,
  description,
  lines,
  onSave,
}: OrderMoneyLinesSheetProps) {
  const formId = useId()
  const [draft, setDraft] = useState<OrderMoneyLine[]>([])
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const { register, handleSubmit, reset } = useForm<MoneyFormValues>({
    defaultValues: { name: "", amount: "", note: "" },
  })

  useEffect(() => {
    if (!open) return
    setDraft(lines.map((line) => ({ ...line })))
    setEditIndex(null)
    reset({ name: "", amount: "", note: "" })
  }, [open, lines, reset])

  const total = draft.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)

  const onAddOrUpdate = (values: MoneyFormValues) => {
    const next: OrderMoneyLine = {
      name: values.name.trim(),
      amount: Number(values.amount) || 0,
      note: values.note.trim(),
    }
    if (!next.name) return
    setDraft((prev) => {
      if (editIndex != null) {
        const copy = [...prev]
        copy[editIndex] = next
        return copy
      }
      return [...prev, next]
    })
    setEditIndex(null)
    reset({ name: "", amount: "", note: "" })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="space-y-1 border-b px-5 py-4">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <form
            id={formId}
            className="grid gap-3"
            onSubmit={handleSubmit(onAddOrUpdate)}
          >
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-name`}>Name</Label>
              <Input
                id={`${formId}-name`}
                {...register("name", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-amount`}>Amount</Label>
              <Input
                id={`${formId}-amount`}
                type="number"
                min={0}
                step="1"
                {...register("amount", { required: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-note`}>Note</Label>
              <Textarea id={`${formId}-note`} rows={2} {...register("note")} />
            </div>
            <Button type="submit" size="sm" className="w-fit">
              <PlusIcon className="size-4" />
              {editIndex != null ? "Update line" : "Add line"}
            </Button>
          </form>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Lines ({draft.length})</span>
              <span className="tabular-nums">{formatRupees(total)}</span>
            </div>
            {draft.length === 0 ? (
              <p className="text-muted-foreground text-sm">No lines yet.</p>
            ) : (
              <ul className="space-y-2">
                {draft.map((line, index) => (
                  <li
                    key={`${line.name}-${index}`}
                    className="bg-muted/30 flex items-start justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {line.name || "—"}
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {formatRupees(line.amount)}
                        {line.note?.trim() ? ` · ${line.note}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-7"
                        aria-label="Edit line"
                        onClick={() => {
                          setEditIndex(index)
                          reset({
                            name: line.name || "",
                            amount: String(line.amount ?? 0),
                            note: line.note || "",
                          })
                        }}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-7"
                        aria-label="Delete line"
                        onClick={() =>
                          setDraft((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <SheetFooter className="border-t px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
