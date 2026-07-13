import React, { ReactNode } from "react"
import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await verifySession()

  if (session) {
    redirect("/")
  }
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Cinematic Background Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 dark:opacity-40 scale-105 transition-opacity duration-1000"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-background via-background/60 to-transparent" />

      {/* Animated Background Blobs - Brand Aligned */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 dark:bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-red-500/10/5 dark:bg-red-500/10/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* Content Container - Adjusted for Header height (pt-24) */}
      <div className="relative z-10 w-full max-w-lg pt-24 md:pt-32 pb-12">
        {children}
      </div>
    </div>
  )
}
