import { gql } from "@apollo/client/core"

export type RoleListRow = {
  _id: string
  name?: string | null
  label?: string | null
}

export type RoleControl = {
  label?: string | null
  name?: string | null
  sortOrder?: number | null
}

export type RoleResource = {
  _id: string
  isAvailable?: boolean | null
  label?: string | null
  note?: string | null
  name?: string | null
  sortOrder?: number | null
  availableControls?: RoleControl[] | null
}

export type PermissionInput = {
  isAvailable: boolean
  note: string
  resourceId: string
  allowedControls: string[]
}

export type AccessFilterRow = {
  _id?: string | null
  isAvailable?: boolean | null
  resource?: { name?: string | null } | null
  allowedControls?: string[] | null
}

export type GetAllRolesData = {
  getAllRoles: RoleListRow[]
}

export type SaveRoleVars = {
  _id?: string | null
  name?: string | null
  note?: string | null
  label?: string | null
}

export type SaveRoleData = {
  saveRole: { _id: string } | null
}

export type GetAllResourcesData = {
  getAllResources: RoleResource[]
}

export type AssignPermissionsVars = {
  roleId: string
  permissions: PermissionInput[]
}

export type AssignPermissionsData = {
  assignPermissionsToRole: boolean | null
}

export type GetAccessFilterVars = {
  roleName?: string[] | null
  resourceName?: string | null
}

export type GetAccessFilterData = {
  getAccessFilter: AccessFilterRow[]
}

export const GET_ALL_ROLES = gql`
  query GetAllRoles {
    getAllRoles {
      _id
      name
      label
    }
  }
`

export const SAVE_ROLE = gql`
  mutation SaveRole(
    $_id: String
    $name: String
    $note: String
    $label: String
  ) {
    saveRole(_id: $_id, name: $name, note: $note, label: $label) {
      _id
    }
  }
`

export const GET_ALL_RESOURCES = gql`
  query GetAllResources {
    getAllResources {
      _id
      isAvailable
      label
      note
      name
      sortOrder
      availableControls {
        label
        name
        sortOrder
      }
    }
  }
`

export const ASSIGN_PERMISSIONS_TO_ROLE = gql`
  mutation AssignPermissionsToRole(
    $roleId: String!
    $permissions: [PermissionInput!]!
  ) {
    assignPermissionsToRole(roleId: $roleId, permissions: $permissions)
  }
`

export const GET_ACCESS_FILTER = gql`
  query GetAccessFilter($roleName: [String], $resourceName: String) {
    getAccessFilter(roleName: $roleName, resourceName: $resourceName) {
      _id
      isAvailable
      resource {
        name
      }
      allowedControls
    }
  }
`

export function slugifyRoleName(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "_")
}
