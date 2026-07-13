"use client"

import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDashboardModal } from "./DashboardModalProvider"

const comments = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/32?img=10",
    username: "@MarieTUYISHIMIRE-p...",
    comment: "Mani muduhe from kbs❤",
    movieTitle: "Post",
    time: "4 days ago",
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/32?img=20",
    username: "@gatsinziEpiphanie-b4d",
    comment: "Ubundi mwebwe mudukorera umuti❤",
    movieTitle: "Post",
    time: "1 week ago",
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/32?img=30",
    username: "@NcutiniyesuBienvenu",
    comment: "Vp",
    movieTitle: "Post",
    time: "1 week ago",
  },
]

export function CommentsCard() {
  const { openModal } = useDashboardModal()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <h3 className="font-semibold text-foreground text-base">Comments</h3>

      <div className="flex flex-col">
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex items-start gap-3 py-3 border-b border-border last:border-none"
          >
            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-muted shrink-0">
              <Image src={c.avatar} alt={c.username} fill className="object-cover" sizes="32px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-medium text-foreground truncate max-w-[130px]">
                  {c.username}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{c.time}</span>
                <span className="ml-auto flex items-center gap-1 text-xs border border-border text-muted-foreground px-1.5 py-0.5 rounded-sm shrink-0">
                  <ExternalLink className="h-2.5 w-2.5" />
                  {c.movieTitle}
                </span>
              </div>
              <p className="text-sm text-foreground leading-snug">{c.comment}</p>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => openModal("comments")}
      >
        View more
      </Button>
    </motion.div>
  )
}
