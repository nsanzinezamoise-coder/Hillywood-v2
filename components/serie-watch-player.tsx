"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, X } from "lucide-react"
import { useState, useEffect } from "react"

interface Series {
  _id: string
  title: string
  slug: string
  videoUrl: string
  poster: string
  backdrop?: string
}

interface SerieWatchPlayerProps {
  series: Series
}

export function SerieWatchPlayer({ series }: SerieWatchPlayerProps) {
  const router = useRouter()
  const [showControls] = useState(true)

  useEffect(() => {
    // Increment view count
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: series._id, type: "series" }),
    }).catch(console.error)

    // Save to history (if logged in)
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesId: series._id, progress: 0 }),
    }).catch(console.error)
  }, [series._id])

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">

      {/* Back Home Button */}
      <div
        className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-50 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
          }`}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
          className="gap-1 sm:gap-2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md h-8 sm:h-10 px-2 sm:px-4"
        >
          <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline text-xs sm:text-sm">
            Back Home
          </span>
        </Button>
      </div>

      {/* Close Button */}
      <div
        className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-50 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
          }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/serie/${series.slug}`)}
          className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-md h-8 w-8 sm:h-10 sm:w-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Video Container */}
      <div className="w-full max-w-6xl px-2 sm:px-4">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">

          {/* Google Drive iframe */}
          <iframe
            src={series.videoUrl}
            title={series.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />

          {/* 🔥 Overlay to hide fullscreen popup */}
          <div
            className="
              absolute 
              top-0 
              right-0 
              z-40
              w-16 
              h-16 
              sm:w-20 
              sm:h-20
              bg-black
            "
          />

        </div>
      </div>
    </div>
  )
}