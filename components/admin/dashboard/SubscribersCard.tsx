"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDashboardModal } from "./DashboardModalProvider"

const subscribers = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/40?img=11",
    name: "BLESSO FAMILY",
    count: "14.5K subscribers",
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/40?img=22",
    name: "TRENDNATION HUB",
    count: "9.79K subscribers",
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/40?img=33",
    name: "Stories That Stay Hub",
    count: "5.28K subscribers",
  },
]

export function SubscribersCard() {
  const { openModal } = useDashboardModal()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.22 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <div>
        <h3 className="font-semibold text-foreground text-base">Recent subscribers</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Last 90 days</p>
      </div>

      <div className="flex flex-col">
        {subscribers.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-3 py-2.5 border-b border-border last:border-none"
          >
            <div className="relative h-9 w-9 rounded-full overflow-hidden bg-muted shrink-0">
              <Image
                src={sub.avatar}
                alt={sub.name}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
              <p className="text-xs text-muted-foreground">{sub.count}</p>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => openModal("subscribers")}
      >
        See all
      </Button>
    </motion.div>
  )
}
