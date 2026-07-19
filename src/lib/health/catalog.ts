import type { HealthModuleId } from "@/lib/health/types"
import { HEALTH_MODULES } from "@/lib/health/types"

/** Client-safe catalog — one row per GraphQL/HTTP endpoint check. */
export type HealthCheckMeta = {
  id: string
  module: HealthModuleId
  name: string
  /** Short label for compact UI */
  endpoint: string
  optional?: boolean
}

export const HEALTH_CHECK_CATALOG: HealthCheckMeta[] = [
  {
    id: "core.users_list",
    module: "core",
    name: "GraphQL reachable",
    endpoint: "getUsersByFilter",
  },
  {
    id: "customers.list",
    module: "customers",
    name: "List customers",
    endpoint: "getUsersByFilter",
  },
  {
    id: "customers.get",
    module: "customers",
    name: "Get customer by id",
    endpoint: "user(id)",
    optional: true,
  },
  {
    id: "customers.search",
    module: "customers",
    name: "Search customers",
    endpoint: "getUsersByFilter(search)",
  },
  {
    id: "measurements.body_profile",
    module: "measurements",
    name: "Load body profile",
    endpoint: "getBodyProfile",
    optional: true,
  },
  {
    id: "measurements.list",
    module: "measurements",
    name: "List measurements",
    endpoint: "getUserMeasurements",
    optional: true,
  },
  {
    id: "appointments.list",
    module: "appointments",
    name: "List appointments",
    endpoint: "getAllAppointments",
  },
  {
    id: "cif.list",
    module: "cif",
    name: "List CIF",
    endpoint: "getAllCustomerInformationList",
  },
  {
    id: "orders.list",
    module: "orders",
    name: "List track orders",
    endpoint: "getAllStoreOrders",
  },
  {
    id: "products.list",
    module: "products",
    name: "List products",
    endpoint: "productsFilter",
  },
  {
    id: "companion.reachable",
    module: "companion",
    name: "Companion reachable",
    endpoint: "GET companion URL",
  },
]

export const HEALTH_CHECK_IDS = new Set(HEALTH_CHECK_CATALOG.map((c) => c.id))

export function checksForModule(moduleId: HealthModuleId): HealthCheckMeta[] {
  return HEALTH_CHECK_CATALOG.filter((c) => c.module === moduleId)
}

export function modulesWithChecks() {
  return HEALTH_MODULES.map((mod) => ({
    ...mod,
    checks: checksForModule(mod.id),
  })).filter((m) => m.checks.length > 0)
}
