import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Series, Review } from "@/lib/models"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await connectToDatabase()

    // Find current series
    const series = await Series.findOne({
      slug,
      approvalStatus: "approved",
    })
      .populate("category", "name slug")
      .lean()

    if (!series) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      )
    }

    // Get reviews
    const reviews = await Review.find({ series: series._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // ---------------------------------------------------
    // CHECK FOR OTHER EPISODES (same base name)
    // Example:
    // hwarang-s1ep5
    // hwarang-s1ep11
    // ---------------------------------------------------

    // Extract base name before "-s"
    const baseName = slug.includes("-s")
      ? slug.split("-s")[0]
      : slug

    // Find all episodes that match same base name
    const episodes = await Series.find({
      slug: { $regex: `^${baseName}-s`, $options: "i" },
      approvalStatus: "approved",
    })
      .sort({ createdAt: 1 })
      .lean()

    let relatedSeries: any[] = []

    if (episodes.length > 1) {
      // Remove current episode from list
      relatedSeries = episodes.filter(
        (ep) => ep._id.toString() !== series._id.toString()
      )
    } else {
      // If no other episodes found → fallback to same category
      relatedSeries = await Series.find({
        _id: { $ne: series._id },
        category: series.category,
        approvalStatus: "approved",
      })
        .populate("category", "name slug")
        .sort({ rating: -1 })
        .limit(6)
        .lean()
    }

    return NextResponse.json({
      series,
      reviews,
      relatedSeries,
    })

  } catch (error) {
    console.error("Get series error:", error)
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    )
  }
}