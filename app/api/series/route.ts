import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Series, Category } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const requestedLimit = parseInt(searchParams.get("limit") || "10")
    const limit = Math.min(20, Math.max(10, requestedLimit))
    const category = searchParams.get("category")
    const language = searchParams.get("language")
    const year = searchParams.get("year")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const sort = searchParams.get("sort") || "latest"

    // Base query: approved series only
    const query: Record<string, unknown> = {
      approvalStatus: "approved",
    }

    // Category filter
    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({ slug: category }).select("_id").lean()
      if (categoryDoc) {
        query.category = categoryDoc._id
      }
    }

    // Language filter (array field)
    if (language && language !== "all") {
      query.languages = language
    }

    // Year filter
    if (year && year !== "all") {
      query.releaseYear = parseInt(year)
    }

    // Featured series only
    if (featured === "true") {
      query.featured = true
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ]
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1>
    switch (sort) {
      case "latest":
        sortOptions = { createdAt: -1 }
        break
      case "newest":
        sortOptions = { releaseYear: -1, createdAt: -1 }
        break
      case "oldest":
        sortOptions = { releaseYear: 1, createdAt: 1 }
        break
      case "rating":
        sortOptions = { rating: -1, ratingCount: -1 }
        break
      case "views":
        sortOptions = { views: -1 }
        break
      case "title":
        sortOptions = { title: 1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    const skip = (page - 1) * limit

    const [series, total] = await Promise.all([
      Series.find(query)
        .populate("category", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Series.countDocuments(query),
    ])

    return NextResponse.json({
      series,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Get series error:", error)
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    )
  }
}