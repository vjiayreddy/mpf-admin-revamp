import { cn } from "@/lib/utils"

export type AnalyticsTab = {
  id: string
  label: string
}

type AnalyticsTabsProps = {
  tabs: AnalyticsTab[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function AnalyticsTabs({
  tabs,
  value,
  onChange,
  className,
}: AnalyticsTabsProps) {
  if (tabs.length === 0) return null
  return (
    <div
      className={cn(
        "border-border mb-3 flex flex-wrap gap-1 border-b",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground border-b-2"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
