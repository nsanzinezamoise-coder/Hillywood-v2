// components/video-player.tsx
"use client"

import { useState, useRef, useEffect } from 'react'

interface VideoPlayerProps {
  src: string
  title: string
  poster?: string
  autoplay?: boolean
}

export function VideoPlayer({
  src,
  title,
  poster,
  autoplay = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    const handleCanPlay = () => {
      if (autoplay) {
        video.muted = true
        video.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {
          setIsPlaying(false)
        })
      }
    }

    const handleError = () => {
      setHasError(true)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    // Only load metadata — do NOT preload the full video
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [src, autoplay])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay blocked — user interaction required
      })
    }
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold mb-2">Video Error</h3>
        <p className="text-gray-400 mb-4 text-center">
          Could not load the video. The file might be corrupted or in an unsupported format.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Try Opening Directly
        </a>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Native HTML5 Video — preload="none" so no bytes are fetched until user plays */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        playsInline
        controls
        preload="none"
        crossOrigin="anonymous"
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        Your browser does not support the video tag.
      </video>

      {/* Custom play button overlay — shown only when paused */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center hover:bg-red-700 transition-transform hover:scale-110">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}