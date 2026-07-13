import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Review } from "@/lib/models"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await connectToDatabase()

    const movie = await Movie.findOne({ slug, approvalStatus: "approved" })
      .populate("category", "name slug")
      .lean()

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // Get reviews
    const reviews = await Review.find({ movie: movie._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get related movies (same category)
    const relatedMovies = await Movie.find({
      _id: { $ne: movie._id },
      category: movie.category,
      approvalStatus: "approved",
    })
      .populate("category", "name slug")
      .sort({ rating: -1 })
      .limit(6)
      .lean()

    return NextResponse.json({
      movie,
      reviews,
      relatedMovies,
    })
  } catch (error) {
    console.error("Get movie error:", error)
    return NextResponse.json(
      { error: "Failed to fetch movie" },
      { status: 500 }
    )
  }
}
