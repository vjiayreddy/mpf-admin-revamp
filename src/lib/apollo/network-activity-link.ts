import { ApolloLink } from "@apollo/client"
import { finalize } from "rxjs"

import {
  trackRequestEnd,
  trackRequestStart,
} from "@/lib/network/activity-store"

/** Measures real GraphQL request duration for network-status UX. */
export const networkActivityLink = new ApolloLink((operation, forward) => {
  const start = performance.now()
  trackRequestStart()

  return forward(operation).pipe(
    finalize(() => {
      trackRequestEnd(performance.now() - start)
    })
  )
})
