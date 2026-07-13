export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Series, Short, User, Category, Review } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { LiveUsersCard } from "@/components/admin/live-users-card"
import {
  Upload,
  Video,
  Film,
  Users,
  FolderOpen,
  MessageSquare,
  Eye,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react"

// ── dashboard sub-cards (client components) ──────────────────────────────
import { DashboardModalProvider } from "@/components/admin/dashboard/DashboardModalProvider"
import { DashboardHeaderButtons } from "@/components/admin/dashboard/DashboardHeaderButtons"
import { ChannelStatusCard } from "@/components/admin/dashboard/ChannelStatusCard"
import { NotificationsCard } from "@/components/admin/dashboard/NotificationsCard"
import { CreatorAcademyCard } from "@/components/admin/dashboard/CreatorAcademyCard"
import { UploadPerformanceCard } from "@/components/admin/dashboard/UploadPerformanceCard"
import { AchievementCard } from "@/components/admin/dashboard/AchievementCard"
import { AnalyticsCard } from "@/components/admin/dashboard/AnalyticsCard"
import { PlatformUpdatesCard } from "@/components/admin/dashboard/PlatformUpdatesCard"
import { CommunityPostsCard } from "@/components/admin/dashboard/CommunityPostsCard"
import { CommentsCard } from "@/components/admin/dashboard/CommentsCard"
import { SubscribersCard } from "@/components/admin/dashboard/SubscribersCard"

async function getDashboardStats() {
  await connectToDatabase()

  const [
    totalMovies,
    totalSeries,
    totalShorts,
    pendingMovies,
    totalUsers,
    totalCategories,
    totalReviews,
    totalViewsMovies,
    totalViewsSeries,
    totalViewsShorts,
    recentMovies,
  ] = await Promise.all([
    Movie.countDocuments(),
    Series.countDocuments(),
    Short.countDocuments(),
    Movie.countDocuments({ approvalStatus: "pending" }),
    User.countDocuments(),
    Category.countDocuments(),
    Review.countDocuments(),
    Movie.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]).then((result) => result[0]?.total || 0),
    Series.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]).then((result) => result[0]?.total || 0),
    Short.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]).then((result) => result[0]?.total || 0),
    Movie.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("category", "name")
      .lean(),
  ])

  const totalViews = totalViewsMovies + totalViewsSeries + totalViewsShorts

  return {
    totalMovies,
    totalSeries,
    totalShorts,
    pendingMovies,
    totalUsers,
    totalCategories,
    totalReviews,
    totalViews,
    recentMovies: JSON.parse(JSON.stringify(recentMovies)),
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <DashboardModalProvider>
      <div className="min-h-screen">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Channel dashboard
          </h1>
          <DashboardHeaderButtons />
        </div>

      {/* ── Live Users Bar ──────────────────────────────────────────── */}
      {/* <div className="mb-6">
        <LiveUsersCard />
      </div> */}

      {/* ── 3-column YouTube Studio-style grid ─────────────────────── */}
      {/*
          Column layout (desktop):
            col-1 (left)  : Channel violations + Latest Short performance + Latest post
            col-2 (mid)   : Notifications + Achievement + Channel analytics
            col-3 (right) : Creator Insider + What's new in Studio
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Card 1 – Channel violations */}
          <ChannelStatusCard />

          {/* Card 4 – Latest Short performance */}
          <UploadPerformanceCard />

          {/* Card 8 – Community Posts / Latest post */}
          <CommunityPostsCard />
        </div>

        {/* ── MIDDLE COLUMN ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Card 2 – Important notifications */}
          <NotificationsCard />

          {/* Card 5 – Achievements */}
          <AchievementCard />

          {/* Card 6 – Channel analytics */}
          <AnalyticsCard />

          {/* Card 9 – Recent Comments */}
          <CommentsCard />

          {/* Card 10 – Recent Subscribers */}
          <SubscribersCard />
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 md:col-span-2 xl:col-span-1">
          {/* Card 3 – Creator Insider */}
          <CreatorAcademyCard />

          {/* Card 7 – What's new in Studio */}
          <PlatformUpdatesCard />

          {/* ── Quick Stats strip ─────────────────────────────────── */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-base mb-4">Quick stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Movies", value: stats.totalMovies, icon: Video, href: "/admin/movies", color: "text-blue-400" },
                { label: "Series", value: stats.totalSeries, icon: Video, href: "/admin/series", color: "text-indigo-400" },
                { label: "Shorts", value: stats.totalShorts, icon: Film, href: "/admin/shorts", color: "text-cyan-400" },
                { label: "Pending", value: stats.pendingMovies, icon: Clock, href: "/admin/movies?status=pending", color: "text-yellow-400" },
                { label: "Users", value: stats.totalUsers, icon: Users, href: "/admin/users", color: "text-green-400" },
                { label: "Reviews", value: stats.totalReviews, icon: MessageSquare, href: "/admin/reviews", color: "text-orange-400" },
                { label: "Categories", value: stats.totalCategories, icon: FolderOpen, href: "/admin/categories", color: "text-purple-400" },
                { label: "Views", value: stats.totalViews.toLocaleString(), icon: Eye, href: "/admin/movies", color: "text-pink-400" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
                >
                  <s.icon className={`h-4 w-4 shrink-0 ${s.color}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-bold text-foreground truncate">{s.value}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Quick Actions ─────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground text-base mb-4">Quick actions</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Upload New Movie", href: "/admin/movies/new", icon: Upload },
                { label: "Upload New Series", href: "/admin/series/new", icon: Upload },
                { label: "Upload New Short", href: "/admin/shorts/new", icon: Film },
                { label: "Manage Categories", href: "/admin/categories", icon: FolderOpen },
                {
                  label: `Review Pending (${stats.pendingMovies})`,
                  href: "/admin/movies?status=pending",
                  icon: Clock,
                },
              ].map((a) => (
                <Button
                  key={a.label}
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full justify-start border-border bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground text-xs gap-2"
                >
                  <Link href={a.href}>
                    <a.icon className="h-3.5 w-3.5" />
                    {a.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* ── Recent Movies ─────────────────────────────────────── */}
          {stats.recentMovies.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-base">Recent Movies</h3>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground text-xs">
                  <Link href="/admin/movies">View All</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {stats.recentMovies.map((movie: any) => (
                  <div key={movie._id.toString()} className="flex items-center gap-3">
                    <div className="h-12 w-8 rounded bg-muted overflow-hidden shrink-0">
                      <Image
                        src={movie.poster || "/placeholder.svg"}
                        alt={movie.title}
                        width={32}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{movie.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(movie.category as any)?.name || "Uncategorized"} · {movie.releaseYear}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full shrink-0 font-medium ${
                        movie.approvalStatus === "approved"
                          ? "bg-green-500/15 text-green-400"
                          : movie.approvalStatus === "pending"
                          ? "bg-yellow-500/15 text-yellow-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {movie.approvalStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Link href="#" className="hover:text-foreground transition-colors">Terms of use</Link>
        <Link href="#" className="hover:text-foreground transition-colors">Privacy policy</Link>
        <Link href="#" className="hover:text-foreground transition-colors">Policies &amp; Safety</Link>
        <span className="ml-auto">© {new Date().getFullYear()} Hillywood</span>
      </div>
    </div>
    </DashboardModalProvider>
  )
}
