import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client"
import { SetContextLink } from "@apollo/client/link/context"
import { ErrorLink } from "@apollo/client/link/error"

import { authClient } from "@/lib/auth-client"

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_MPF_API_URL,
  })

  const authLink = new SetContextLink(async (prevContext) => {
    const session = await authClient.getSession()
    const token = session.data?.user?.mpfAccessToken
    return {
      headers: {
        ...prevContext.headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    }
  })

  const errorLink = new ErrorLink(({ error }) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Apollo]", error)
    }
  })

  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
        nextFetchPolicy: "cache-first",
      },
      query: {
        fetchPolicy: "network-only",
      },
    },
    assumeImmutableResults: true,
  })
}

let browserClient: ApolloClient | null = null

export function getApolloClient() {
  if (typeof window === "undefined") {
    return createApolloClient()
  }
  if (!browserClient) {
    browserClient = createApolloClient()
  }
  return browserClient
}
