"use client"

import { useState } from "react"
import { Columns3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { notify } from "@/lib/notify"
import {
  activateGridPreset,
  createGridNamedPreset,
  deleteGridPreset,
  renameGridPreset,
  resetGridWorkingPreset,
  type GridPresetDto,
  type GridPresetsResponse,
} from "@/lib/prefs/client"
import { MAX_NAMED_PRESETS } from "@/lib/prefs/constants"

type GridColumnsPresetMenuProps = {
  gridKey: string
  presets: GridPresetsResponse | null
  onPresetsChange: (data: GridPresetsResponse) => void
  getColumnState: () => unknown[]
  applyColumnState: (state: unknown[]) => void
  onResetLayout: () => void
}

export function GridColumnsPresetMenu({
  gridKey,
  presets,
  onPresetsChange,
  getColumnState,
  applyColumnState,
  onResetLayout,
}: GridColumnsPresetMenuProps) {
  const [saveOpen, setSaveOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<GridPresetDto | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [busy, setBusy] = useState(false)

  const namedCount =
    presets?.presets.filter((p) => p.kind === "named").length ?? 0
  const canSaveAs = namedCount < MAX_NAMED_PRESETS
  const active = presets?.presets.find((p) => p.id === presets.activePresetId)
  const activeNamed = active?.kind === "named" ? active : null

  async function run(
    action: () => Promise<GridPresetsResponse>,
    successMsg?: string
  ) {
    setBusy(true)
    try {
      const data = await action()
      onPresetsChange(data)
      applyColumnState(data.columnState)
      if (successMsg) notify.success(successMsg)
    } catch (err) {
      notify.fromError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy || !presets}
            />
          }
        >
          <Columns3Icon className="size-3.5" />
          Columns
          {active ? (
            <span className="text-muted-foreground max-w-[7rem] truncate text-xs font-normal">
              · {active.name}
            </span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {presets ? (
            <DropdownMenuRadioGroup
              value={presets.activePresetId}
              onValueChange={(presetId) => {
                if (presetId === presets.activePresetId) return
                void run(
                  () => activateGridPreset(gridKey, presetId),
                  "Layout switched"
                )
              }}
            >
              <DropdownMenuLabel>Layout preset</DropdownMenuLabel>
              {presets.presets.map((preset) => (
                <DropdownMenuRadioItem key={preset.id} value={preset.id}>
                  {preset.name}
                  {preset.kind === "working" ? (
                    <span className="text-muted-foreground ml-1 text-xs">
                      (auto)
                    </span>
                  ) : null}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          ) : (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Layout preset</DropdownMenuLabel>
            </DropdownMenuGroup>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!canSaveAs || busy}
            onClick={() => {
              setNameInput("")
              setSaveOpen(true)
            }}
          >
            Save as preset…
            {!canSaveAs ? (
              <span className="text-muted-foreground ml-auto text-xs">
                max {MAX_NAMED_PRESETS}
              </span>
            ) : null}
          </DropdownMenuItem>

          {activeNamed ? (
            <DropdownMenuItem
              disabled={busy}
              onClick={() => {
                setRenameTarget(activeNamed)
                setNameInput(activeNamed.name)
                setRenameOpen(true)
              }}
            >
              Rename “{activeNamed.name}”…
            </DropdownMenuItem>
          ) : null}

          {activeNamed ? (
            <DropdownMenuItem
              disabled={busy}
              variant="destructive"
              onClick={() => {
                void run(
                  () => deleteGridPreset(gridKey, activeNamed.id),
                  "Preset deleted"
                )
              }}
            >
              Delete “{activeNamed.name}”
            </DropdownMenuItem>
          ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={busy}
            onClick={() => {
              void run(async () => {
                const data = await resetGridWorkingPreset(gridKey)
                onResetLayout()
                return data
              }, "Layout reset")
            }}
          >
            Reset to defaults
          </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save column layout</DialogTitle>
            <DialogDescription>
              Store the current column order, widths, and visibility as a named
              preset (up to {MAX_NAMED_PRESETS}).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="grid-preset-save-name">Preset name</Label>
            <Input
              id="grid-preset-save-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Dense view"
              maxLength={40}
              autoFocus
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()
                const name = nameInput.trim()
                if (!name || busy) return
                void run(async () => {
                  const data = await createGridNamedPreset(
                    gridKey,
                    name,
                    getColumnState()
                  )
                  setSaveOpen(false)
                  return data
                }, "Preset saved")
              }}
            />
          </div>
          <DialogFooter className="justify-end gap-2 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !nameInput.trim()}
              onClick={() => {
                const name = nameInput.trim()
                if (!name) return
                void run(async () => {
                  const data = await createGridNamedPreset(
                    gridKey,
                    name,
                    getColumnState()
                  )
                  setSaveOpen(false)
                  return data
                }, "Preset saved")
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename preset</DialogTitle>
            <DialogDescription>
              Update the display name for this saved layout.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 px-5 py-5">
            <Label htmlFor="grid-preset-rename-name">Preset name</Label>
            <Input
              id="grid-preset-rename-name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Preset name"
              maxLength={40}
              autoFocus
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                e.preventDefault()
                const name = nameInput.trim()
                if (!name || busy || !renameTarget) return
                void run(async () => {
                  const data = await renameGridPreset(
                    gridKey,
                    renameTarget.id,
                    name
                  )
                  setRenameOpen(false)
                  return data
                }, "Preset renamed")
              }}
            />
          </div>
          <DialogFooter className="justify-end gap-2 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy || !nameInput.trim() || !renameTarget}
              onClick={() => {
                const name = nameInput.trim()
                if (!name || !renameTarget) return
                void run(async () => {
                  const data = await renameGridPreset(
                    gridKey,
                    renameTarget.id,
                    name
                  )
                  setRenameOpen(false)
                  return data
                }, "Preset renamed")
              }}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
