"use client"

import Link from "next/link"
import { Play, Plus, Download, Clock } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

interface SeriesCardProps {
  series: {
    _id: string
    title: string
    slug: string
    poster: string
    releaseYear: number
    rating: number
    duration?: number
    downloadurl?: string
    category?: {
      name: string
      slug: string
    }
    seasons?: number
    episodes?: number
  }
}

export function SeriesCard({ series }: SeriesCardProps) {
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isActive, setIsActive] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error("Please sign in to add to watchlist")
      return
    }

    setIsAdding(true)

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId: series._id }),
      })

      const data = await response.json()

      if (response.ok) {
        setAdded(true)
        toast.success("Added to Watchlist", {
          description: `${series.title} has been added to your watchlist.`,
        })
      } else {
        toast.error(data.message || "Failed to add to watchlist")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (series.downloadurl) {
      window.open(series.downloadurl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCardTouch = (e: React.MouseEvent) => {
    // If clicking a button, don't toggle the card state
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (isMobile) {
      // Toggle card active state on mobile to show buttons
      if (!isActive) {
        e.preventDefault()
        e.stopPropagation()
        setIsActive(true)
      }
    }
  }

  return (
    <div
      className="
        flex-none
        w-[140px] md:w-[160px] lg:w-[180px]
        transform transition-all duration-300
        hover:scale-105 hover:shadow-2xl
        relative group
      "
      onClick={handleCardTouch}
    >
      <div
        className="
          relative overflow-hidden rounded-lg
          bg-white dark:bg-gray-800
          shadow-lg hover:shadow-2xl hover:shadow-red-500/20
          transition-all duration-300
          group-hover:-translate-y-1
          border border-gray-100 dark:border-gray-700
          h-full
          flex flex-col
          z-20
        "
      >
        <Link
          href={`/serie/${series.slug}`}
          className="absolute inset-0 z-10"
          aria-label={series.title}
        />

        {/* Poster - same aspect ratio as movies */}
        <div className="relative aspect-3/4 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={series.poster || "/placeholder.svg"}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

          {/* Hover/Touch Overlay */}
          <div className={`
            absolute inset-0 
            transition-all duration-300
            bg-linear-to-b from-black/50 to-black/70
            pointer-events-none
            ${isMobile
              ? isActive
                ? 'opacity-100 flex items-center justify-center'
                : 'opacity-0 hidden'
              : 'opacity-0 group-hover:opacity-100 flex items-center justify-center'
            }
            z-30
          `}>
            {/* Play button - non-clickable, just for show */}
            <div className="
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-14 h-14 md:w-16 md:h-16 rounded-full 
              bg-linear-to-br from-red-600 to-red-700 
              flex items-center justify-center
              scale-75 group-hover:scale-100 
              transition-transform duration-300 
              shadow-2xl ring-2 ring-white/30 
              z-30
              pointer-events-none
            ">
              <Play className="w-7 h-7 md:w-8 md:h-8 text-white fill-current ml-1" />
            </div>

            {/* Action buttons - these should be clickable */}
            <div className="
              absolute bottom-3 left-0 right-0 
              flex justify-center gap-3
              transition-opacity duration-300 delay-100 
              z-40
            ">
              {series.downloadurl ? (
                <button
                  onClick={handleDownload}
                  className="
                    w-8 h-8 md:w-9 md:h-9 rounded-full 
                    flex items-center justify-center 
                    bg-black/50 hover:bg-red-600/80 
                    shadow-lg ring-1 ring-white/30 
                    hover:-translate-y-0.5 
                    transition-all duration-300
                    relative cursor-pointer
                    active:bg-red-600/80
                    z-50
                    pointer-events-auto
                  "
                  aria-label="Download series"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              ) : (
                <button
                  disabled
                  className="
                    w-8 h-8 md:w-9 md:h-9 rounded-full 
                    flex items-center justify-center 
                    bg-gray-500/50 
                    shadow-lg ring-1 ring-white/30 
                    opacity-50 cursor-not-allowed
                    relative
                    z-50
                  "
                  aria-label="No download available"
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </button>
              )}

              <button
                onClick={handleAddToWatchlist}
                disabled={!user || isAdding || added}
                className={`
                  w-8 h-8 md:w-9 md:h-9 rounded-full 
                  flex items-center justify-center 
                  shadow-lg ring-1 ring-white/30 
                  hover:-translate-y-0.5 
                  transition-all duration-300
                  relative
                  z-50
                  active:bg-red-600/80
                  ${!user || isAdding || added
                    ? 'bg-gray-500/50 opacity-50 cursor-not-allowed'
                    : 'bg-black/50 hover:bg-red-600/80 cursor-pointer'
                  }
                  pointer-events-auto
                `}
              >
                <Plus className={`w-4 h-4 md:w-5 md:h-5 text-white ${added ? "rotate-45 transform" : ""}`} />
              </button>
            </div>
          </div>

          {/* Rating badge */}
          {series.rating > 0 && (
            <div className="
              absolute top-2 right-2
              flex items-center gap-0.5
              px-1.5 py-0.5 rounded-full
              bg-linear-to-br from-black/80 to-black/90 backdrop-blur-sm
              text-white text-xs font-semibold
              shadow-lg ring-1 ring-white/20
              z-20
              pointer-events-none
            ">
              <span className="text-yellow-300">★</span>
              <span>{series.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Content Type Badge */}
          <div className="absolute top-2 left-2 z-20">
            <span className="
              px-1.5 py-0.5 rounded 
              backdrop-blur-sm
              text-white text-xs font-medium
              shadow-lg ring-1 ring-white/20
              bg-linear-to-br from-red-600 to-red-700
              pointer-events-none
            ">
              SERIES
            </span>
          </div>

          {/* Year badge */}
          <div className="absolute bottom-2 left-2 z-20">
            <span className="
              px-1.5 py-0.5 rounded 
              bg-linear-to-br from-black/70 to-black/80 backdrop-blur-sm
              text-white text-xs
              shadow-lg ring-1 ring-white/20
              pointer-events-none
            ">
              {series.releaseYear}
            </span>
          </div>

          {/* Mobile touch indicator */}
          {isMobile && !isActive && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-200 pointer-events-none" />
          )}
        </div>

        {/* Info section */}
        <div className="
          p-2 md:p-3
          bg-linear-to-b from-white to-gray-50 
          dark:from-gray-800 dark:to-gray-900
          h-[100px] md:h-[110px]
          flex flex-col
          pointer-events-none
        ">
          {/* Title - fixed height for 2 lines */}
          <div className="h-10 md:h-12 overflow-hidden mb-1">
            <h3 className="
              font-semibold text-gray-900 dark:text-white
              text-xs md:text-sm
              line-clamp-2
              group-hover:text-red-600 dark:group-hover:text-red-500
              transition-colors duration-300
              drop-shadow-sm
              uppercase
            ">
              {series.title}
            </h3>
          </div>

          {/* Bottom section */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <div className="flex items-center gap-0.5 truncate max-w-[100px] md:max-w-[120px]">
                <span className="drop-shadow-sm whitespace-nowrap">{series.releaseYear}</span>
                {series.category?.name && (
                  <>
                    <span className="mx-0.5 drop-shadow-sm">·</span>
                    <span className="font-medium drop-shadow-sm truncate">{series.category.name}</span>
                  </>
                )}
              </div>

            </div>

            <div className="flex items-center justify-between text-[10px] h-4">
              <span className="text-gray-500">
                {(() => {
                  const parts = [];
                  if (series.seasons) {
                    parts.push(`${series.seasons} ${series.seasons === 1 ? 'Season' : 'Season'}`);
                  }
                  if (series.episodes) {
                    parts.push(`${series.episodes} ${series.episodes === 1 ? 'Episode' : 'Episode'}`);
                  }

                  if (parts.length > 0) {
                    return parts.join(' · ');
                  }

                  if (series.duration) {
                    return (
                      <>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {Math.floor(series.duration / 60)}h {series.duration % 60}m
                      </>
                    );
                  }

                  return "Series";
                })()}
              </span>
              <span className="text-transparent">•</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}