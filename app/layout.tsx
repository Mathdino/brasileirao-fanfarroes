import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MobileNav } from "@/components/mobile-nav"
import "./globals.css"

export const metadata: Metadata = {
  title: "Brasileirão Fanfarrões",
  description: "Campeonato interno de futebol - Brasileirão Fanfarrões",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen pb-20">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
          <MobileNav />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
