"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Info, ChevronLeft, ChevronRight, Star, Clock, Calendar } from "lucide-react"

interface FeaturedMovie {
  _id: string
  title: string
  slug: string
  description: string
  backdrop: string
  poster: string
  releaseYear: number
  duration?: number // Made optional for series
  rating: number
  category?: {
    name: string
  }
  isTrending?: boolean
  isNewRelease?: boolean
  // Series specific fields
  seasons?: number
  episodes?: number
}

interface HeroSectionProps {
  featuredMovies: FeaturedMovie[]
  autoSlideInterval?: number
  logoPosition?: "under-navbar" | "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
  maxMovies?: number
  navbarHeight?: number // Add navbarHeight prop
}

export function HeroSection({
  featuredMovies,
  autoSlideInterval = 8000,
  logoPosition = "under-navbar",
  maxMovies = 4,
  navbarHeight = 64 // Default navbar height in pixels (adjust based on your navbar)
}: HeroSectionProps) {
  // Limit the movies to maxMovies
  const limitedMovies = featuredMovies.slice(0, maxMovies);

  const [activeIndex, setActiveIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isContentTransitioning, setIsContentTransitioning] = useState(false)

  const activeMovie = limitedMovies[activeIndex]

  // Helper function to check if content is a series
  const isSeries = (movie: FeaturedMovie): boolean => {
    return (movie.seasons !== undefined && movie.seasons > 0) ||
      (movie.episodes !== undefined && movie.episodes > 0);
  }

  // Helper function to get the watch URL
  const getWatchUrl = (movie: FeaturedMovie): string => {
    if (isSeries(movie)) {
      // For series, go to series detail page which will show episodes
      return `/serie/${movie.slug}`;
    }
    // For movies, go to movie detail page
    return `/movie/${movie.slug}`;
  }

  // Helper function to get the info/detail URL
  const getInfoUrl = (movie: FeaturedMovie): string => {
    if (isSeries(movie)) {
      return `/serie/${movie.slug}`;
    }
    return `/movie/${movie.slug}`;
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index < 0 || index >= limitedMovies.length) return
    setIsTransitioning(true)
    setIsContentTransitioning(true)
    setActiveIndex(index)
    setIsAutoPlaying(false)

    setTimeout(() => {
      setIsTransitioning(false)
      setTimeout(() => {
        setIsContentTransitioning(false)
      }, 200)
      setTimeout(() => setIsAutoPlaying(true), 10000)
    }, 1000)
  }, [isTransitioning, limitedMovies.length])

  const goToNext = useCallback(() => {
    goToSlide((activeIndex + 1) % limitedMovies.length)
  }, [activeIndex, goToSlide, limitedMovies.length])

  const goToPrevious = useCallback(() => {
    goToSlide(activeIndex === 0 ? limitedMovies.length - 1 : activeIndex - 1)
  }, [activeIndex, goToSlide, limitedMovies.length])

  useEffect(() => {
    if (!isAutoPlaying || limitedMovies.length <= 1) return

    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNext()
      }
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, autoSlideInterval, goToNext, limitedMovies.length, isTransitioning])

  const handleCardClick = (index: number) => {
    goToSlide(index)
  }

  const getPositionClasses = () => {
    switch (logoPosition) {
      case "under-navbar":
        return `top-[${navbarHeight + 16}px] left-8 md:top-[${navbarHeight + 32}px] md:left-12`;
      case "top-left":
        return `top-[${navbarHeight + 8}px] left-4`;
      case "top-center":
        return `top-[${navbarHeight + 8}px] left-1/2 -translate-x-1/2`;
      case "top-right":
        return `top-[${navbarHeight + 8}px] right-4`;
      case "bottom-left":
        return "bottom-32 left-4";
      case "bottom-center":
        return "bottom-32 left-1/2 -translate-x-1/2";
      case "bottom-right":
        return "bottom-32 right-4";
      default:
        return `top-[${navbarHeight + 16}px] left-8 md:top-[${navbarHeight + 32}px] md:left-12`;
    }
  }

  // Calculate padding top based on navbar height
  const paddingTopStyle = {
    paddingTop: `${navbarHeight}px`
  };

  if (!activeMovie || limitedMovies.length === 0) {
    return (
      <section className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center bg-gray-900/10 dark:bg-black/40 overflow-hidden" style={paddingTopStyle}>
        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        <div className="relative z-10 text-center px-4">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-red-600 opacity-50" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to RWANDA CINEMA
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Discover the best of Rwandan cinema. No featured releases at the moment, but stay tuned!
          </p>
        </div>
      </section>
    )
  }

  const isActiveSeries = isSeries(activeMovie);
  const watchUrl = getWatchUrl(activeMovie);
  const infoUrl = getInfoUrl(activeMovie);

  return (
    <section className="relative w-full min-h-screen md:min-h-[75vh] overflow-visible md:overflow-hidden" style={paddingTopStyle}>
      {/* Background Slides with enhanced transitions */}
      <div className="absolute inset-0" style={{ top: `${navbarHeight}px` }}>
        {limitedMovies.map((movie, index) => (
          <div
            key={movie._id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
          >
            <Image
              src={movie.backdrop || movie.poster}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-1000 ease-in-out"
              priority={index === activeIndex}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:from-background/60 md:via-transparent md:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 md:from-black/30 md:via-transparent md:to-background/10" />
          </div>
        ))}
      </div>

      {/* Logo - Positioned under navbar by default */}
      {/* <div className={`absolute ${getPositionClasses()} z-20 transition-all duration-500`} style={{ top: `${navbarHeight + 16}px` }}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-red-700">
            <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-current" />
          </div>
          <span className="text-white font-bold text-lg md:text-xl lg:text-2xl tracking-wide drop-shadow-lg">
            {isActiveSeries ? "NEW SERIES" : "NEW MOVIES"}
          </span>
        </div>
      </div> */}

      {/* Content with enhanced transitions */}
      <div className="relative z-10 container mx-auto px-4 h-full min-h-screen md:min-h-[75vh] flex flex-col justify-end pb-8 md:pb-12 overflow-visible">
        {/* Mobile Top Section - Adjusted for navbar */}
        <div className="lg:hidden mb-4" style={{ marginTop: `${navbarHeight - 20}px` }}>
          <div className="flex flex-col items-start">
            {/* Title for Mobile */}
            <h1 className={`font-bold text-3xl md:text-4xl text-white mb-3 text-left text-shadow-lg px-2 transition-all duration-700 uppercase ${isContentTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}>
              {activeMovie.title}
            </h1>

            {/* Meta Info for Mobile */}
            <div className={`flex flex-wrap items-center justify-start gap-2 text-white/80 mb-3 transition-all duration-700 delay-100 ${isContentTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}>
            
              
            
            </div>

            {/* Description for Mobile */}
            <p className={`text-white/90 text-base sm:text-lg mb-4 text-shadow max-w-2xl leading-relaxed px-2 text-left transition-all duration-700 delay-200 ${isContentTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
              }`}>
              {activeMovie.description}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-end w-full">
          {/* Left Column - Movie Info (Desktop) */}
          <div className="hidden lg:block space-y-4">
            {/* Badges with transition */}
            <div className={`flex items-center gap-3 transition-all duration-700 ${isContentTransitioning ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
              }`}>
              {activeMovie.isTrending && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white flex items-center gap-1">
                  🔥 Trending Now
                </span>
              )}
              {activeMovie.isNewRelease && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                  New Release
                </span>
              )}
              {isActiveSeries ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                  📺 Series
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                  🎬 Movie
                </span>
              )}
            </div>

            {/* Title (Desktop) */}
            <h1 className={`font-bold text-3xl md:text-5xl text-white mb-3 text-shadow-lg transition-all duration-700 uppercase ${isContentTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
              }`}>
              {activeMovie.title}
            </h1>

            {/* Meta Info (Desktop) */}
            <div className={`flex flex-wrap items-center gap-3 text-white/80 transition-all duration-700 delay-100 ${isContentTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
              }`}>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">{activeMovie.releaseYear}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                {activeMovie.category?.name || (isActiveSeries ? "Series" : "Movie")}
              </span>
              {!isActiveSeries && activeMovie.duration && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDuration(activeMovie.duration)}
                  </span>
                </>
              )}
              {isActiveSeries && activeMovie.seasons && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="flex items-center gap-1.5">
                    📺 {activeMovie.seasons} {activeMovie.seasons === 1 ? 'Season' : 'Seasons'}
                  </span>
                  {activeMovie.episodes && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <span>{activeMovie.episodes} Episodes</span>
                    </>
                  )}
                </>
              )}

              {activeMovie.rating > 0 && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 rounded-md">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-yellow-400">{activeMovie.rating.toFixed(1)}</span>
                  </span>
                </>
              )}

            </div>

            {/* Description */}
            <p className={`text-white/80 text-sm md:text-base mb-4 line-clamp-2 md:line-clamp-3 text-shadow max-w-xl transition-all duration-700 delay-200 ${isContentTransitioning ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
              }`}>
              {activeMovie.description}
            </p>

            {/* Action Buttons */}
            <div className={`flex flex-wrap gap-3 transition-all duration-700 delay-300 ${isContentTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}>
              <Link href={watchUrl}>
                <Button size="lg" className="gap-2 px-5 md:px-6 text-base bg-red-600 hover:bg-red-700 text-white transition-transform duration-300 hover:scale-105">
                  <Play className="w-4 h-4 fill-current" />
                  {isActiveSeries ? 'Watch Series' : 'Watch Movie'}
                </Button>
              </Link>
              <Link href={infoUrl}>
                <Button size="lg" variant="outline" className="gap-2 px-5 md:px-6 text-base bg-black/50 backdrop-blur border-white/20 hover:bg-black/70 text-white transition-transform duration-300 hover:scale-105">
                  <Info className="w-4 h-4" />
                  More Info
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Thumbnail Cards */}
          {limitedMovies.length > 1 && (
            <div className="relative">
              {/* Desktop Thumbnails */}
              <div className="hidden lg:block relative">
                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 hover:scale-110 shadow-sm"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/30 flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 hover:scale-110 shadow-sm"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Thumbnails Grid */}
                <div className="flex justify-center gap-3 px-10 pt-2">
                  {limitedMovies.map((movie, index) => {
                    const isActive = index === activeIndex;
                    const isMovieSeries = isSeries(movie);
                    return (
                      <div
                        key={movie._id}
                        onClick={() => handleCardClick(index)}
                        className={`cursor-pointer transition-all duration-700 ease-out w-32 lg:w-36 xl:w-40 ${isActive
                          ? "scale-125 opacity-100 z-20 ring-1 ring-primary ring-offset-1 ring-offset-background dark:ring-offset-black/70 rounded-xl shadow-2xl"
                          : "scale-100 opacity-100 hover:opacity-95 hover:scale-105 hover:z-10"
                          }`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleCardClick(index)}
                        aria-label={`Select ${movie.title}`}
                      >
                        {/* Thumbnail Image */}
                        <div className={`relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-xl group transition-all duration-700 ${isActive ? "ring-1 ring-primary" : "border border-border/50"
                          }`}>
                          <Image
                            src={movie.poster}
                            alt={movie.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="160px"
                            priority={isActive}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/70 dark:from-black/70 via-transparent to-transparent transition-opacity duration-700" />
                          {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transition-all duration-500" />
                          )}
                          {isMovieSeries ? (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                                SERIES
                              </span>
                            </div>
                          ) : (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                                MOVIE
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <p className="mt-2 text-xs font-medium text-white text-center line-clamp-1 transition-opacity duration-500 uppercase">
                          {movie.title}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-center gap-1 mt-0.5 text-[10px] text-white/70 transition-opacity duration-500">
                          <span>{movie.releaseYear}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
                          <span>{movie.category?.name || (isMovieSeries ? "Series" : "Movie")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Buttons - Moved up slightly */}
        <div className="lg:hidden mt-2 flex flex-col gap-3 overflow-visible"> {/* Added overflow-visible */}
          <div className={`flex justify-center gap-3 transition-all duration-700 delay-300 ${isContentTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}>
            <Link href={watchUrl} className="flex-1 max-w-xs">
              <Button size="lg" className="w-full gap-2 text-base bg-red-600 hover:bg-red-700 text-white transition-transform duration-300 hover:scale-105">
                <Play className="w-4 h-4 fill-current" />
                {isActiveSeries ? 'Watch Series' : 'Watch Movie'}
              </Button>
            </Link>
          </div>

          {/* Mobile Meta Info */}
          <div className={`flex flex-wrap items-center justify-start gap-2 text-white/70 text-sm mt-2 transition-all duration-700 delay-400 ${isContentTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}>
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-semibold text-sm">{activeMovie.releaseYear}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {isActiveSeries ? "📺" : "🎬"}
                <span className="text-sm">
                  {activeMovie.category?.name || (isActiveSeries ? "Series" : "Movie")}
                </span>
              </span>
          
                {isActiveSeries && activeMovie.seasons && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="flex items-center gap-1.5">
                  {activeMovie.seasons} {activeMovie.seasons === 1 ? 'Season' : 'Seasons'}
                  </span>
                  {activeMovie.episodes && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <span>{activeMovie.episodes} Episodes</span>
                    </>
                  )}
                </>
              )}
              {!isActiveSeries && activeMovie.duration && (
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm">{formatDuration(activeMovie.duration)}</span>
                </span>
              )}

{activeMovie.rating > 0 && (
  <>
    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
    <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/20 rounded-md">
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <span className="font-semibold text-yellow-400">{activeMovie.rating.toFixed(1)}</span>
    </span>
  </>
)}
          </div>

          {/* Mobile Thumbnails - Increased card size with proper spacing */}
          {limitedMovies.length > 1 && (
            <div className={`mt-4 transition-all duration-700 delay-500 overflow-visible ${isContentTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}>
              <h3 className="text-white/80 text-sm font-medium mb-3 px-1">More Videos</h3>
              <div className="flex items-center gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                {limitedMovies.map((movie, index) => {
                  const isActive = index === activeIndex;
                  const isMovieSeries = isSeries(movie);
                  return (
                    <div
                      key={movie._id}
                      onClick={() => handleCardClick(index)}
                      className={`flex-shrink-0 cursor-pointer transition-all duration-500 ${isActive
                        ? "scale-105 opacity-100"
                        : "scale-95 opacity-70 hover:opacity-90 hover:scale-100"
                        }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleCardClick(index)}
                      aria-label={`Select ${movie.title}`}
                    >
                      {/* Increased card size and ensured full visibility */}
                      <div className={`relative w-28 h-36 rounded-lg overflow-hidden shadow-lg transition-all duration-500 ${isActive ? "ring-2 ring-red-500" : ""
                        }`}>
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                        {/* Type Badge */}
                        <div className="absolute top-1 left-1 z-10">
                          <span className={`px-1 py-0.5 text-[10px] font-bold rounded ${isMovieSeries ? "bg-purple-600" : "bg-blue-600"
                            } text-white`}>
                            {isMovieSeries ? 'SERIES' : 'MOVIE'}
                          </span>
                        </div>
                        {/* Rating Badge if available */}
                        {movie.rating && (
                          <div className="absolute top-1 right-1 z-10">
                            <span className="flex items-center gap-0.5 px-1 py-0.5 bg-yellow-500/90 rounded text-[10px] font-bold text-black">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        {/* Active Indicator */}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                        )}
                      </div>
                      {/* Title - with proper spacing */}
                      <p className="mt-2 text-xs font-medium text-white/90 text-center line-clamp-1 max-w-28 uppercase">
                        {movie.title}
                      </p>
                      {/* Year for better context */}
                      <p className="text-[10px] text-white/60 text-center mt-0.5">
                        {movie.releaseYear}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar animation style */}
      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .text-shadow-lg {
          text-shadow: 4px 4px 8px rgba(0,0,0,0.7);
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}