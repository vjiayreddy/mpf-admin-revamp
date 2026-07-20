import type {
  GridPresetDto,
  GridPresetsResponse,
} from "@/lib/prefs/grid-presets"

export type { GridPresetDto, GridPresetsResponse }

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export async function fetchGridPresets(
  gridKey: string
): Promise<GridPresetsResponse> {
  const res = await fetch(`/api/prefs/grids/${encodeURIComponent(gridKey)}`, {
    method: "GET",
    credentials: "same-origin",
  })
  return parseJson<GridPresetsResponse>(res)
}

export async function saveGridColumnState(
  gridKey: string,
  columnState: unknown[]
): Promise<GridPresetsResponse> {
  const res = await fetch(
    `/api/prefs/grids/${encodeURIComponent(gridKey)}/active`,
    {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnState }),
    }
  )
  return parseJson<GridPresetsResponse>(res)
}

export async function createGridNamedPreset(
  gridKey: string,
  name: string,
  columnState: unknown[]
): Promise<GridPresetsResponse> {
  const res = await fetch(
    `/api/prefs/grids/${encodeURIComponent(gridKey)}/presets`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, columnState }),
    }
  )
  return parseJson<GridPresetsResponse>(res)
}

export async function activateGridPreset(
  gridKey: string,
  presetId: string
): Promise<GridPresetsResponse> {
  const res = await fetch(
    `/api/prefs/grids/${encodeURIComponent(gridKey)}/activate`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presetId }),
    }
  )
  return parseJson<GridPresetsResponse>(res)
}

export async function renameGridPreset(
  gridKey: string,
  presetId: string,
  name: string
): Promise<GridPresetsResponse> {
  const res = await fetch(
    `/api/prefs/grids/${encodeURIComponent(gridKey)}/presets/${encodeURIComponent(presetId)}`,
    {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }
  )
  return parseJson<GridPresetsResponse>(res)
}

export async function deleteGridPreset(
  gridKey: string,
  presetId: string
): Promise<GridPresetsResponse> {
  const res = await fetch(
    `/api/prefs/grids/${encodeURIComponent(gridKey)}/presets/${encodeURIComponent(presetId)}`,
    {
      method: "DELETE",
      credentials: "same-origin",
    }
  )
  return parseJson<GridPresetsResponse>(res)
}

export async function resetGridWorkingPreset(
  gridKey: string
): Promise<GridPresetsResponse> {
  const res = await fetch(`/api/prefs/grids/${encodeURIComponent(gridKey)}`, {
    method: "DELETE",
    credentials: "same-origin",
  })
  return parseJson<GridPresetsResponse>(res)
}
