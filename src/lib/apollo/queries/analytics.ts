import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const ANALYTICS_DRILL_DOWN_LIMIT = 100

export type AnalyticsRoleFilter = {
  _id?: string | null
  roleIdentifier?: string | null
}

export type AnalyticsDateParts = {
  datestamp?: string | null
  day?: number | null
  hour?: number | null
  minute?: number | null
  month?: number | null
  timestamp?: string | null
  year?: number | null
}

export type AnalyticsFilterParams = {
  dateAttribute?: string | null
  studioId?: string | string[] | null
  endDate?: AnalyticsDateParts | null
  identifier?: string | null
  groupById?: string | null
  groupByIdAttribute?: string | null
  roleFilter?: AnalyticsRoleFilter | null
  startDate?: AnalyticsDateParts | null
}

export type AnalyticsItem = {
  label: string
  value?: number | null
  total?: number | string | null
  volumePercent?: number | null
  pricePercent?: number | null
  filterParams?: AnalyticsFilterParams | null
}

export type AnalyticsDrillDownCell = {
  column?: string | null
  value?: string | null
}

export type AnalyticsDrillDownRow = {
  columns?: string[] | null
  row?: AnalyticsDrillDownCell[] | null
}

export type AnalyticsSummaryVars = {
  startDate: MpfDateFilter
  endDate: MpfDateFilter
  roleFilter?: AnalyticsRoleFilter | null
  studioId?: string[]
}

export type AnalyticsDrillDownVars = {
  filters: Record<string, unknown>
  page: number
  limit: number
}

const ANALYTICS_ITEM_FIELDS = `
  label
  total
  value
  filterParams {
    dateAttribute
    studioId
    identifier
    groupById
    groupByIdAttribute
    roleFilter {
      _id
      roleIdentifier
    }
    startDate {
      datestamp
      day
      hour
      minute
      month
      timestamp
      year
    }
    endDate {
      datestamp
      day
      hour
      minute
      month
      timestamp
      year
    }
  }
`

const EMB_ANALYTICS_ITEM_FIELDS = `
  label
  total
  value
  volumePercent
  pricePercent
  filterParams {
    dateAttribute
    studioId
    identifier
    groupById
    groupByIdAttribute
    roleFilter {
      _id
      roleIdentifier
    }
    startDate {
      datestamp
      day
      hour
      minute
      month
      timestamp
      year
    }
    endDate {
      datestamp
      day
      hour
      minute
      month
      timestamp
      year
    }
  }
`

const DRILL_DOWN_FIELDS = `
  totalCount
  drillDownData {
    columns
    row {
      column
      value
    }
  }
`

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
    $studioId: [String]
  ) {
    getDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
      studioId: $studioId
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getDashboardDrillDownData(filters: $filters, page: $page, limit: $limit) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_LEADS_DASHBOARD_DATA = gql`
  query GetLeadsDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
    $studioId: [String]
  ) {
    getLeadsDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
      studioId: $studioId
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_LEADS_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetLeadsDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getLeadsDashboardDrillDownData(filters: $filters, page: $page, limit: $limit) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_CIF_DASHBOARD_DATA = gql`
  query GetCustomerInfoDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
    $studioId: [String]
  ) {
    getCustomerInfoDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
      studioId: $studioId
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_CIF_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetCustomerInfoDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getCustomerInfoDashboardDrillDownData(
      filters: $filters
      page: $page
      limit: $limit
    ) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_ORDER_DASHBOARD_DATA = gql`
  query getStoreOrderDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
    $studioId: [String]
  ) {
    getStoreOrderDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
      studioId: $studioId
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_STORE_ORDER_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetStoreOrderDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getStoreOrderDashboardDrillDownData(
      filters: $filters
      page: $page
      limit: $limit
    ) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_ORDER_RECEIPTS_DASHBOARD_DATA = gql`
  query getStoreOrderPaymentsDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
    $studioId: [String]
  ) {
    getStoreOrderPaymentsDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
      studioId: $studioId
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_STORE_ORDER_RECEIPTS_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetStoreOrderPaymentsDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getStoreOrderPaymentsDashboardDrillDownData(
      filters: $filters
      page: $page
      limit: $limit
    ) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_EMB_DASHBOARD_DATA = gql`
  query getEmbroideryDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
    $studioId: [String]
  ) {
    getEmbroideryDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
      studioId: $studioId
    ) {
      analytics {
        ${EMB_ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_EMB_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetEmbroideryDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getEmbroideryDashboardDrillDownData(
      filters: $filters
      page: $page
      limit: $limit
    ) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_APPOINTMENTS_DASHBOARD_DATA = gql`
  query GetAppointmentDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
  ) {
    getAppointmentDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_APPOINTMENTS_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetAppointmentDashboardDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getAppointmentDashboardDrillDownData(
      filters: $filters
      page: $page
      limit: $limit
    ) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_QUALITYCHECK_DASHBOARD_DATA = gql`
  query GetOrderQualityCheckDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
  ) {
    getOrderQualityCheckDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_ORDER_QUALITYCHECK_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetOrderQualityCheckDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getOrderQualityCheckDrillDownData(
      filters: $filters
      page: $page
      limit: $limit
    ) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`

export const GET_TRIAL_DASHBOARD_DATA = gql`
  query GetOrderTrialDashboardData(
    $startDate: DateTimeSchemaInput!
    $endDate: DateTimeSchemaInput!
    $roleFilter: RoleBasedFilter
  ) {
    getOrderTrialDashboardData(
      startDate: $startDate
      endDate: $endDate
      roleFilter: $roleFilter
    ) {
      analytics {
        ${ANALYTICS_ITEM_FIELDS}
      }
    }
  }
`

export const GET_ORDER_TRIAL_DASHBOARD_DRILL_DOWN_DATA = gql`
  query GetOrderTrialDrillDownData(
    $filters: AnalyticsDrillDownInput
    $page: Int!
    $limit: Int!
  ) {
    getOrderTrialDrillDownData(filters: $filters, page: $page, limit: $limit) {
      ${DRILL_DOWN_FIELDS}
    }
  }
`
