import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Review, User, Movie, Series } from "@/lib/models"
import { verifySession } from "@/lib/session"


export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    const { movieId, seriesId, rating, comment, name } = await request.json()

    // Accept either movieId or seriesId
    if ((!movieId && !seriesId) || !rating || !comment) {
      return NextResponse.json(
        { error: "Movie or Series ID, rating, and comment are required" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Determine review target field
    const reviewTargetField = movieId ? { movie: movieId } : { series: seriesId }

    // If logged in, use userId, else use guest name
    let review
    if (session) {
      // Check if user already reviewed this movie/series
      const existingReview = await Review.findOne({
        user: session.userId,
        ...reviewTargetField,
      })
      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this title" },
          { status: 400 }
        )
      }
      review = await Review.create({
        user: session.userId,
        ...reviewTargetField,
        rating,
        comment,
      })
    } else {
      // Guest review: require name
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name is required for guest reviews (at least 2 characters)" },
          { status: 400 }
        )
      }
      // Store guest reviews with user=null and save name in a new field
      review = await Review.create({
        user: null,
        guestName: name.trim(),
        ...reviewTargetField,
        rating,
        comment,
      })
    }

    // Populate user info
    const populatedReview = await Review.findById(review._id)
      .populate("user", "name avatar")
      .lean()

    return NextResponse.json({
      success: true,
      review: populatedReview,
    })
  } catch (error) {
    console.error("Create review error:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()
    
    // Check if user is admin
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const reviewId = new URL(request.url).searchParams.get("reviewId")
    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 }
      )
    }

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

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    
    // Check if user is admin
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      )
    }

    const reviewId = new URL(request.url).searchParams.get("reviewId")
    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 }
      )
    }

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