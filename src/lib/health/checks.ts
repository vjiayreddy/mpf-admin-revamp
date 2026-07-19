import type { HealthCheckDefinition } from "@/lib/health/types"
import { graphqlHealthQuery, toOutcome } from "@/lib/health/graphql"

const USERS_LIST = `
  query HealthUsersList($page: Int, $limit: Int, $filter: UserFilter) {
    getUsersByFilter(filter: $filter, page: $page, limit: $limit) {
      _id
    }
  }
`

const USER_BY_ID = `
  query HealthUserById($userId: ID!) {
    user(id: $userId) {
      _id
    }
  }
`

const BODY_PROFILE = `
  query HealthBodyProfile($userId: String!) {
    getBodyProfile(userId: $userId) {
      height
      weight
    }
  }
`

const USER_MEASUREMENTS = `
  query HealthUserMeasurements($userId: String!, $page: Int, $limit: Int) {
    getUserMeasurements(userId: $userId, page: $page, limit: $limit) {
      _id
    }
  }
`

const APPOINTMENTS = `
  query HealthAppointments($params: AppointmentFilterInput!, $page: Int, $limit: Int) {
    getAllAppointments(params: $params, page: $page, limit: $limit) {
      totalItemCount
    }
  }
`

const CIF_LIST = `
  query HealthCifList($filter: CIFFilterInput, $page: Int, $limit: Int) {
    getAllCustomerInformationList(filter: $filter, page: $page, limit: $limit) {
      totalCount
    }
  }
`

const TRACK_ORDERS = `
  query HealthTrackOrders($params: StoreProductOrderFilterInputParams!, $page: Int, $limit: Int) {
    getAllStoreOrders(params: $params, page: $page, limit: $limit) {
      _id
    }
  }
`

const PRODUCTS = `
  query HealthProducts($params: ProductFilter!, $page: Int, $limit: Int) {
    productsFilter(params: $params, page: $page, limit: $limit) {
      totalItemCount
    }
  }
`

const DEFAULT_PRODUCT_OCCASION_ID = "5fc2677bfa7ff20df01ab8ce"

