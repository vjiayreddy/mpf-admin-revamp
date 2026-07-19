import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { NetworkStatusUi } from "@/components/network/network-status-ui"
import { NetworkStatusProvider } from "@/components/providers/network-status-provider"
import { PostHogTracker } from "@/components/providers/posthog-tracker"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ApolloAppProvider } from "@/lib/apollo/apollo-provider"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "My Perfect Fit Admin",
    template: "%s · MPF Admin",
  },
  description: "My Perfect Fit operations admin dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NetworkStatusProvider>
            <ApolloAppProvider>
              <TooltipProvider>
                <PostHogTracker />
                <NetworkStatusUi />
                {children}
                <Toaster />
              </TooltipProvider>
            </ApolloAppProvider>
          </NetworkStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

