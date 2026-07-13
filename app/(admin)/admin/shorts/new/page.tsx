export const dynamic = "force-dynamic"
import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models"
import { ShortForm } from "@/components/admin/short-form"

async function getCategories() {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return JSON.parse(JSON.stringify(categories))
}

export default async function NewShortPage() {
    const categories = await getCategories()

    return (
        <div className="py-6">
            <ShortForm categories={categories} />
        </div>
    )
}
