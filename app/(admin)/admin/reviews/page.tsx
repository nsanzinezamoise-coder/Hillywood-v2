import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import { Review } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { AdminReviewsList } from "@/components/admin/admin-reviews-list"
import { MessageSquare } from "lucide-react"

interface Props {
    searchParams: Promise<{ 
      type?: string 
      page?: string 
      search?: string 
      sort?: string 
      minRating?: string 
    }>
}

async function getReviews(
    type?: string, 
    page: number = 1, 
    search?: string,
    sort?: string,
    minRating?: string
) {
    await connectToDatabase()

    const query: Record<string, unknown> = {}
    
    // Filter by type (movie or series reviews)
    if (type === "movie") {
        query.movie = { $ne: null }
    } else if (type === "series") {
        query.series = { $ne: null }
    }
    
    // Filter by minimum rating
    if (minRating && !isNaN(parseInt(minRating))) {
        query.rating = { $gte: parseInt(minRating) }
    }
    
    // Search in comment or guest name
    if (search) {
        query.$or = [
            { comment: { $regex: search, $options: "i" } },
            { guestName: { $regex: search, $options: "i" } }
        ]
    }

    const limit = 20
    const skip = (page - 1) * limit

    // Determine sort order
    let sortOption = {}
    switch (sort) {
        case "newest":
            sortOption = { createdAt: -1 }
            break
        case "oldest":
            sortOption = { createdAt: 1 }
            break
        case "highest":
            sortOption = { rating: -1 }
            break
        case "lowest":
            sortOption = { rating: 1 }
            break
        default:
            sortOption = { createdAt: -1 }
    }

    const [reviews, total] = await Promise.all([
        Review.find(query)
            .populate({
                path: 'user',
                select: 'name email avatar'
            })
            .populate({
                path: 'movie',
                select: 'title slug poster'
            })
            .populate({
                path: 'series',
                select: 'title slug poster'
            })
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),
        Review.countDocuments(query),
    ])

    // Get statistics
    const stats = await Review.aggregate([
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                movieReviews: {
                    $sum: { $cond: [{ $ne: ["$movie", null] }, 1, 0] }
                },
                seriesReviews: {
                    $sum: { $cond: [{ $ne: ["$series", null] }, 1, 0] }
                },
                userReviews: {
                    $sum: { $cond: [{ $ne: ["$user", null] }, 1, 0] }
                },
                guestReviews: {
                    $sum: { $cond: [{ $eq: ["$user", null] }, 1, 0] }
                }
            }
        }
    ])

    return {
        reviews: JSON.parse(JSON.stringify(reviews)),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        stats: stats[0] || {
            averageRating: 0,
            totalReviews: 0,
            movieReviews: 0,
            seriesReviews: 0,
            userReviews: 0,
            guestReviews: 0
        }
    }
}

export default async function AdminReviewsPage({ searchParams }: Props) {
    const { type, page, search, sort, minRating } = await searchParams
    const data = await getReviews(
        type, 
        parseInt(page || "1"), 
        search,
        sort,
        minRating
    )

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        Reviews
                    </h1>
                    <p className="text-muted-foreground">
                        Manage all user and guest reviews
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/admin/reviews/analytics">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Analytics
                    </Link>
                </Button>
            </div>

            <AdminReviewsList
                reviews={data.reviews}
                pagination={data.pagination}
                stats={data.stats}
                currentType={type || "all"}
                currentSort={sort || "newest"}
                currentSearch={search || ""}
                currentMinRating={minRating || ""}
            />
        </div>
    )
}