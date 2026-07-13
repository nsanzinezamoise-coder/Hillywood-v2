export const dynamic = "force-dynamic"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { Short, Category } from "@/lib/models"
import { ShortForm } from "@/components/admin/short-form"

interface Props {
    params: Promise<{ id: string }>
}

async function getShort(id: string) {
    await connectToDatabase()
    const short = await Short.findById(id).lean()
    if (!short) return null
    return JSON.parse(JSON.stringify(short))
}

async function getCategories() {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return JSON.parse(JSON.stringify(categories))
}

export default async function EditShortPage({ params }: Props) {
    const { id } = await params
    const [short, categories] = await Promise.all([
        getShort(id),
        getCategories(),
    ])

    if (!short) {
        notFound()
    }

    return (
        <div className="py-6">
            <ShortForm categories={categories} short={short} />
        </div>
    )
}
