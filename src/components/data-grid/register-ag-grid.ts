import {
  ModuleRegistry,
  ClientSideRowModelModule,
  ClientSideRowModelApiModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  RowStyleModule,
  RowApiModule,
  ValueCacheModule,
  TooltipModule,
  QuickFilterModule,
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
    ClientSideRowModelApiModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    ColumnAutoSizeModule,
    CellStyleModule,
    RowStyleModule,
    RowApiModule,
    ValueCacheModule,
    TooltipModule,
    QuickFilterModule,
  ])
}
