"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  SAVE_ROLE,
  slugifyRoleName,
  type SaveRoleData,
  type SaveRoleVars,
} from "@/lib/apollo/queries/roles"

const schema = z.object({
  label: z.string().trim().min(1, "Full name is required"),
  note: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type CreateRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateRoleDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [saveRole, { loading }] = useMutation<SaveRoleData, SaveRoleVars>(
    SAVE_ROLE
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", note: "" },
  })

  useEffect(() => {
    if (!open) return
    reset({ label: "", note: "" })
    setSubmitError(null)
  }, [open, reset])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await saveRole({
        variables: {
          label: values.label.trim(),
          note: values.note?.trim() || null,
          name: slugifyRoleName(values.label),
        },
      })
      onOpenChange(false)
      onCreated?.()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create role"
      )
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>
            Roles control access to menus and features for team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 px-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="role-label">Full name</Label>
            <Input
              id="role-label"
              placeholder="e.g. Studio Manager"
              disabled={loading || isSubmitting}
              {...register("label")}
            />
            {errors.label ? (
              <p className="text-destructive text-xs">{errors.label.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role-note">Note</Label>
            <Textarea
              id="role-note"
              rows={3}
              placeholder="Optional description"
              disabled={loading || isSubmitting}
              {...register("note")}
            />
          </div>

          {submitError ? (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
              {submitError}
            </p>
          ) : null}

          <DialogFooter className="border-0 px-0 py-0">
            <Button
              type="button"
              variant="outline"
              disabled={loading || isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isSubmitting}>
              {loading || isSubmitting ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
