// app/page.tsx
export const dynamic = "force-dynamic"

import { Suspense } from "react"
import type { Metadata } from "next"
import Script from "next/script"

import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Series } from "@/lib/models"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import AdUnit from "@/components/AdUnit"

export const metadata: Metadata = {
  title: "Hillywood Rwanda",
  description: "Watch the best Rwandan movies and series",
}

export default async function HomePage() {
  await connectToDatabase()

  const [newReleaseMovies, trending, series, allMoviesAndSeries, heroSeries] = await Promise.all([
    Movie.find({ approvalStatus: "approved" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Movie.find({ approvalStatus: "approved" })
      .sort({ views: -1, rating: -1 })
      .limit(10)
      .lean(),
    Series.find({ approvalStatus: "approved" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Movie.find({ approvalStatus: "approved" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    // Fetch latest series for hero section
    Series.find({ approvalStatus: "approved" })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ])

  // Combine movies and series for hero section, sorted by newest first
  const heroMovies = newReleaseMovies.map((m: any) => ({ ...m, _type: 'movie' }))
  const heroSeriesItems = heroSeries.map((s: any) => ({
    ...s,
    _type: 'series',
    backdrop: s.backdrop || s.poster, // Series may not have backdrop, fallback to poster
  }))
  const combinedHero = [...heroMovies, ...heroSeriesItems]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const displayNewReleases = JSON.parse(JSON.stringify(newReleaseMovies))
  const displayTrending = JSON.parse(JSON.stringify(trending))
  const displaySeries = JSON.parse(JSON.stringify(series))
  const displayAll = JSON.parse(JSON.stringify(allMoviesAndSeries))
  const displayHero = JSON.parse(JSON.stringify(combinedHero))

  return (
    <div className="flex flex-col min-h-screen">
      <Script 
        src="https://pl29060418.profitablecpmratenetwork.com/58/bb/89/58bb89bfb91fe64fb463ddc8e9545674.js"
        strategy="afterInteractive"
      />
      {/* Hero Section with Newest Releases - Movies & Series combined */}
      <HeroSection
        featuredMovies={displayHero}
        maxMovies={4}
        autoSlideInterval={8000}
        logoPosition="under-navbar"
      />

      {/* Ad unit */}
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse" />}>
        <AdUnit slot="4385516490" className="my-4" />
      </Suspense>

      <div className="container mx-auto px-4 py-8 space-y-12">
        <CategorySection
          title="Trending Now"
          slug="trending"
          movies={displayTrending}
          viewAllHref="/movies?sort=trending"
          emptyMessage="No trending movies or series available right now."
        />

        <CategorySection
          title="New Releases"
          slug="new-releases"
          movies={displayNewReleases}
          viewAllHref="/movies?sort=newest"
          emptyMessage="No new releases found at the moment."
        />

        <CategorySection
          title="Seasons & Series"
          slug="series"
          movies={displaySeries}
          viewAllHref="/series"
          emptyMessage="No series available yet."
        />

        <CategorySection
          title="All Movies and Seasons"
          slug="all"
          movies={displayAll}
          viewAllHref="/movies"
          emptyMessage="No movies or seasons found in our library."
        />
      </div>
    </div>
  )
}