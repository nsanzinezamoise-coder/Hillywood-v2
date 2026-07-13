"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, MoreVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const notifications = [
  {
    id: 1,
    title: "Content removed from Hillywood",
    body: "We complied with a legal copyright takedown complaint for your movie 'BACKSTAGE S1 EP 4' which means it has been removed from Hillywood. As a result...",
    date: "Jul 6, 2026, 7:11 PM",
    action: "Next steps",
  },
  {
    id: 2,
    title: "New subscriber milestone reached",
    body: "Congratulations! Your channel has reached 5,000 subscribers. Keep creating amazing content to continue growing your audience on Hillywood.",
    date: "Jul 4, 2026, 2:30 PM",
    action: "View Analytics",
  },
]

export function NotificationsCard() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState<number[]>([])

  const visible = notifications.filter((n) => !dismissed.includes(n.id))
  const total = visible.length

  const prev = () => setCurrent((c) => (c - 1 + total) % total)
  const next = () => setCurrent((c) => (c + 1) % total)

  const note = visible[Math.min(current, total - 1)]

  if (total === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 min-h-[160px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No new notifications</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-base">Important notifications</h3>
          <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-muted-foreground text-xs">
          <button onClick={prev} className="hover:text-foreground transition-colors p-1 rounded hover:bg-secondary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums">{(current % total) + 1} / {total}</span>
          <button onClick={next} className="hover:text-foreground transition-colors p-1 rounded hover:bg-secondary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {note && (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-1.5"
          >
            <p className="text-sm font-semibold text-foreground">{note.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{note.body}</p>
            <p className="text-xs text-muted-foreground/70">{note.date}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-1">
        <Button size="sm" variant="secondary" className="text-xs">
          {note?.action || "Next steps"}
        </Button>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary">
          <MoreVertical className="h-4 w-4" />
        </button>
        <button
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary"
          onClick={() => note && setDismissed((d) => [...d, note.id])}
          title="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
