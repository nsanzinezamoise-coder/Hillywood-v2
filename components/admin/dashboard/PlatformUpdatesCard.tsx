"use client"

import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"

const updates = [
  { title: "Increasing Shorts length", isNew: false },
  { title: "Expansion of channel permissions", isNew: false },
  { title: "Upcoming changes to Community Guidelines warnings", isNew: true },
]

export function PlatformUpdatesCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
    >
      <h3 className="font-semibold text-foreground text-base">What&apos;s new in Studio</h3>

      <div className="flex flex-col">
        {updates.map((u, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 py-3">
              {u.isNew && (
                <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide shrink-0">
                  NEW
                </span>
              )}
              <p className="text-sm text-foreground leading-snug">{u.title}</p>
            </div>
            {i < updates.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
