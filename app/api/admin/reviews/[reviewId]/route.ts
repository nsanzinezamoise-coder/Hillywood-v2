import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Review, Movie, Series } from "@/lib/models"
import { verifySession } from "@/lib/session"

interface Params {
  params: Promise<{ reviewId: string }>
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await verifySession()
    
    // Check if user is admin
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { reviewId } = await params

    await connectToDatabase()

    // Find the review first to get movie/series info
    const review = await Review.findById(reviewId)
    
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    // Store movie/series ID before deleting
    const movieId = review.movie
    const seriesId = review.series

    // Delete the review
    await Review.findByIdAndDelete(reviewId)

    // Update movie rating if this was a movie review
    if (movieId) {
      const movieReviews = await Review.find({ movie: movieId }).select("rating")
      const totalRating = movieReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = movieReviews.length > 0 ? totalRating / movieReviews.length : 0
      
      await Movie.findByIdAndUpdate(movieId, {
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: movieReviews.length,
      })
    }

    // Update series rating if this was a series review
    if (seriesId) {
      const seriesReviews = await Review.find({ series: seriesId }).select("rating")
      const totalRating = seriesReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = seriesReviews.length > 0 ? totalRating / seriesReviews.length : 0
      
      await Series.findByIdAndUpdate(seriesId, {
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: seriesReviews.length,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully"
    })
  } catch (error) {
    console.error("Delete review error:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await verifySession()
    
    // Check if user is admin
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const { reviewId } = await params

    await connectToDatabase()

    const review = await Review.findById(reviewId)
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'movie',
        select: 'title slug poster description'
      })
      .populate({
        path: 'series',
        select: 'title slug poster description'
      })
      .lean()

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: review
    })
  } catch (error) {
    console.error("Fetch review error:", error)
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    )
  }
}