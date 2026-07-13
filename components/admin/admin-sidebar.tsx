"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Film,
  LayoutDashboard,
  Video,
  FolderOpen,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Movies",
    href: "/admin/movies",
    icon: Video,
  },
  {
    title: "Series",
    href: "/admin/series",
    icon: Video,
  },
  {
    title: "Shorts",
    href: "/admin/shorts",
    icon: Video,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquare,
  },
  // {
  //   title: "Settings",
  //   href: "/admin/settings",
  //   icon: Settings,
  // },
]


export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border">
      {/* Logo */}
      <div className="h-2 lg:h-6 shrink-0"></div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => {
            if (user?.role === "admin") return true
            if (user?.role === "moderator") {
              return !["Users", "Settings"].includes(item.title)
            }
            return false
          })
          .map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "admin@example.com"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 pt-16 md:pt-20 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full border-b border-border bg-background p-4 flex items-center justify-start gap-3 sticky top-16 md:top-20 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 pt-16 md:pt-20 flex flex-col bg-background">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
              <SheetDescription>Access admin dashboard sections</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-foreground">Admin Menu</span>
      </div>
    </>
  )
}
