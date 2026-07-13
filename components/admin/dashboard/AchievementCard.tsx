"use client"

import { motion } from "framer-motion"
import { Trophy, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AchievementCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <h3 className="font-semibold text-foreground text-base">New achievement</h3>

      <div className="flex items-center gap-4">
        <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/10">
          <Trophy className="h-7 w-7 text-yellow-500 dark:text-yellow-400" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">5,000 subscribers!</p>
          <p className="text-xs text-muted-foreground mt-0.5">People like your channel, and it shows</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" className="text-xs">
          View analytics
        </Button>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
