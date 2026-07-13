"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart2,
  MessageSquare,
  ThumbsUp,
  Eye,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Edit2,
  Share2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const THUMBNAIL =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=320&h=180&fit=crop&auto=format"

const stats = [
  { label: "Ranking by views", value: "1 of 10", positive: true },
  { label: "Views", value: "2.4K", positive: true },
  { label: "Average percentage viewed", value: "69.4%", positive: true },
  { label: "Likes", value: "36", positive: true },
]

export function UploadPerformanceCard() {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <h3 className="font-semibold text-foreground text-base">Latest Short performance</h3>

      {/* Thumbnail + title row */}
      <div className="flex gap-3 items-start">
        <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
          <Image
            src={THUMBNAIL}
            alt="Latest upload"
            fill
            className="object-cover"
            sizes="112px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
            Umunsi mwiza wUmuziki 🎵🎤 Ese Gina...
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> 2.4K views · 198 reactions
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BarChart2 className="h-3 w-3" /> 513</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> 2</span>
            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> 36</span>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="ml-auto text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-secondary"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable stats */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col"
        >
          <p className="text-xs text-muted-foreground mb-2">First 22 days 3 hours</p>
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between py-2 border-b border-border last:border-none"
            >
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{s.value}</span>
                <TrendingUp
                  className={`h-3 w-3 ${s.positive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
          <Sparkles className="h-3.5 w-3.5" /> Catch me up on this video
        </Button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-secondary">
          <BarChart2 className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-secondary">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-secondary ml-auto">
          <Edit2 className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-secondary">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
