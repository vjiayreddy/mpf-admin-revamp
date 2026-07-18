import { gql } from "@apollo/client/core"

export const TICKETS_PAGE_SIZE = 20

export type TicketAssignee = {
  _id?: string | null
  email?: string | null
  name?: string | null
  phone?: string | null
  role?: string | null
  isActive?: boolean | null
}

export type TicketListRow = {
  _id: string
  ticketId?: string | null
  ticketNumber?: number | null
  title?: string | null
  status?: string | null
  priority?: string | null
  category?: string | null
  assignedTo?: TicketAssignee | null
  dueDate?: string | null
  createdAt?: string | null
}

export type TicketDetail = TicketListRow & {
  description?: string | null
  ticketType?: string | null
  assignedAt?: string | null
  assignedBy?: string | null
  closedDate?: string | null
  createdBy?: string | null
  customerId?: string | null
  customerInfo?: {
    email?: string | null
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
  } | null
  updatedAt?: string | null
  isABug?: boolean | null
  isDuplicate?: boolean | null
}

export type GetTicketsVars = {
  page?: number
  pageSize?: number
  status?: string[]
  priority?: string[]
  category?: string[]
  ticketType?: string
  assignedTo?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  isOverdue?: boolean
  isDuplicate?: boolean
}

export type GetTicketsData = {
  getTickets: {
    page: number
    pageSize: number
    totalCount: number
    tickets: TicketListRow[]
  }
}

export const GET_ALL_TICKETS = gql`
  query GetTickets(
    $page: Int
    $pageSize: Int
    $status: [TicketStatus]
    $priority: [TicketPriority]
    $category: [TicketCategory]
    $ticketType: TicketType
    $assignedTo: ID
    $dateFrom: String
    $dateTo: String
    $search: String
    $isOverdue: Boolean
    $isDuplicate: Boolean
  ) {
    getTickets(
      page: $page
      pageSize: $pageSize
      status: $status
      priority: $priority
      category: $category
      ticketType: $ticketType
      assignedTo: $assignedTo
      dateFrom: $dateFrom
      dateTo: $dateTo
      search: $search
      isOverdue: $isOverdue
      isDuplicate: $isDuplicate
    ) {
      page
      pageSize
      totalCount
      tickets {
        _id
        ticketId
        ticketNumber
        title
        status
        priority
        category
        assignedTo {
          _id
          email
          name
        }
        dueDate
        createdAt
      }
    }
  }
`

export type GetTicketByIdVars = {
  ticketId: string
}

export type GetTicketByIdData = {
  getTicketById: TicketDetail
}

export const GET_TICKET_BY_ID = gql`
  query GetTicketById($ticketId: ID!) {
    getTicketById(ticketId: $ticketId) {
      _id
      ticketId
      ticketNumber
      title
      description
      status
      priority
      category
      ticketType
      assignedAt
      assignedBy
      assignedTo {
        _id
        email
        isActive
        name
        phone
        role
      }
      closedDate
      createdAt
      createdBy
      customerId
      customerInfo {
        email
        firstName
        lastName
        phone
      }
      dueDate
      isABug
      isDuplicate
      updatedAt
    }
  }
`

export type CreateTicketInput = {
  title: string
  description: string
  ticketType: string
  category: string
  priority: string
}

export type CreateTicketVars = {
  input: CreateTicketInput
}

export type CreateTicketData = {
  createTicket: TicketListRow
}

export const CREATE_TICKET = gql`
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      _id
      ticketId
      ticketNumber
      title
      status
      priority
      category
      assignedTo {
        _id
        email
        name
      }
      dueDate
      createdAt
    }
  }
`

export type UpdateTechFieldsInput = {
  priority?: string | null
  dueDate?: string | null
}

export type UpdateTicketTechFieldsVars = {
  ticketId: string
  input: UpdateTechFieldsInput
}

export type UpdateTicketTechFieldsData = {
  updateTicketTechFields: {
    _id: string
    ticketId?: string | null
    priority?: string | null
    dueDate?: string | null
  }
}

export const UPDATE_TICKET_TECH_FIELDS = gql`
  mutation UpdateTicketTechFields(
    $input: UpdateTechFieldsInput!
    $ticketId: ID!
  ) {
    updateTicketTechFields(input: $input, ticketId: $ticketId) {
      _id
      ticketId
      ticketNumber
      title
      description
      status
      priority
      category
      ticketType
      dueDate
    }
  }
`
