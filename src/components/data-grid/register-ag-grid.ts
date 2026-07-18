import {
  ModuleRegistry,
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  ValueCacheModule,
  enableDevValidations,
} from "ag-grid-community"

let registered = false

/** Register only modules we use — smaller runtime than AllCommunityModule. */
export function ensureAgGridModules() {
  if (registered) return
  registered = true

  if (process.env.NODE_ENV !== "production") {
    enableDevValidations()
  }

  ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ColumnAutoSizeModule,
    CellStyleModule,
    ValueCacheModule,
  ])
}
