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

/** Singleton portal maintenance / deployment announcement state. */
export const maintenanceStatus = sqliteTable("maintenance_status", {
  id: text("id").primaryKey(), // always "current"
  status: text("status").notNull(), // "idle" | "upcoming" | "active"
  message: text("message").notNull().default(""),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }),
  endsAtEstimate: integer("ends_at_estimate", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  updatedBy: text("updated_by"),
})

/**
 * Per-user “save for later” bookmarks (orders, leads, …).
 * Unique on (userId, entityType, entityId).
 */
export const entityBookmarks = sqliteTable("entity_bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  entityType: text("entity_type").notNull(), // "order" | "lead"
  entityId: text("entity_id").notNull(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  subtitle: text("subtitle"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .defaultNow()
    .notNull(),
})
