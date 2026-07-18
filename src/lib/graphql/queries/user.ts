export const LOGOUT_STYLIST = `
  query LogoutStylist($sessionId: String!) {
    logoutStylist(sessionId: $sessionId)
  }
`

export const GET_ACTIVE_STYLISTS = `
  query GetActiveStylists {
    getActiveStylists {
      activeStylists {
        sessionId
        userId
        name
        email
      }
    }
  }
`
