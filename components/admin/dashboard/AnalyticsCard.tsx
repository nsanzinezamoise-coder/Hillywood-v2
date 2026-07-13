"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"
import { useDashboardModal } from "./DashboardModalProvider"

const viewsData = [
  { day: "M", v: 4000 },
  { day: "T", v: 3000 },
  { day: "W", v: 5200 },
  { day: "T", v: 2780 },
  { day: "F", v: 6890 },
  { day: "S", v: 5390 },
  { day: "S", v: 7490 },
]

const summaryRows = [
  { label: "Views", value: "234.4K", positive: true },
  { label: "Watch time (hours)", value: "33.1K", positive: false },
  { label: "Subscribers", value: "+5,631", positive: true },
  { label: "Revenue", value: "$1,284", positive: true },
]

export function AnalyticsCard() {
  const { openModal } = useDashboardModal()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <h3 className="font-semibold text-foreground text-base">Channel analytics</h3>

      {/* Subscriber hero */}
      <div>
        <p className="text-xs text-muted-foreground">Current subscribers</p>
        <p className="text-4xl font-bold text-foreground mt-0.5 tabular-nums">5,786</p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          +5,631 in last 28 days
        </p>
      </div>

      {/* Mini chart */}
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={viewsData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
                color: "hsl(var(--popover-foreground))",
              }}
              labelStyle={{ display: "none" }}
              itemStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#viewGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Summary</p>
          <p className="text-xs text-muted-foreground">Last 28 days</p>
        </div>
        <div className="flex flex-col">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2 border-b border-border last:border-none"
            >
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground tabular-nums">{row.value}</span>
                {row.positive ? (
                  <TrendingUp className="h-3 w-3 text-green-500 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 dark:text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => openModal("analytics")}
      >
        Go to channel analytics
      </Button>
    </motion.div>
  )
}
