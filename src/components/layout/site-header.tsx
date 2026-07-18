"use client"

import { useRouter } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { authClient } from "@/lib/auth-client"
import { LOGOUT_STYLIST } from "@/lib/graphql/queries/user"
import { getPageTitle } from "@/config/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

type SiteHeaderProps = {
  userName?: string | null
  userEmail?: string | null
}

export function SiteHeader({ userName, userEmail }: SiteHeaderProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()

  const initials =
    userName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "MP"

  async function handleSignOut() {
    try {
      const session = await authClient.getSession()
      const sessionId =
        session.data?.user?.activeStylistSessionId ||
        (typeof window !== "undefined"
          ? window.localStorage.getItem("active_session_id")
          : null)
      const token = session.data?.user?.mpfAccessToken
      const apiUrl = process.env.NEXT_PUBLIC_MPF_API_URL

      if (sessionId && token && apiUrl) {
        await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: LOGOUT_STYLIST,
            variables: { sessionId },
          }),
        }).catch(() => undefined)
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("active_session_id")
      }

      await authClient.signOut()
      router.push("/login")
      router.refresh()
    } catch {
      await authClient.signOut()
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className="bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <h1 className="text-sm font-medium tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          aria-label="Toggle theme"
        >
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative size-8 rounded-full" />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {userName ?? "Admin"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {userEmail ?? ""}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
