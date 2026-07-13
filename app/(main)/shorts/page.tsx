import { connectToDatabase } from "@/lib/mongodb"
import { Short } from "@/lib/models"
import VideoSlider from "@/components/video-slider"

export const metadata = {
  title: "Watch Short Films",
  description:
    "Watch and discover amazing Rwandan short films, quick bites of entertainment, and creative cinematic snippets.",
}

async function getShorts() {
  try {
    await connectToDatabase()

    console.log("Fetching shorts from database...")

    // Fetch shorts from MongoDB
    let shorts = await Short.find({ approvalStatus: "approved" })
      .populate("category", "name slug")
      .lean()

    // Shuffle in memory for randomization
    shorts = shorts.sort(() => Math.random() - 0.5)

    console.log(`Found and shuffled ${shorts.length} shorts`)

    // If no shorts found, return empty array
    if (!shorts || shorts.length === 0) {
      console.log("No shorts found in database")
      return []
    }

    // Transform MongoDB data to match VideoSlider format
    const formattedShorts = shorts.map((short: any) => {
      return {
        id: short._id.toString(),
        url: short.videoUrl || '',
        title: short.title || 'Untitled',
        description: short.title || 'No description',
        likes: short.likes ? formatNumber(short.likes) : '0',
        comments: short.comments ? formatNumber(short.comments.length) : '0',
        shares: short.shares ? formatNumber(short.shares) : '0',
        saves: short.saves ? formatNumber(short.saves) : '0',
        user: short.title || 'Creator', // Changed from director/producer to title
        userAvatar: (short.title || 'C').charAt(0).toUpperCase(), // Changed to use title's first letter
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
    })

    console.log(`Formatted ${formattedShorts.length} shorts for display`)
    return JSON.parse(JSON.stringify(formattedShorts))
  } catch (error) {
    console.error("Failed to fetch shorts:", error)
    return []
  }
}

// Helper function to format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default async function ShortsPage() {
  const shorts = await getShorts()


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}

      {/* Video Slider */}
      <div className="pt-[70px] md:pt-[84px] pb-[6px]" style={{ height: '100vh' }}>
        <div className="h-full">
          <VideoSlider videos={shorts} />
        </div>
      </div>
    </div>
  )
}