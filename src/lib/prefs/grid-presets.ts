import { and, eq } from "drizzle-orm"

import {
  MAX_NAMED_PRESETS,
  WORKING_PRESET_NAME,
} from "@/lib/prefs/constants"
import { prefsDb } from "@/lib/prefs/prefs-db"
import {
  gridActivePreset,
  gridColumnPresets,
} from "@/lib/prefs/prefs-schema"

export { MAX_NAMED_PRESETS, WORKING_PRESET_NAME }

export type GridPresetKind = "working" | "named"

export type GridPresetDto = {
  id: string
  name: string
  kind: GridPresetKind
  updatedAt: string
}

export type GridPresetsResponse = {
  presets: GridPresetDto[]
  activePresetId: string
  columnState: unknown[]
}

const GRID_KEY_RE = /^[a-z0-9][a-z0-9_-]{1,64}$/

export function isValidGridKey(gridKey: string) {
  return GRID_KEY_RE.test(gridKey)
}

function newId() {
  return crypto.randomUUID()
}

function parseState(json: string): unknown[] {
  try {
    const parsed = JSON.parse(json) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toDto(row: typeof gridColumnPresets.$inferSelect): GridPresetDto {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind as GridPresetKind,
    updatedAt: new Date(row.updatedAt).toISOString(),
  }
}

async function ensureWorkingPreset(userId: string, gridKey: string) {
  const existing = await prefsDb
    .select()
    .from(gridColumnPresets)
    .where(
      and(
        eq(gridColumnPresets.userId, userId),
        eq(gridColumnPresets.gridKey, gridKey),
        eq(gridColumnPresets.kind, "working")
      )
    )
    .limit(1)

  if (existing[0]) return existing[0]

  const id = newId()
  const now = new Date()
  const row = {
    id,
    userId,
    gridKey,
    name: WORKING_PRESET_NAME,
    kind: "working" as const,
    columnStateJson: "[]",
    updatedAt: now,
  }
  await prefsDb.insert(gridColumnPresets).values(row)
  return row
}

async function getActivePresetId(
  userId: string,
  gridKey: string,
  workingId: string
) {
  const active = await prefsDb
    .select()
    .from(gridActivePreset)
    .where(
      and(
        eq(gridActivePreset.userId, userId),
        eq(gridActivePreset.gridKey, gridKey)
      )
    )
    .limit(1)

  if (active[0]?.activePresetId) {
    const preset = await prefsDb
      .select()
      .from(gridColumnPresets)
      .where(eq(gridColumnPresets.id, active[0].activePresetId))
      .limit(1)
    if (preset[0] && preset[0].userId === userId) {
      return active[0].activePresetId
    }
  }

  if (active[0]) {
    await prefsDb
      .update(gridActivePreset)
      .set({ activePresetId: workingId, updatedAt: new Date() })
      .where(
        and(
          eq(gridActivePreset.userId, userId),
          eq(gridActivePreset.gridKey, gridKey)
        )
      )
  } else {
    await prefsDb.insert(gridActivePreset).values({
      userId,
      gridKey,
      activePresetId: workingId,
      updatedAt: new Date(),
    })
  }

  return workingId
}

export async function getGridPresets(
  userId: string,
  gridKey: string
): Promise<GridPresetsResponse> {
  const working = await ensureWorkingPreset(userId, gridKey)
  const rows = await prefsDb
    .select()
    .from(gridColumnPresets)
    .where(
      and(
        eq(gridColumnPresets.userId, userId),
        eq(gridColumnPresets.gridKey, gridKey)
      )
    )

  const activePresetId = await getActivePresetId(userId, gridKey, working.id)
  const active =
    rows.find((r) => r.id === activePresetId) ??
    rows.find((r) => r.kind === "working") ??
    working

  const presets = [...rows]
    .sort((a, b) => {
      if (a.kind === "working") return -1
      if (b.kind === "working") return 1
      return a.name.localeCompare(b.name)
    })
    .map(toDto)

  return {
    presets,
    activePresetId: active.id,
    columnState: parseState(active.columnStateJson),
  }
}

/** Persist column state to the currently active preset (working or named). */
export async function saveActiveColumnState(
  userId: string,
  gridKey: string,
  columnState: unknown[]
) {
  const working = await ensureWorkingPreset(userId, gridKey)
  const activeId = await getActivePresetId(userId, gridKey, working.id)

  await prefsDb
    .update(gridColumnPresets)
    .set({
      columnStateJson: JSON.stringify(columnState),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(gridColumnPresets.id, activeId),
        eq(gridColumnPresets.userId, userId)
      )
    )

  return getGridPresets(userId, gridKey)
}

export async function createNamedPreset(
  userId: string,
  gridKey: string,
  name: string,
  columnState: unknown[]
) {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error("Preset name is required")
  }
  if (trimmed.length > 48) {
    throw new Error("Preset name is too long")
  }

  await ensureWorkingPreset(userId, gridKey)

  const named = await prefsDb
    .select()
    .from(gridColumnPresets)
    .where(
      and(
        eq(gridColumnPresets.userId, userId),
        eq(gridColumnPresets.gridKey, gridKey),
        eq(gridColumnPresets.kind, "named")
      )
    )

  if (named.length >= MAX_NAMED_PRESETS) {
    throw new Error(
      `You can save at most ${MAX_NAMED_PRESETS} named presets. Delete one first.`
    )
  }

  const id = newId()
  await prefsDb.insert(gridColumnPresets).values({
    id,
    userId,
    gridKey,
    name: trimmed,
    kind: "named",
    columnStateJson: JSON.stringify(columnState),
    updatedAt: new Date(),
  })

  await setActivePreset(userId, gridKey, id)
  return getGridPresets(userId, gridKey)
}

