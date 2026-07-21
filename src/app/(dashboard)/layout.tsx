import { SessionGuard } from "@/components/auth/session-guard"
import { MaintenanceProvider } from "@/components/maintenance/maintenance-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <SessionGuard />
      <AppSidebar />
      <SidebarInset>
        <SiteHeader
          userName={session.user.name}
          userEmail={session.user.email}
          userImage={session.user.image}
        />
        <MaintenanceProvider>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
        </MaintenanceProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
