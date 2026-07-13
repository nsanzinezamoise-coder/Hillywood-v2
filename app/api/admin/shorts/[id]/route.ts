import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Short, Category } from "@/lib/models"
import { requireAdmin } from "@/lib/session"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params
        const body = await request.json()

        const {
            title,
            videoUrl,
            category,
            featured,
            tags,
        } = body

        if (!title || !videoUrl || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        if (category) {
            const categoryDoc = await Category.findById(category)
            if (!categoryDoc) {
                return NextResponse.json(
                    { error: "Invalid category" },
                    { status: 400 }
                )
            }
        }

        const short = await Short.findByIdAndUpdate(
            id,
            {
                title,
                videoUrl,
                category,
                featured,
                tags,
            },
            { new: true }
        )

        if (!short) {
            return NextResponse.json(
                { error: "Short film not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            short,
        })
    } catch (error) {
        console.error("Update short error:", error)
        return NextResponse.json(
            { error: "Failed to update short film" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        await connectToDatabase()

        const short = await Short.findById(id)
        if (!short) {
            return NextResponse.json(
                { error: "Short film not found" },
                { status: 404 }
            )
        }

        await Short.findByIdAndDelete(id)

        return NextResponse.json({
            success: true,
            message: "Short film deleted successfully"
        })

    } catch (error) {
        console.error("Delete short error:", error)
        return NextResponse.json(
            { error: "Failed to delete short film" },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        await connectToDatabase()

        const short = await Short.findById(id).lean()

        if (!short) {
            return NextResponse.json(
                { error: "Short film not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(short)

    } catch (error) {
        console.error("Get short error:", error)
        return NextResponse.json(
            { error: "Failed to fetch short film" },
            { status: 500 }
        )
    }
}
