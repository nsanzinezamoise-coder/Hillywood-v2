"use client"

import { motion } from "framer-motion"
import { Heart, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const posts = [
  {
    id: 1,
    content:
      "ukore subscribe kugirango ubone izikurikira 🔥🔥🔥🔥🔥...",
    thumbnail:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&h=80&fit=crop&auto=format",
    likes: 16,
    comments: 0,
  },
]

export function CommunityPostsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-base">Latest post</h3>
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Create Post
        </Button>
      </div>

      {posts.map((post) => (
        <div key={post.id} className="flex flex-col gap-3">
          {/* Post content */}
          <div className="flex gap-3">
            <p className="text-sm text-foreground leading-relaxed flex-1">{post.content}</p>
            <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image
                src={post.thumbnail}
                alt="post thumbnail"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Likes</span>
              <span className="text-base font-bold text-foreground">{post.likes}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Comments</span>
              <span className="text-base font-bold text-foreground">{post.comments}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Leave a heart and reply on your post to show you care!
          </p>
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full text-xs">
        Go to Posts tab
      </Button>
    </motion.div>
  )
}
