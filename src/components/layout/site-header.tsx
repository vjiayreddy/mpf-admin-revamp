"use client"

import { useRouter } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { signOutFully } from "@/lib/auth/sign-out"
import { getPageTitle } from "@/config/navigation"
import { HealthStatusPopover } from "@/components/health/health-status-popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  userImage?: string | null
}

export function SiteHeader({ userName, userEmail, userImage }: SiteHeaderProps) {
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
      await signOutFully()
    } finally {
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
        <HealthStatusPopover />
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
              {userImage ? (
                <AvatarImage src={userImage} alt={userName ?? "User"} />
              ) : null}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    {userImage ? (
                      <AvatarImage src={userImage} alt={userName ?? "User"} />
                    ) : null}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {userName ?? "Admin"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {userEmail ?? ""}
                    </span>
                  </div>
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
