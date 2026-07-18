import { GraphQLClient } from "graphql-request"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function getServerGraphqlClient() {
  const apiUrl = process.env.MPF_API_URL
  if (!apiUrl) {
    throw new Error("MPF_API_URL is not configured")
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const token = session?.user?.mpfAccessToken

  return new GraphQLClient(apiUrl, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  })
}

export async function graphqlRequest<T>(
  document: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const client = await getServerGraphqlClient()
  return client.request<T>(document, variables)
}
