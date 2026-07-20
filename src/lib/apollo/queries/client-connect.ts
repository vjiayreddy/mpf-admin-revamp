import { gql } from "@apollo/client/core"

import type { UserFilterInput } from "@/lib/apollo/queries/users"

export const CLIENT_CONNECT_PAGE_LIMIT = 100

export type ClientConnectCampaign = {
  ccType?: string | null
  currentComment?: string | null
  status?: string | null
  dueDate?: { timestamp?: string | null; datestamp?: string | null } | null
}

export type ClientConnectListRow = {
  _id: string
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  email?: string | null
  phone?: string | null
  phone2?: string | null
  countryCode?: string | null
  customerSrNo?: number | null
  customerType?: string | null
  customerSegment?: string | null
  userStatus?: string | null
  createdAt?: string | null
  ccDueDate?: { timestamp?: string | null } | null
  lastUpdatedAt?: { timestamp?: string | null } | null
  stylist?: {
    name?: string | null
    phone?: string | null
    email?: string | null
  } | null
  studios?: Array<{ name?: string | null; city?: string | null }> | null
  clientConnect?: {
    activeOrderId?: string | null
    campaigns?: ClientConnectCampaign[] | null
  } | null
}

/** Slim list selection — omit cart/wishlist/badges/addresses. */
export const GET_CLIENT_CONNECT_BY_FILTER = gql`
  query GetClientConnectByFilter(
    $ccType: String!
    $studioId: String
    $page: Int
    $limit: Int
    $filter: UserFilter
  ) {
    getClientConnectByFilter(
      ccType: $ccType
      studioId: $studioId
      page: $page
      limit: $limit
      filter: $filter
    ) {
      _id
      firstName
      lastName
      fullName
      email
      phone
      phone2
      countryCode
      customerSrNo
      customerType
      customerSegment
      userStatus
      createdAt
      ccDueDate {
        timestamp
      }
      lastUpdatedAt {
        timestamp
      }
      stylist {
        name
        phone
        email
      }
      studios {
        name
        city
      }
      clientConnect {
        activeOrderId
        campaigns {
          ccType
          currentComment
          status
          dueDate {
            timestamp
          }
        }
      }
    }
  }
`

export type GetClientConnectByFilterData = {
  getClientConnectByFilter: ClientConnectListRow[]
}

export type GetClientConnectByFilterVars = {
  ccType: string
  studioId?: string
  page: number
  limit: number
  filter: UserFilterInput
}

export const GET_CLIENT_CONNECT_DATA = gql`
  query GetClientConnectData($userId: ID!) {
    getClientConnectData(userId: $userId) {
      activeOrderId
      ccComment
      campaigns {
        ccType
        currentComment
        status
        dueDate {
          timestamp
          datestamp
        }
      }
    }
  }
`

export type GetClientConnectDataResult = {
  activeOrderId?: string | null
  ccComment?: string | null
  campaigns?: ClientConnectCampaign[] | null
}

export type GetClientConnectDataResponse = {
  getClientConnectData: GetClientConnectDataResult
}

export type GetClientConnectDataVars = {
  userId: string
}

export const GET_CLIENT_CONNECT_HISTORY = gql`
  query GetClientConnectHistory($userId: ID!, $cursor: String, $limit: Int) {
    getClientConnectHistory(userId: $userId, cursor: $cursor, limit: $limit) {
      edges {
        _id
        actionType
        ccType
        createdAt
        dateRecorded
        note
        orderId
        stylistId
        userId
        metadata {
          reason
          newDate {
            timestamp
            datestamp
          }
          previousDate {
            timestamp
            datestamp
          }
        }
      }
    }
  }
`

export type ClientConnectHistoryEdge = {
  _id: string
  actionType?: string | null
  ccType?: string | null
  createdAt?: string | null
  dateRecorded?: string | null
  note?: string | null
  orderId?: string | null
  stylistId?: string | null
  userId?: string | null
  metadata?: {
    reason?: string | null
    newDate?: { timestamp?: string | null; datestamp?: string | null } | null
    previousDate?: {
      timestamp?: string | null
      datestamp?: string | null
    } | null
  } | null
}

export type GetClientConnectHistoryData = {
  getClientConnectHistory: {
    edges: ClientConnectHistoryEdge[]
  }
}

export type GetClientConnectHistoryVars = {
  userId: string
  cursor?: string | null
  limit?: number
}

export const GET_TEMPLATES_BY_CC_TYPE = gql`
  query GetTemplatesByCCType($ccType: String!) {
    getTemplatesByCCType(ccType: $ccType) {
      _id
      ccType
      isActive
      name
      textContent
    }
  }
`

export type CcTemplate = {
  _id: string
  ccType?: string | null
  isActive?: boolean | null
  name?: string | null
  textContent?: string | null
}

export type GetTemplatesByCcTypeData = {
  getTemplatesByCCType: CcTemplate[]
}

export const LOG_CLIENT_CONNECT_INTERACTION = gql`
  mutation LogClientConnectInteraction($input: InteractionInput!) {
    logClientConnectInteraction(input: $input) {
      _id
      actionType
      ccType
      createdAt
      note
    }
  }
`

export type LogClientConnectInteractionInput = {
  userId: string
  stylistId: string
  actionType: "WHATSAPP_SENT" | "CALL_MADE" | "NOTE_ADDED" | string
  ccType: string
  note: string
  orderId?: string | null
}

export type LogClientConnectInteractionVars = {
  input: LogClientConnectInteractionInput
}

export const UPDATE_CLIENT_CONNECT_COMMENT = gql`
  mutation UpdateClientConnectComment($userId: ID!, $ccComment: String!) {
    updateClientConnectComment(userId: $userId, ccComment: $ccComment) {
      activeOrderId
      ccComment
      campaigns {
        ccType
        currentComment
        status
        dueDate {
          timestamp
          datestamp
        }
      }
    }
  }
`

export type UpdateClientConnectCommentVars = {
  userId: string
  ccComment: string
}