export async function setActivePreset(
  userId: string,
  gridKey: string,
  presetId: string
) {
  const preset = await prefsDb
    .select()
    .from(gridColumnPresets)
    .where(
      and(
        eq(gridColumnPresets.id, presetId),
        eq(gridColumnPresets.userId, userId),
        eq(gridColumnPresets.gridKey, gridKey)
      )
    )
    .limit(1)

  if (!preset[0]) {
    throw new Error("Preset not found")
  }

  const existing = await prefsDb
    .select()
    .from(gridActivePreset)
    .where(
      and(
        eq(gridActivePreset.userId, userId),
        eq(gridActivePreset.gridKey, gridKey)
      )
    )
    .limit(1)

  if (existing[0]) {
    await prefsDb
      .update(gridActivePreset)
      .set({ activePresetId: presetId, updatedAt: new Date() })
      .where(
        and(
          eq(gridActivePreset.userId, userId),
          eq(gridActivePreset.gridKey, gridKey)
        )
      )
  } else {
    await prefsDb.insert(gridActivePreset).values({
      userId,
      gridKey,
      activePresetId: presetId,
      updatedAt: new Date(),
    })
  }

  return getGridPresets(userId, gridKey)
}

export async function renameNamedPreset(
  userId: string,
  gridKey: string,
  presetId: string,
  name: string
) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Preset name is required")

  const preset = await prefsDb
    .select()
    .from(gridColumnPresets)
    .where(
      and(
        eq(gridColumnPresets.id, presetId),
        eq(gridColumnPresets.userId, userId),
        eq(gridColumnPresets.gridKey, gridKey),
        eq(gridColumnPresets.kind, "named")
      )
    )
    .limit(1)

  if (!preset[0]) throw new Error("Named preset not found")

  await prefsDb
    .update(gridColumnPresets)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(eq(gridColumnPresets.id, presetId))

  return getGridPresets(userId, gridKey)
}

export async function deleteNamedPreset(
  userId: string,
  gridKey: string,
  presetId: string
) {
  const preset = await prefsDb
    .select()
    .from(gridColumnPresets)
    .where(
      and(
        eq(gridColumnPresets.id, presetId),
        eq(gridColumnPresets.userId, userId),
        eq(gridColumnPresets.gridKey, gridKey),
        eq(gridColumnPresets.kind, "named")
      )
    )
    .limit(1)

  if (!preset[0]) throw new Error("Named preset not found")

  const working = await ensureWorkingPreset(userId, gridKey)
  const activeId = await getActivePresetId(userId, gridKey, working.id)

  await prefsDb
    .delete(gridColumnPresets)
    .where(eq(gridColumnPresets.id, presetId))

  if (activeId === presetId) {
    await setActivePreset(userId, gridKey, working.id)
  }

  return getGridPresets(userId, gridKey)
}

export async function resetWorkingPreset(userId: string, gridKey: string) {
  const working = await ensureWorkingPreset(userId, gridKey)
  await prefsDb
    .update(gridColumnPresets)
    .set({ columnStateJson: "[]", updatedAt: new Date() })
    .where(eq(gridColumnPresets.id, working.id))
  await setActivePreset(userId, gridKey, working.id)
  return getGridPresets(userId, gridKey)
}
