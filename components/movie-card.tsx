"use client"

import Link from "next/link"
import { Play, Plus, Download } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"

interface MovieCardProps {
  movie: {
    _id: string
    title: string
    slug: string
    poster: string
    releaseYear: number
    rating: number
    downloadUrl?: string
    seasons?: number
    duration?: number
    category?: {
      name: string
    }
  }
}

export function MovieCard({ movie }: MovieCardProps) {
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

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (movie.downloadUrl) {
      window.open(movie.downloadUrl, '_blank', 'noopener,noreferrer')
      fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId: movie._id }),
      }).catch(console.error)
    }
  }

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
        body: JSON.stringify({ movieId: movie._id }),
      })

      if (response.ok) {
        setAdded(true)
        toast.success("Added to Watchlist", {
          description: `${movie.title} has been added to your watchlist.`,
        })
      } else {
        toast.error("Failed to add to watchlist")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsAdding(false)
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

  const getDetailUrl = () => {
    if (movie.seasons !== undefined) {
      return `/serie/${movie.slug}`
    }
    if (movie.duration !== undefined && movie.duration < 15) {
      return `/shorts/${movie.slug}`
    }
    return `/movie/${movie.slug}`
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
        {/* Main Link (Stretched) - Now inside the relative container but at lower z-index than buttons */}
        <Link
          href={getDetailUrl()}
          className="absolute inset-0 z-10"
          aria-label={movie.title}
        />

        {/* Poster */}
        <div className="relative aspect-3/4 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div
            className="
              absolute inset-0
              bg-linear-to-t from-black/70 via-black/30 to-transparent
              opacity-60 group-hover:opacity-80
              transition-opacity duration-300
              shadow-inner
              pointer-events-none
            "
          />

          {/* Hover/Touch Overlay */}
          <div
            className={`
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
            `}
          >
            {/* Play button - non-clickable, just for show */}
            <div
              className="
                absolute bottom-24
                w-14 h-14 md:w-16 md:h-16 rounded-full
                bg-linear-to-br from-red-600 to-red-700
                flex items-center justify-center
                transform scale-75 group-hover:scale-100
                transition-transform duration-300
                shadow-2xl
                ring-2 ring-white/30
                z-30
                pointer-events-none
              "
            >
              <Play className="w-7 h-7 md:w-8 md:h-8 text-white fill-current ml-1" />
            </div>

            {/* Action buttons - these should be clickable */}
            <div
              className="
                absolute bottom-10 left-0 right-0
                flex justify-center gap-4
                transition-opacity duration-300 delay-100
                z-40
              "
            >
              {movie.downloadUrl && (
                <button
                  onClick={handleDownload}
                  className="
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    shadow-lg ring-1 ring-white/30
                    hover:-translate-y-0.5
                    bg-black/50 hover:bg-red-600/80
                    relative z-50 cursor-pointer
                    active:bg-red-600/80
                    pointer-events-auto
                  "
                  aria-label="Download movie"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
              )}

              {user && (
                <button
                  onClick={handleAddToWatchlist}
                  disabled={isAdding || added}
                  className={`
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    shadow-lg ring-1 ring-white/30
                    hover:-translate-y-0.5
                    relative z-50
                    active:bg-red-600/80
                    ${isAdding || added
                      ? 'bg-gray-500/50 opacity-50 cursor-not-allowed'
                      : 'bg-black/50 hover:bg-red-600/80 cursor-pointer'
                    }
                    pointer-events-auto
                  `}
                  aria-label="Add to list"
                >
                  <Plus className={`w-5 h-5 text-white ${added ? "rotate-45 transform" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {/* Rating */}
          {movie.rating > 0 && (
            <div
              className="
                absolute top-2 right-2
                px-1.5 py-0.5 rounded-full
                bg-linear-to-br from-black/80 to-black/90 backdrop-blur-sm
                text-white text-xs font-semibold
                shadow-lg ring-1 ring-white/20
                z-20
                pointer-events-none
              "
            >
              <span className="text-yellow-300">★</span> {movie.rating.toFixed(1)}
            </div>
          )}

          {/* Year */}
          <div className="absolute bottom-2 left-2 z-20">
            <span
              className="
                px-1.5 py-0.5 rounded
                bg-linear-to-br from-black/70 to-black/80 backdrop-blur-sm
                text-white text-xs
                shadow-lg ring-1 ring-white/20
                pointer-events-none
              "
            >
              {movie.releaseYear}
            </span>
          </div>

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
              {movie.seasons !== undefined
                ? 'SERIES'
                : (movie.duration !== undefined && movie.duration < 15)
                  ? 'SHORTS'
                  : 'MOVIE'
              }
            </span>
          </div>

          {/* Mobile touch indicator */}
          {isMobile && !isActive && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-200 pointer-events-none" />
          )}
        </div>

        {/* Info */}
        <div
          className="
            p-2 md:p-3
            bg-linear-to-b from-white to-gray-50
            dark:from-gray-800 dark:to-gray-900
            h-[100px] md:h-[110px]
            flex flex-col
            pointer-events-none
          "
        >
          <h3
            className="
              font-semibold text-gray-900 dark:text-white
              text-xs md:text-sm
              line-clamp-2
              group-hover:text-red-600 dark:group-hover:text-red-500
              transition-colors duration-300
              h-10 md:h-12 overflow-hidden mb-1
              uppercase
            "
          >
            {movie.title}
          </h3>

          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <div className="flex items-center gap-0.5 truncate max-w-[100px] md:max-w-[120px]">
                <span className="drop-shadow-sm whitespace-nowrap">{movie.releaseYear}</span>
                {movie.category?.name && (
                  <>
                    <span className="mx-0.5 drop-shadow-sm">·</span>
                    <span className="font-medium drop-shadow-sm truncate">{movie.category.name}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] h-4">
              <span className="text-gray-500">
                {movie.duration ? (
                  `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m`
                ) : (
                  <span className="text-transparent">Movie</span>
                )}
              </span>
              <span className="w-4"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}