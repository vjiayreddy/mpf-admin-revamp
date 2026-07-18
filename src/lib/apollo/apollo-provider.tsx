"use client"

import { useMemo, type ReactNode } from "react"
import { ApolloProvider } from "@apollo/client/react"

import { getApolloClient } from "@/lib/apollo/client"

export function ApolloAppProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => getApolloClient(), [])
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
