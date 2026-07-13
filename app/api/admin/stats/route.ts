import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, User, Review, Category } from "@/lib/models"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const adminUser = await User.findById(session.userId)
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [
      totalMovies,
      publishedMovies,
      pendingMovies,
      totalUsers,
      activeUsers,
      premiumUsers,
      totalReviews,
      totalCategories,
    ] = await Promise.all([
      Movie.countDocuments(),
      Movie.countDocuments({ status: "published" }),
      Movie.countDocuments({ status: "pending" }),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ "subscription.tier": "premium" }),
      Review.countDocuments(),
      Category.countDocuments({ isActive: true }),
    ])

    // Get recent movies
    const recentMovies = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("categories", "name")

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")

    // Calculate total views (sum of all movie views)
    const viewsResult = await Movie.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ])
    const totalViews = viewsResult[0]?.totalViews || 0

    return NextResponse.json({
      stats: {
        movies: {
          total: totalMovies,
          published: publishedMovies,
          pending: pendingMovies,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          premium: premiumUsers,
        },
        reviews: totalReviews,
        categories: totalCategories,
        views: totalViews,
      },
      recentMovies,
      recentUsers,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
