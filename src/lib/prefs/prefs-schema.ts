import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"

/** Saved AG Grid column layouts per user + grid. */
export const gridColumnPresets = sqliteTable("grid_column_presets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  gridKey: text("grid_key").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // "working" | "named"
  columnStateJson: text("column_state_json").notNull().default("[]"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .defaultNow()
    .notNull(),
})

/** Which preset is active for a user + grid. */
export const gridActivePreset = sqliteTable(
  "grid_active_preset",
  {
    userId: text("user_id").notNull(),
    gridKey: text("grid_key").notNull(),
    activePresetId: text("active_preset_id").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.gridKey] })]
)
