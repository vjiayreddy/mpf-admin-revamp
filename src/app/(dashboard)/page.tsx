import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const kpis = [
  {
    title: "Open orders",
    value: "—",
    description: "Live counts connect in Phase 2",
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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <Badge variant="secondary">Scaffold</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Premium admin shell for My Perfect Fit. Modules migrate next.
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
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            This project is the new Next.js + Tailwind + shadcn foundation.
            Legacy GraphQL and auth land in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Use the sidebar to open placeholder module routes that mirror the
          current admin navigation.
        </CardContent>
      </Card>
    </div>
  )
}