export const healthChecks: HealthCheckDefinition[] = [
  {
    id: "core.users_list",
    module: "core",
    name: "GraphQL reachable (users list)",
    timeoutMs: 12_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        getUsersByFilter: Array<{ _id: string }>
      }>(ctx, USERS_LIST, {
        page: 1,
        limit: 1,
        filter: {},
      })
      if (!result.ok) return toOutcome(result)
      const count = result.data.getUsersByFilter?.length ?? 0
      return { ok: true, detail: `returned ${count} row(s)` }
    },
  },
  {
    id: "customers.list",
    module: "customers",
    name: "List customers",
    timeoutMs: 12_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        getUsersByFilter: Array<{ _id: string }>
      }>(ctx, USERS_LIST, {
        page: 1,
        limit: 5,
        filter: { isClient: true },
      })
      if (!result.ok) return toOutcome(result)
      return {
        ok: true,
        detail: `returned ${result.data.getUsersByFilter?.length ?? 0} row(s)`,
      }
    },
  },
  {
    id: "customers.get",
    module: "customers",
    name: "Get customer by id",
    timeoutMs: 10_000,
    optional: true,
    async run(ctx) {
      if (!ctx.testCustomerId) {
        return { ok: true, detail: "skipped — HEALTH_TEST_CUSTOMER_ID unset" }
      }
      const result = await graphqlHealthQuery<{
        user: { _id: string } | null
      }>(ctx, USER_BY_ID, { userId: ctx.testCustomerId })
      if (!result.ok) return toOutcome(result)
      if (!result.data.user?._id) {
        return { ok: false, detail: "user not found for HEALTH_TEST_CUSTOMER_ID" }
      }
      return { ok: true, detail: `user ${result.data.user._id}` }
    },
  },
  {
    id: "customers.search",
    module: "customers",
    name: "Search customers",
    timeoutMs: 12_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        getUsersByFilter: Array<{ _id: string }>
      }>(ctx, USERS_LIST, {
        page: 1,
        limit: 5,
        filter: { isClient: true, searchTerm: "a" },
      })
      if (!result.ok) return toOutcome(result)
      return {
        ok: true,
        detail: `returned ${result.data.getUsersByFilter?.length ?? 0} row(s)`,
      }
    },
  },
  {
    id: "measurements.body_profile",
    module: "measurements",
    name: "Load body profile",
    timeoutMs: 10_000,
    optional: true,
    async run(ctx) {
      if (!ctx.testCustomerId) {
        return { ok: true, detail: "skipped — HEALTH_TEST_CUSTOMER_ID unset" }
      }
      const result = await graphqlHealthQuery(ctx, BODY_PROFILE, {
        userId: ctx.testCustomerId,
      })
      return toOutcome(result, "body profile query ok")
    },
  },
  {
    id: "measurements.list",
    module: "measurements",
    name: "List measurements",
    timeoutMs: 12_000,
    optional: true,
    async run(ctx) {
      if (!ctx.testCustomerId) {
        return { ok: true, detail: "skipped — HEALTH_TEST_CUSTOMER_ID unset" }
      }
      const result = await graphqlHealthQuery<{
        getUserMeasurements: Array<{ _id: string }> | null
      }>(ctx, USER_MEASUREMENTS, {
        userId: ctx.testCustomerId,
        page: 1,
        limit: 5,
      })
      if (!result.ok) return toOutcome(result)
      const n = result.data.getUserMeasurements?.length ?? 0
      return { ok: true, detail: `returned ${n} measurement(s)` }
    },
  },
  {
    id: "appointments.list",
    module: "appointments",
    name: "List appointments",
    timeoutMs: 12_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        getAllAppointments: { totalItemCount?: number | null } | null
      }>(ctx, APPOINTMENTS, {
        params: {},
        page: 1,
        limit: 5,
      })
      if (!result.ok) return toOutcome(result)
      const total = result.data.getAllAppointments?.totalItemCount ?? 0
      return { ok: true, detail: `totalItemCount=${total}` }
    },
  },
  {
    id: "cif.list",
    module: "cif",
    name: "List CIF",
    timeoutMs: 12_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        getAllCustomerInformationList: { totalCount?: number | null } | null
      }>(ctx, CIF_LIST, {
        filter: {},
        page: 1,
        limit: 5,
      })
      if (!result.ok) return toOutcome(result)
      const total =
        result.data.getAllCustomerInformationList?.totalCount ?? 0
      return { ok: true, detail: `totalCount=${total}` }
    },
  },
  {
    id: "orders.list",
    module: "orders",
    name: "List track orders",
    timeoutMs: 15_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        getAllStoreOrders: Array<{ _id: string }> | null
      }>(ctx, TRACK_ORDERS, {
        params: {
          sortByEnum: "TRIAL_DATE",
          orderStatus: "RUNNING",
        },
        page: 1,
        limit: 5,
      })
      if (!result.ok) return toOutcome(result)
      const n = result.data.getAllStoreOrders?.length ?? 0
      return { ok: true, detail: `returned ${n} order(s)` }
    },
  },
  {
    id: "products.list",
    module: "products",
    name: "List products",
    timeoutMs: 12_000,
    async run(ctx) {
      const result = await graphqlHealthQuery<{
        productsFilter: { totalItemCount?: number | null } | null
      }>(ctx, PRODUCTS, {
        params: { occasionId: DEFAULT_PRODUCT_OCCASION_ID },
        page: 1,
        limit: 5,
      })
      if (!result.ok) return toOutcome(result)
      const total = result.data.productsFilter?.totalItemCount ?? 0
      return { ok: true, detail: `totalItemCount=${total}` }
    },
  },
  {
    id: "companion.reachable",
    module: "companion",
    name: "Companion URL reachable",
    timeoutMs: 8_000,
    async run(ctx) {
      const url = process.env.NEXT_PUBLIC_COMPANION_URL?.trim()
      if (!url) {
        return { ok: false, detail: "NEXT_PUBLIC_COMPANION_URL unset" }
      }
      try {
        const res = await fetch(url, {
          method: "GET",
          signal: ctx.signal,
          redirect: "follow",
        })
        // Companion may return 404 on `/` — anything except network failure is fine.
        if (res.status >= 500) {
          return { ok: false, detail: `HTTP ${res.status}` }
        }
        return { ok: true, detail: `HTTP ${res.status}` }
      } catch (err) {
        return {
          ok: false,
          detail: err instanceof Error ? err.message : "fetch failed",
        }
      }
    },
  },
]
