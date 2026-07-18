import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Badge variant="secondary">Coming soon</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description ??
              "Placeholder route mirroring the legacy admin module. Feature migration comes next."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
