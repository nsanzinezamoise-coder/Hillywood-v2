import mongoose from "mongoose"
import { connectToDatabase } from "@/lib/mongodb"
import { Short } from "@/lib/models"
import { notFound } from "next/navigation"
import VideoSlider from "@/components/video-slider"
import type { Metadata } from "next"

async function getShort(slug: string) {
  try {
    await connectToDatabase()
    const isObjectId = mongoose.Types.ObjectId.isValid(slug)
    const query = isObjectId ? { _id: slug, approvalStatus: "approved" } : { slug, approvalStatus: "approved" }

    const short = await Short.findOne(query)
      .populate("category", "name slug")
      .lean()

    if (!short) return null

    // Get related shorts
    const relatedShorts = await Short.find({
      _id: { $ne: short._id },
      approvalStatus: "approved"
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Format the current short
    const formattedShort = formatShort(short)

    // Format related shorts
    const formattedRelated = relatedShorts.map(s => formatShort(s))

    return JSON.parse(JSON.stringify({
      current: formattedShort,
      related: formattedRelated
    }))
  } catch (error) {
    console.error("Failed to fetch short:", error)
    return null
  }
}

function formatShort(short: any) {
  return {
    id: short._id.toString(),
    url: short.videoUrl || '',
    title: short.title || 'Untitled',
    description: short.description || short.title || 'No description',
    likes: short.likes ? formatNumber(short.likes) : '0',
    comments: short.comments ? formatNumber(short.comments.length) : '0',
    shares: short.shares ? formatNumber(short.shares) : '0',
    saves: short.saves ? formatNumber(short.saves) : '0',
    user: short.title || 'Creator',
    userAvatar: (short.title || 'C').charAt(0).toUpperCase(),
    sound: `${short.category?.name || 'Original'} Sound`,
    soundIcon: '🎵',
    isLiked: false,
    hasLiked: false,
    hasDisliked: false,
    userComments: [],
    slug: short.slug,
    category: short.category,
    tags: short.tags || [],
  }
}

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const { slug } = resolvedParams
  const data = await getShort(slug)

  if (!data?.current) {
    return {
      title: "Short Not Found",
    }
  }

  const short = data.current
  return {
    title: `${short.title} | Short Film`,
    description: short.description,
    openGraph: {
      type: "video.other",
      title: short.title,
      description: short.description,
      // If we had a thumbnail, we'd put it here
    },
  }
}


export default async function ShortDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const data = await getShort(slug)

  if (!data) {
    notFound()
  }

  // Combine current short with related shorts for the feed
  const allVideos = [data.current, ...data.related]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Video Slider */}
      <div className="pt-[70px] md:pt-[84px] pb-[6px]" style={{ height: '100vh' }}>
        <div className="h-full">
          <VideoSlider videos={allVideos} initialVideoId={data.current.id} />
        </div>
      </div>
    </div>
  )
}