import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const kpis = [
  {
    title: "Open orders",
    value: "—",
    description: "Live counts connect with module migration",
  },
  {
    title: "Active leads",
    value: "—",
    description: "Placeholder metric",
  },
  {
    title: "Trials this week",
    value: "—",
    description: "Placeholder metric",
  },
  {
    title: "QC pending",
    value: "—",
    description: "Placeholder metric",
  },
]

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <Badge variant="secondary">Auth live</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Signed in as {session?.user?.email ?? "unknown"}
          {session?.user?.role ? ` · ${session.user.role}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} size="sm">
            <CardHeader>
              <CardDescription>{kpi.title}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {kpi.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session bridge</CardTitle>
          <CardDescription>
            Better Auth holds the cookie session. MPF GraphQL issued the bearer
            token used for API calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-1 text-sm">
          <p>
            Stylist session:{" "}
            {session?.user?.activeStylistSessionId || "—"}
          </p>
          <p>
            Access token:{" "}
            {session?.user?.mpfAccessToken ? "present" : "missing"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
