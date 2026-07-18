import { gql } from "@apollo/client/core"

import type { MpfDateFilter } from "@/lib/customers/date-filter"

export const APPOINTMENTS_PAGE_LIMIT = 100

export type AppointmentAddress = {
  _id?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  countryCode?: string | null
  address1?: string | null
  address2?: string | null
  landmark?: string | null
  city?: string | null
  state?: string | null
  stateCode?: string | null
  country?: string | null
  postalCode?: string | null
  name?: string | null
}

export type AppointmentLead = {
  _id?: string | null
  leadId?: number | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  countryCode?: string | null
  email?: string | null
  cityName?: string | null
  estimatedValue?: number | null
  remarks?: string | null
  rating?: number | null
  creditedSalesTeam?: Array<{ name?: string | null } | null> | null
  generatedSalesTeam?: Array<{ name?: string | null } | null> | null
  source?: Array<{
    _id?: string
    name?: string | null
    subCategory?: Array<{ _id?: string; name?: string | null } | null> | null
  } | null> | null
  studio?: Array<{ _id?: string; name?: string | null } | null> | null
  persona?: Array<{ _id?: string; name?: string | null } | null> | null
  status?: Array<{
    _id?: string
    name?: string | null
    label?: string | null
    note?: string | null
    dateRecorded?: { timestamp?: string | null } | null
  } | null> | null
  followUpDate?: { timestamp?: string | null } | null
  eventDate?: { timestamp?: string | null } | null
  expClosureDate?: { timestamp?: string | null } | null
  leadDate?: { timestamp?: string | null } | null
}

export type AppointmentListRow = {
  _id: string
  appointmentId?: number | null
  userId?: string | null
  firstName?: string | null
  lastName?: string | null
  leadId?: string | null
  email?: string | null
  countryCode?: string | null
  lookingFor?: string | null
  cityName?: string | null
  phone?: string | null
  appointmentSelectedTimestamp?: string | null
  currentStatus?: string | null
  orderValue?: number | null
  appointmentType?: string | null
  stylistIds?: string[] | null
  studio?: Array<{ _id?: string; name?: string | null } | null> | null
  stylist?: Array<{ _id?: string; name?: string | null } | null> | null
  address?: AppointmentAddress | null
  dateRecorded?: { timestamp?: string | null } | null
  appointmentDate?: {
    timestamp?: string | null
    datestamp?: string | null
    day?: number | null
    month?: number | null
    year?: number | null
    hour?: number | null
    minute?: number | null
  } | null
  followUpDate?: { timestamp?: string | null } | null
  status?: Array<{
    name?: string | null
    note?: string | null
    dateRecorded?: { timestamp?: string | null } | null
  } | null> | null
  source?: Array<{ _id?: string; name?: string | null } | null> | null
  persona?: Array<{ _id?: string; name?: string | null } | null> | null
  generatedSalesTeam?: Array<{ _id?: string; name?: string | null } | null> | null
  lead?: AppointmentLead[] | null
}

export type AppointmentFilterInput = {
  appointmentId?: number
  appointmentType?: string
  endAppointmentDate?: MpfDateFilter
  leadId?: string
  searchTerm?: string
  startAppointmentDate?: MpfDateFilter
  status?: string
  studioIds?: string[]
  stylistId?: string
  userId?: string
}

export type GetAllAppointmentsData = {
  getAllAppointments: {
    totalItemCount: number
    appointments: AppointmentListRow[]
  }
}

export type GetAllAppointmentsVars = {
  params: AppointmentFilterInput
  page?: number
  limit?: number
}

export const GET_ALL_APPOINTMENTS = gql`
  query GetAllAppointments(
    $params: AppointmentFilterInput!
    $page: Int
    $limit: Int
  ) {
    getAllAppointments(params: $params, page: $page, limit: $limit) {
      totalItemCount
      appointments {
        _id
        appointmentId
        userId
        firstName
        lastName
        leadId
        email
        countryCode
        lookingFor
        cityName
        phone
        appointmentSelectedTimestamp
        currentStatus
        orderValue
        studio {
          _id
          name
        }
        address {
          _id
          stateCode
          state
          postalCode
          phone
          name
          lastName
          landmark
          firstName
          email
          countryCode
          country
          city
          address2
          address1
        }
        dateRecorded {
          timestamp
        }
        source {
          _id
          name
        }
        persona {
          _id
          name
        }
        generatedSalesTeam {
          _id
          name
        }
        stylist {
          _id
          name
        }
        stylistIds
        lead {
          _id
          leadId
          studioId
          userId
          firstName
          lastName
          countryCode
          cityName
          phone
          email
          estimatedValue
          remarks
          creditedSalesTeam {
            name
          }
          generatedSalesTeam {
            name
          }
          source {
            _id
            name
            subCategory {
              _id
              name
            }
          }
          studio {
            _id
            name
          }
          persona {
            _id
            name
          }
          status {
            _id
            name
            label
            note
            dateRecorded {
              timestamp
            }
          }
          followUpDate {
            timestamp
          }
          eventDate {
            timestamp
          }
          expClosureDate {
            timestamp
          }
          rating
          leadDate {
            timestamp
          }
        }
        status {
          name
          note
          dateRecorded {
            timestamp
          }
        }
        appointmentType
        appointmentDate {
          timestamp
          datestamp
          day
          month
          year
          hour
          minute
        }
        followUpDate {
          timestamp
        }
      }
    }
  }
`

export type UpdateAppointmentStatusVars = {
  appointmentId: string
  status: string
  reason: string
  date?: MpfDateFilter
  orderValue?: number
}

export type UpdateAppointmentStatusData = {
  updateAppointmentStatus: { _id: string }
}

export const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus(
    $appointmentId: String!
    $status: String!
    $reason: String!
    $date: DateTimeSchemaInput
    $orderValue: Float
  ) {
    updateAppointmentStatus(
      appointmentId: $appointmentId
      status: $status
      reason: $reason
      date: $date
      orderValue: $orderValue
    ) {
      _id
    }
  }
`

export type LeadAppointmentInput = {
  _id?: string
  appointmentId: number
  userId?: string | null
  leadId?: string | null
  appointmentDate: MpfDateFilter
  appointmentType: string
  appointmentSelectedTimestamp: string
  stylistIds: string[]
  address?: Record<string, unknown>
}

export type SaveLeadAppointmentVars = {
  body: LeadAppointmentInput
}

export type SaveLeadAppointmentData = {
  saveLeadAppointment: { _id: string }
}

export const SAVE_LEAD_APPOINTMENT = gql`
  mutation SaveLeadAppointment($body: LeadAppointmentInput!) {
    saveLeadAppointment(body: $body) {
      _id
    }
  }
`
