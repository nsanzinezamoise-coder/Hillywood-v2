import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hillywood.rw'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/profile/',
                '/login',
                '/signup',
                '/forgot-password',
                '/reset-password',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
