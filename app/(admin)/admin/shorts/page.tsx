import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import { Short } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { AdminShortsList } from "@/components/admin/admin-shorts-list"
import { Plus } from "lucide-react"

interface Props {
    searchParams: Promise<{ status?: string; page?: string }>
}

async function getShorts(status?: string, page: number = 1) {
    await connectToDatabase()

    const query: Record<string, unknown> = {}
    if (status && status !== "all") {
        query.approvalStatus = status
    }

    const limit = 20
    const skip = (page - 1) * limit

    const [shorts, total] = await Promise.all([
        Short.find(query)
            .populate("category", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Short.countDocuments(query),
    ])

    return {
        shorts: JSON.parse(JSON.stringify(shorts)),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    }
}

export default async function AdminShortsPage({ searchParams }: Props) {
    const { status, page } = await searchParams
    const data = await getShorts(status, parseInt(page || "1"))

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        Short Films
                    </h1>
                    <p className="text-muted-foreground">
                        Manage all short films in the library
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/shorts/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Short Film
                    </Link>
                </Button>
            </div>

            <AdminShortsList
                shorts={data.shorts}
                pagination={data.pagination}
                currentStatus={status || "all"}
            />
        </div>
    )
}
