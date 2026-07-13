"use client"

import React from "react"
import Image from "next/image"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, User } from "lucide-react"
import Link from "next/link"

interface Review {
  _id: string
  user: {
    _id: string
    name: string
    avatar?: string
  } | null
  guestName?: string
  rating: number
  comment: string
  createdAt: string
}

interface ReviewSectionProps {
  movieId?: string
  seriesId?: string
  initialReviews: Review[]
}

export function ReviewSection({ movieId, seriesId, initialReviews }: ReviewSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.length < 10) {
      setError("Comment must be at least 10 characters")
      return
    }

    // If not logged in, require username
    if (!user && username.trim().length < 2) {
      setError("Please enter your name (at least 2 characters)")
      return
    }

    setIsSubmitting(true)

    try {
      const payload: any = {
        rating,
        comment,
        name: user ? user.name : username.trim(),
      }
      if (movieId) payload.movieId = movieId
      if (seriesId) payload.seriesId = seriesId

      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      // Add new review to list
      setReviews([data.review, ...reviews])
      setRating(0)
      setComment("")
      setUsername("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {/* Review Form */}
      <div className="bg-card rounded-xl p-6 border border-border mb-8">
        <form onSubmit={handleSubmit}>
          <h3 className="font-medium text-foreground mb-4">
            Write a Review
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Username input for guests */}
          {!user && (
            <div className="mb-4">
              <label htmlFor="username" className="text-sm text-muted-foreground mb-2 block">
                Your Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
                autoComplete="name"
              />
            </div>
          )}

          {/* Star Rating */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-7 w-7 ${star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                      }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label
              htmlFor="comment"
              className="text-sm text-muted-foreground mb-2 block"
            >
              Your Review
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              className="min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                  {review.user && review.user.avatar ? (
                    <Image
                      src={review.user.avatar || "/placeholder.svg"}
                      alt={review.user.name}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">
                      {review.user?.name || review.guestName || "Guest"}
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No reviews yet. Be the first to review this movie!</p>
        </div>
      )}
    </section>
  )
}
