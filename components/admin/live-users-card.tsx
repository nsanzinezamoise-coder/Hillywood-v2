"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Radio, Users, UserCheck, Eye } from "lucide-react"
import { useLiveUsers } from "@/components/live-users-provider"

export function LiveUsersCard() {
  const { liveCounts, isConnected } = useLiveUsers()

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 group hover:shadow-lg hover:shadow-primary/5 transition-all duration-500">
      {/* Animated glow background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-primary/20 transition-colors duration-700 animate-pulse pointer-events-none" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          {/* Left side - main count */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-500">
                <Radio className="h-7 w-7" />
              </div>
              {/* Live indicator dot */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
              </span>
            </div>
            
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-bold tracking-tight tabular-nums">
                  {liveCounts.total}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Live
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Users on site right now
              </p>
            </div>
          </div>

          {/* Right side - breakdown */}
          <div className="hidden sm:flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-green-500 mb-1">
                <UserCheck className="h-4 w-4" />
                <span className="text-2xl font-bold tabular-nums">{liveCounts.accounts}</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signed In
              </p>
            </div>
            
            <div className="w-px h-10 bg-border" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-orange-500 mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-2xl font-bold tabular-nums">{liveCounts.visitors}</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Guests
              </p>
            </div>

            {/* Signal bars */}
            <div className="flex gap-0.5 items-end ml-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary/20 overflow-hidden"
                  style={{ height: `${8 + i * 4}px` }}
                >
                  <div
                    className="w-full bg-primary rounded-full animate-pulse"
                    style={{
                      height: isConnected ? "100%" : "0%",
                      animationDelay: `${i * 200}ms`,
                      transition: "height 0.3s ease",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile breakdown */}
        <div className="flex sm:hidden items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-green-500">
            <UserCheck className="h-3.5 w-3.5" />
            <span className="text-sm font-bold">{liveCounts.accounts}</span>
            <span className="text-xs text-muted-foreground">Signed In</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5 text-orange-500">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-sm font-bold">{liveCounts.visitors}</span>
            <span className="text-xs text-muted-foreground">Guests</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
