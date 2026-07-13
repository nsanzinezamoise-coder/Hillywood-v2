import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Short } from "@/lib/models"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { action } = body // action: "like", "share", "save"

        if (!["like", "share", "save"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Increment the specific field
        const updateField = action === "like" ? "likes" : action === "share" ? "shares" : "saves"

        const short = await Short.findByIdAndUpdate(
            id,
            { $inc: { [updateField]: 1 } },
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
            count: short[updateField]
        })
    } catch (error) {
        console.error("Short interaction error:", error)
        return NextResponse.json(
            { error: "Failed to process interaction" },
            { status: 500 }
        )
    }
}
