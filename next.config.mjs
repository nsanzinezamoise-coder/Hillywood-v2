/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Gzip/Brotli compression for all responses
  compress: true,

  // Remove X-Powered-By header (security + minor payload win)
  poweredByHeader: false,

  // Keep mongoose out of client/edge bundles — it's server-only
  serverExternalPackages: ["mongoose"],

  images: {
    formats: ["image/avif", "image/webp"],
    // Cache images for 24 hours at the CDN level
    minimumCacheTTL: 86400,
    // Responsive breakpoints — avoids unnecessarily large image fetches
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig

