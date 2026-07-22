import { SecurityTwoFactorCard } from "@/components/auth/security-two-factor-card"

export default function AccountSecurityPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Account security
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage two-factor authentication for your admin login.
        </p>
      </div>
      <SecurityTwoFactorCard />
    </div>
  )
}
