"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Bookmark, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const lessons = [
  {
    id: 1,
    title: "Not every video must bang",
    description:
      "Balancing viral videos with passion projects, plus advice on packaging your Hillywood movie first.",
    instructor: "Creator Insider",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop&auto=format",
  },
  {
    id: 2,
    title: "Grow your channel in 2026",
    description:
      "Proven strategies from top Hillywood producers on audience retention and consistent upload schedules.",
    instructor: "Hillywood Academy",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop&auto=format",
  },
  {
    id: 3,
    title: "Mastering Hillywood Analytics",
    description:
      "Deep dive into your channel metrics. Learn which numbers matter and how to act on the data.",
    instructor: "Creator Insider",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop&auto=format",
  },
  {
    id: 4,
    title: "Monetization unlocked",
    description:
      "Everything you need to know about qualifying for and maximising revenue from the Hillywood Partner Programme.",
    instructor: "Hillywood Academy",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop&auto=format",
  },
  {
    id: 5,
    title: "Thumbnail design secrets",
    description:
      "How to craft click-worthy thumbnails that stand out on mobile feeds and drive higher CTR.",
    instructor: "Creator Insider",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop&auto=format",
  },
]

export function CreatorAcademyCard() {
  const [current, setCurrent] = useState(0)
  const [bookmarked, setBookmarked] = useState<number[]>([])
  const total = lessons.length
  const lesson = lessons[current]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-base">Creator Insider</h3>
        <div className="flex items-center gap-0.5 text-muted-foreground text-xs">
          <button
            onClick={() => setCurrent((c) => (c - 1 + total) % total)}
            className="hover:text-foreground transition-colors p-1 rounded hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums">{current + 1} / {total}</span>
          <button
            onClick={() => setCurrent((c) => (c + 1) % total)}
            className="hover:text-foreground transition-colors p-1 rounded hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={lesson.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-3"
        >
          {/* Thumbnail */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <Image
              src={lesson.thumbnail}
              alt={lesson.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-2 left-2">
              <span className="text-xs bg-black/70 text-white px-2 py-0.5 rounded font-medium">
                {lesson.instructor}
              </span>
            </div>
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="h-12 w-12 rounded-full bg-black/60 flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-white ml-0.5" />
              </div>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground leading-snug">{lesson.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{lesson.description}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2 mt-auto">
        <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
          <Play className="h-3.5 w-3.5 fill-current" />
          Watch on Hillywood
        </Button>
        <button
          onClick={() =>
            setBookmarked((b) =>
              b.includes(lesson.id) ? b.filter((x) => x !== lesson.id) : [...b, lesson.id]
            )
          }
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-secondary"
          title={bookmarked.includes(lesson.id) ? "Remove bookmark" : "Bookmark"}
        >
          <Bookmark
            className={`h-4 w-4 ${bookmarked.includes(lesson.id) ? "fill-current text-foreground" : ""}`}
          />
        </button>
      </div>
    </motion.div>
  )
}
