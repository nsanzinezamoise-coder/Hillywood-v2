import React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { verifySession } from "@/lib/session"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Header } from "@/components/header"
import { Film } from "lucide-react"

export const metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin - hillywood",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  if (session.role !== "admin" && session.role !== "moderator") {
    redirect("/")
  }

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row min-h-screen pt-16 md:pt-20">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-screen p-4 md:p-6 bg-muted/30 overflow-auto w-full lg:ml-64">
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-auto pt-10 pb-6 text-center text-sm text-muted-foreground border-t border-border/50">
            <p>© {new Date().getFullYear()} hillywood Admin Dashboard</p>
          </footer>
        </main>
      </div>
    </>
  )
}
