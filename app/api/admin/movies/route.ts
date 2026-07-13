import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Category } from "@/lib/models"
import { requireRole } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin", "moderator"])

    const body = await request.json()
    const {
      title,
      description,
      synopsis,
      poster,
      backdrop,
      trailer,
      videoUrl,
      downloadUrl,
      duration,
      releaseYear,
      languages,
      subtitles,
      category,
      cast,
      director,
      producer,
      featured,
      tags,
    } = body

    // Validate required fields
    if (
      !title ||
      !description ||
      !poster ||
      !videoUrl ||
      !duration ||
      !releaseYear ||
      !languages?.length ||
      !category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Verify category exists
    const categoryDoc = await Category.findById(category)
    if (!categoryDoc) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      )
    }

    // Create movie
    const movie = await Movie.create({
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      description,
      synopsis: synopsis || "",
      poster,
      backdrop: backdrop || "",
      trailer: trailer || "",
      videoUrl,
      downloadUrl: downloadUrl || "",
      duration,
      releaseYear,
      languages,
      subtitles: subtitles || [],
      category,
      cast: cast || [],
      director: director || "",
      producer: producer || "",
      featured: featured || false,
      tags: tags || [],
      approvalStatus: "pending",
    })

    // Update category movie count
    await Category.findByIdAndUpdate(category, {
      $inc: { movieCount: 1 },
    })

    return NextResponse.json({
      success: true,
      movie,
    })
  } catch (error: any) {
    console.error("Create movie error:", error)

    // Provide more specific error message if it's a Mongoose validation error
    const errorMessage = error.name === "ValidationError"
      ? Object.values(error.errors).map((err: any) => err.message).join(", ")
      : "Failed to create movie"

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
