"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { Play, ChevronLeft, ChevronRight, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Movie {
  _id: string
  title: string
  slug: string
  description: string
  poster: string
  videoUrl?: string
  downloadUrl?: string
  downloadurl?: string // for series
  duration?: number
  releaseYear: number
  rating: number
  ratingCount: number
  language: string[]
  category?: {
    name: string
    slug: string
  }
  isNewRelease?: boolean
  isTrending?: boolean
  seasons?: number
  episodes?: number
}

interface CategorySectionProps {
  title: string
  slug: string
  movies: Movie[]
  viewAllHref?: string
  icon?: React.ReactNode
  emptyMessage?: string
  rightAddon?: React.ReactNode
}

export function CategorySection({
  title,
  slug,
  movies,
  viewAllHref,
  icon,
  emptyMessage = "No content available in this category",
  rightAddon,
}: CategorySectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const href = viewAllHref || `/browse?category=${slug}`

  if (movies.length === 0) {
    return (
      <section className="py-2 md:py-3">
        <div className="px-4 md:px-6 mb-2 md:mb-3">
          <div className="flex items-center gap-2">
            {icon && <div className="text-red-600">{icon}</div>}
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <div className="w-12 h-0.5 bg-red-600 mt-1"></div>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-6">
          <div className="
            flex flex-col items-center justify-center py-10 px-4
            rounded-xl bg-gray-50/50 dark:bg-gray-800/20
            border border-dashed border-gray-200 dark:border-gray-700
          ">
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium text-center">
              {emptyMessage}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 280
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  // Determine content type based on the section slug or data structure
  const isSeries = (movie: Movie): boolean => {
    // Check if it's from the series section or has series-specific fields
    return slug === "series" ||
      (movie.seasons !== undefined && movie.seasons > 0) ||
      (movie.episodes !== undefined && movie.episodes > 0);
  }


  const getDetailUrl = (movie: Movie): string => {
    if (isSeries(movie)) {
      return `/serie/${movie.slug}`;
    }
    return `/movie/${movie.slug}`;
  }

  const getContentTypeBadge = (movie: Movie): string => {
    if (isSeries(movie)) return "SERIES";
    return "MOVIE";
  }

  const getBadgeColor = (movie: Movie): string => {
    if (isSeries(movie)) {
      return 'bg-gradient-to-br from-purple-600 to-purple-700'
    }
    return 'bg-gradient-to-br from-red-600 to-red-700'
  }

  const logDownload = async (movie: Movie) => {
    let payload = {}

    if (isSeries(movie)) {
      payload = { seriesId: movie._id }
    } else {
      payload = { movieId: movie._id }
    }

    try {
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("Download logging failed:", error)
    }
  }

  const handleAddToWatchlist = async (e: React.MouseEvent, movie: Movie) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error("Please sign in to add to watchlist")
      return
    }

    try {
      let payload = {}

      if (isSeries(movie)) {
        payload = { seriesId: movie._id }
      } else {
        payload = { movieId: movie._id }
      }

      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Added to Watchlist", {
          description: `${movie.title} has been added to your watchlist.`,
        })
      } else {
        toast.error(data.message || "Failed to add to watchlist")
      }
    } catch (error) {
      console.error("Watchlist error:", error)
      toast.error("An error occurred while adding to watchlist")
    }
  }

  const handleDownload = async (e: React.MouseEvent, movie: Movie) => {
    e.preventDefault()
    e.stopPropagation()

    const downloadUrl = movie.downloadUrl || movie.downloadurl

    if (downloadUrl) {
      await logDownload(movie)
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getDurationDisplay = (movie: Movie): string => {
    if (isSeries(movie)) {
      const parts = []
      if (movie.seasons) {
        parts.push(`${movie.seasons} ${movie.seasons === 1 ? 'Season' : 'Season'}`)
      }
      if (movie.episodes) {
        parts.push(`${movie.episodes} ${movie.episodes === 1 ? 'Episode' : 'Episode'}`)
      }
      return parts.join(' · ')
    }

    if (movie.duration) {
      const hours = Math.floor(movie.duration / 60)
      const minutes = movie.duration % 60
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }

    return ""
  }

  const handleCardTouch = (e: React.MouseEvent, movieId: string) => {
    // If clicking a button, don't toggle the card state
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (isMobile) {
      // If the card is not already active, show the overlay and prevent navigation
      if (activeCard !== movieId) {
        e.preventDefault()
        e.stopPropagation()
        setActiveCard(movieId)
      }
    }
  }

  return (
    <section className="py-2 md:py-3">
      {/* Header */}
      <div className="px-4 md:px-6 mb-2 md:mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <div className="text-red-600">{icon}</div>}
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <div className="w-12 h-0.5 bg-red-600 mt-1"></div>
            </div>
          </div>

          {/* Desktop navigation and View All */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="
                  rounded-full border-gray-300 dark:border-gray-700
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  hover:border-gray-400 dark:hover:border-gray-600
                  transition-colors
                  shadow-md
                  w-8 h-8 md:w-9 md:h-9
                "
                onClick={() => scroll("left")}
                aria-label="Previous items"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="
                  rounded-full border-gray-300 dark:border-gray-700
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  hover:border-gray-400 dark:hover:border-gray-600
                  transition-colors
                  shadow-md
                  w-8 h-8 md:w-9 md:h-9
                "
                onClick={() => scroll("right")}
                aria-label="Next items"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>

            <Link
              href={href}
              className="flex items-center gap-0.5 text-xs md:text-sm font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="relative flex items-start gap-4">
        <div
          ref={scrollRef}
          className="
            flex overflow-x-auto scroll-smooth
            gap-2 md:gap-3
            px-4 md:px-6
            scrollbar-hide
            pb-1
          "
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {movies.map((movie) => {
            const seriesType = isSeries(movie)
            const isActive = activeCard === movie._id

            return (
              <div
                key={movie._id}
                className="
                  flex-none
                  w-[140px] md:w-[160px] lg:w-[180px]
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-2xl
                  relative group
                "
                onClick={(e) => handleCardTouch(e, movie._id)}
              >
                <div className="
                  relative overflow-hidden rounded-lg
                  bg-white dark:bg-gray-800
                  shadow-lg hover:shadow-2xl hover:shadow-red-500/20
                  transition-all duration-300
                  group-hover:-translate-y-1
                  border border-gray-100 dark:border-gray-700
                  h-full
                  flex flex-col
                  z-20
                ">
                  {/* Main Link Overlay - Now inside the relative container */}
                  <Link
                    href={getDetailUrl(movie)}
                    className="absolute inset-0 z-10"
                    aria-label={movie.title}
                  />

                  {/* Poster image - FIXED HEIGHT for all content types */}
                  <div className="
                      relative overflow-hidden bg-gray-200 dark:bg-gray-700
                      aspect-3/4
                      w-full
                      shrink-0
                    ">
                    <img
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Dark gradient overlay */}
                    <div className="
                        absolute inset-0 
                        bg-linear-to-t from-black/70 via-black/30 to-transparent 
                        opacity-60 group-hover:opacity-80 
                        transition-opacity duration-300
                        shadow-inner
                      " />

                    {/* Main Play Icon Overlay - Show on hover for desktop, on touch for mobile */}
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
                      `}>
                      <div className="
                          relative
                          w-14 h-14 md:w-16 md:h-16 rounded-full
                          bg-linear-to-br from-red-600 to-red-700 
                          flex items-center justify-center
                          transform scale-75 group-hover:scale-100
                          transition-transform duration-300
                          shadow-2xl
                          ring-2 ring-white/30
                          z-30
                        ">
                        <Play className="w-7 h-7 md:w-8 md:h-8 text-white fill-current ml-1 drop-shadow-2xl" />
                      </div>

                      {/* Download and Add-to-List icons */}
                      <div className="
                          absolute bottom-5 left-0 right-0
                          flex justify-center items-center gap-4
                          transition-opacity duration-300 delay-100
                          z-30
                        ">
                        {movie.downloadUrl || movie.downloadurl ? (
                          <button
                            onClick={(e) => handleDownload(e, movie)}
                            className="
                                w-10 h-10 rounded-full
                                flex items-center justify-center
                                transform scale-90 group-hover:scale-100
                                transition-all duration-300
                                shadow-lg
                                ring-1 ring-white/30
                                hover:-translate-y-0.5
                                bg-black/50 hover:bg-red-600/80 cursor-pointer
                                active:bg-red-600/80
                                relative z-40
                                pointer-events-auto
                              "
                            aria-label={`Download ${movie.title}`}
                            title="Download video"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="
                                w-10 h-10 rounded-full
                                flex items-center justify-center
                                transform scale-90 group-hover:scale-100
                                transition-all duration-300
                                shadow-lg
                                ring-1 ring-white/30
                                bg-gray-500/50 cursor-not-allowed opacity-50
                                relative z-40
                              "
                            aria-label={`No video available for ${movie.title}`}
                            title="No video available"
                          >
                            <Download className="w-5 h-5 text-white" />
                          </button>
                        )}

                        {user && (
                          <button
                            onClick={(e) => handleAddToWatchlist(e, movie)}
                            className="
                                w-10 h-10 rounded-full
                                flex items-center justify-center
                                transform scale-90 group-hover:scale-100
                                transition-all duration-300
                                shadow-lg
                                ring-1 ring-white/30
                                hover:-translate-y-0.5
                                bg-black/50 hover:bg-red-600/80
                                active:bg-red-600/80
                                relative z-40
                                pointer-events-auto
                              "
                            aria-label={`Add ${movie.title} to list`}
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rating badge */}
                    {movie.rating > 0 && (
                      <div className="
                          absolute top-2 right-2
                          flex items-center justify-center gap-0.5
                          px-1.5 py-0.5 rounded-full
                          bg-linear-to-br from-black/80 to-black/90 backdrop-blur-sm
                          text-white text-xs font-semibold
                          z-40
                          shadow-lg
                          ring-1 ring-white/20
                        ">
                        <span className="text-yellow-300 drop-shadow">★</span>
                        <span className="drop-shadow">{movie.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Content Type Badge */}
                    <div className="absolute top-2 left-2 z-40">
                      <span className={`
                          px-1.5 py-0.5 rounded 
                          backdrop-blur-sm
                          text-white text-xs font-medium
                          shadow-lg ring-1 ring-white/20
                          ${getBadgeColor(movie)}
                        `}>
                        {getContentTypeBadge(movie)}
                      </span>
                    </div>

                    {/* Year badge */}
                    <div className="absolute bottom-2 left-2 z-40">
                      <span className="
                          px-1.5 py-0.5 rounded 
                          bg-linear-to-br from-black/70 to-black/80 backdrop-blur-sm
                          text-white text-xs
                          shadow-lg ring-1 ring-white/20
                        ">
                        {movie.releaseYear}
                      </span>
                    </div>

                    {/* Mobile touch indicator - optional */}
                    {isMobile && !isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-200" />
                    )}
                  </div>

                  {/* Info section - FIXED HEIGHT for all content types */}
                  <div className="
                      p-2 md:p-3
                      bg-linear-to-b from-white to-gray-50 
                      dark:from-gray-800 dark:to-gray-900
                      h-[120px] md:h-[130px]
                      flex flex-col
                      shrink-0
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
                        {movie.title}
                      </h3>
                    </div>

                    {/* Bottom section - FIXED LAYOUT for all content types */}
                    <div className="mt-auto">
                      {/* First row - metadata with truncation */}
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <div className="flex items-center gap-0.5 truncate max-w-[100px] md:max-w-[120px]">
                          <span className="drop-shadow-sm whitespace-nowrap">{movie.releaseYear}</span>

                          {/* Show category if available */}
                          {movie.category?.name && (
                            <>
                              <span className="mx-0.5 drop-shadow-sm">·</span>
                              <span className="font-medium drop-shadow-sm truncate">{movie.category.name}</span>
                            </>
                          )}
                        </div>

                      </div>

                      {/* Bottom row - Duration display */}
                      <div className="flex items-center justify-between text-[10px] h-4">
                        <span className="text-gray-500 truncate max-w-[100px]">
                          {getDurationDisplay(movie) || (
                            <span className="text-gray-400">
                              {seriesType ? 'Series' : 'Movie'}
                            </span>
                          )}
                        </span>
                        {/* Empty placeholder for right side alignment */}
                        <span className="w-4"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Addon - For desktop only as per screenshot request */}
        {rightAddon && (
          <div className="hidden lg:flex flex-none items-start pt-1 pr-6 flex-col justify-start">
            {rightAddon}
          </div>
        )}
      </div>

      {/* Mobile View All link */}
      <div className="md:hidden mt-2 px-4">
        <Link
          href={href}
          className="flex items-center justify-center gap-1 text-xs font-medium text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          <span>View All {title}</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  )
}