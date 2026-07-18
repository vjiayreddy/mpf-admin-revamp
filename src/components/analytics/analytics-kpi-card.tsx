import { cn } from "@/lib/utils"

type AnalyticsKpiCardProps = {
  title: string | number | null | undefined
  subTitle: string
  className?: string
  onClick?: () => void
}

export function AnalyticsKpiCard({
  title,
  subTitle,
  className,
  onClick,
}: AnalyticsKpiCardProps) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "bg-card flex w-full flex-col rounded-lg border p-4 text-left",
        onClick && "hover:bg-muted/40 transition-colors",
        className
      )}
    >
      <span className="text-muted-foreground text-sm font-medium">
        {subTitle}
      </span>
      <span className="mt-1 text-2xl font-semibold tracking-tight">
        {title ?? "—"}
      </span>
    </Comp>
  )
}
