"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react"
import type {
  ColumnMovedEvent,
  ColumnPinnedEvent,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  GridApi,
  GridReadyEvent,
  SortChangedEvent,
} from "ag-grid-community"

import {
  fetchGridPresets,
  saveGridColumnState,
  type GridPresetsResponse,
} from "@/lib/prefs/client"

const SAVE_DEBOUNCE_MS = 400

type UseGridColumnPersistenceArgs<TData> = {
  persistKey?: string
  gridApiRef?: MutableRefObject<GridApi<TData> | null>
  onGridReady?: (event: GridReadyEvent<TData>) => void
}

export function useGridColumnPersistence<TData>({
  persistKey,
  gridApiRef,
  onGridReady,
}: UseGridColumnPersistenceArgs<TData>) {
  const [presets, setPresets] = useState<GridPresetsResponse | null>(null)
  const apiRef = useRef<GridApi<TData> | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const restoringRef = useRef(false)
  const readyRef = useRef(false)

  const applyState = useCallback((api: GridApi<TData>, state: unknown[]) => {
    if (!state.length) return
    restoringRef.current = true
    try {
      api.applyColumnState({
        state: state as Parameters<GridApi["applyColumnState"]>[0]["state"],
        applyOrder: true,
      })
    } finally {
      // Allow AG Grid events from apply to settle before saving again.
      window.setTimeout(() => {
        restoringRef.current = false
      }, 0)
    }
  }, [])

  const loadAndApply = useCallback(
    async (api: GridApi<TData>) => {
      if (!persistKey) return
      try {
        const data = await fetchGridPresets(persistKey)
        setPresets(data)
        applyState(api, data.columnState)
      } catch {
        // Fail soft — grid still usable with defaults.
      }
    },
    [persistKey, applyState]
  )

  const scheduleSave = useCallback(() => {
    if (!persistKey || restoringRef.current) return
    const api = apiRef.current
    if (!api) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const state = api.getColumnState()
      void saveGridColumnState(persistKey, state)
        .then((data) => setPresets(data))
        .catch(() => {
          // Fail soft
        })
    }, SAVE_DEBOUNCE_MS)
  }, [persistKey])

  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      apiRef.current = event.api
      if (gridApiRef) gridApiRef.current = event.api
      readyRef.current = true
      onGridReady?.(event)
      void loadAndApply(event.api)
    },
    [gridApiRef, onGridReady, loadAndApply]
  )

  const refreshPresets = useCallback(async () => {
    if (!persistKey || !apiRef.current) return null
    const data = await fetchGridPresets(persistKey)
    setPresets(data)
    applyState(apiRef.current, data.columnState)
    return data
  }, [persistKey, applyState])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const columnListeners = persistKey
    ? {
        onColumnMoved: (_e: ColumnMovedEvent<TData>) => scheduleSave(),
        onColumnResized: (e: ColumnResizedEvent<TData>) => {
          if (e.finished) scheduleSave()
        },
        onColumnVisible: (_e: ColumnVisibleEvent<TData>) => scheduleSave(),
        onColumnPinned: (_e: ColumnPinnedEvent<TData>) => scheduleSave(),
        onSortChanged: (_e: SortChangedEvent<TData>) => scheduleSave(),
      }
    : {}

  return {
    persistKey,
    presets,
    setPresets,
    handleGridReady,
    columnListeners,
    scheduleSave,
    refreshPresets,
    getColumnState: () => apiRef.current?.getColumnState() ?? [],
    applyColumnState: (state: unknown[]) => {
      if (!apiRef.current) return
      if (!state.length) {
        restoringRef.current = true
        try {
          apiRef.current.resetColumnState()
        } finally {
          window.setTimeout(() => {
            restoringRef.current = false
          }, 0)
        }
        return
      }
      applyState(apiRef.current, state)
    },
    resetColumnState: () => {
      if (!apiRef.current) return
      restoringRef.current = true
      try {
        apiRef.current.resetColumnState()
      } finally {
        window.setTimeout(() => {
          restoringRef.current = false
        }, 0)
      }
    },
    maintainColumnOrder: Boolean(persistKey),
  }
}
