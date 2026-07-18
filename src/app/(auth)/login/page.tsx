import Link from "next/link"
import { Scissors } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
          <Scissors className="size-5" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">My Perfect Fit</p>
          <p className="text-muted-foreground text-sm">Admin sign in</p>
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            UI-only login for now. Auth wiring comes in Phase 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@myperfectfit.co.in"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <Button className="w-full" render={<Link href="/" />}>
            Continue to dashboard
          </Button>
          <div className="relative py-1">
            <Separator />
            <span className="bg-card text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
              or
            </span>
          </div>
          <Button variant="outline" className="w-full" type="button">
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="text-muted-foreground justify-center text-xs">
          Scaffold only — no credentials are validated yet.
        </CardFooter>
      </Card>
    </div>
  )
}
