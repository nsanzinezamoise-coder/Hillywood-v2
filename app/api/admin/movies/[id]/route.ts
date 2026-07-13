import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Category, Review } from "@/lib/models"
import { requireAdmin } from "@/lib/session"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await connectToDatabase()

    const movie = await Movie.findById(id)
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // Delete associated reviews
    await Review.deleteMany({ movie: id })

    // Update category count
    if (movie.category) {
      await Category.findByIdAndUpdate(movie.category, {
        $inc: { movieCount: -1 },
      })
    }

    // Delete movie
    await Movie.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Movie deleted successfully",
    })
  } catch (error) {
    console.error("Delete movie error:", error)
    return NextResponse.json(
      { error: "Failed to delete movie" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    await connectToDatabase()

    const movie = await Movie.findById(id)
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 })
    }

    // Update movie
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      {
        ...body,
        slug: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      movie: updatedMovie,
    })
  } catch (error) {
    console.error("Update movie error:", error)
    return NextResponse.json(
      { error: "Failed to update movie" },
      { status: 500 }
    )
  }
}
