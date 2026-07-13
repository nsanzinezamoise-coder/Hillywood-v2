export const dynamic = "force-dynamic"
import { MetadataRoute } from 'next'
import { connectToDatabase } from '@/lib/mongodb'
import { Movie, Series, Short } from '@/lib/models'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hillywood.netlify.app'

    try {
        await connectToDatabase()

        // 1. Static Pages
        const staticRoutes = [
            '',
            '/movies',
            '/series',
            '/shorts',
            '/pricing',
            '/faq',
            '/contact',
            '/privacy',
            '/terms',
            '/cookies',
            '/help',
        ].map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: route === '' ? 1.0 : 0.8,
        }))

        // 2. Dynamic Movie Pages
        const movies = await Movie.find({ approvalStatus: 'approved' }).select('slug updatedAt').lean()
        const movieRoutes = movies.map((movie: any) => ({
            url: `${baseUrl}/movie/${movie.slug}`,
            lastModified: movie.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        // 3. Dynamic Series Pages
        const series = await Series.find({ approvalStatus: 'approved' }).select('slug updatedAt').lean()
        const seriesRoutes = series.map((serie: any) => ({
            url: `${baseUrl}/serie/${serie.slug}`,
            lastModified: serie.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        // 4. Dynamic Shorts Pages
        const shorts = await Short.find({ approvalStatus: 'approved' }).select('slug updatedAt').lean()
        const shortsRoutes = shorts.map((short: any) => ({
            url: `${baseUrl}/shorts/${short.slug}`,
            lastModified: short.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))

        return [...staticRoutes, ...movieRoutes, ...seriesRoutes, ...shortsRoutes]
    } catch (error) {
        console.error('Sitemap generation error:', error)
        // Fallback to minimal sitemap if database connection fails
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
        ]
    }
}
