import { Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Movie, Series, Short } from "@/lib/models";
import { MovieCard } from "@/components/movie-card";
import { SeriesCard } from "@/components/series-card";

interface SearchResult {
    _id: string;
    title: string;
    type: "movie" | "series" | "short";
    poster: string;
    releaseYear: number;
    link: string;
    rating?: number;
    downloadUrl?: string; // for movies/shorts
    downloadurl?: string; // for series
    seasons?: number;
    duration?: number;
    category?: {
        name: string;
    };
}

export const revalidate = 120

async function getSearchResults(query: string): Promise<SearchResult[]> {
    if (!query) return []
    await connectToDatabase()

    const searchRegex = { $regex: query, $options: "i" }
    const searchQuery = {
        approvalStatus: "approved",
        $or: [
            { title: searchRegex },
            { description: searchRegex },
            { tags: searchRegex },
        ],
    }

    const [movies, series, shorts] = await Promise.all([
        Movie.find(searchQuery).populate("category", "name").limit(10).lean(),
        Series.find(searchQuery).populate("category", "name").limit(10).lean(),
        Short.find(searchQuery).populate("category", "name").limit(10).lean(),
    ])

    return [
        ...movies.map((m: any) => ({ ...m, type: "movie" as const, link: `/movie/${m.slug}` })),
        ...series.map((s: any) => ({ ...s, type: "series" as const, link: `/serie/${s.slug}` })),
        ...shorts.map((s: any) => ({ ...s, type: "short" as const, link: `/shorts/${s.slug}` })),
    ]
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams
    const query = (q || "").trim()
    const results = await getSearchResults(query)

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <SearchIcon className="w-8 h-8 text-primary" />
                        Results for "{query}"
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Found {results.length} item{results.length !== 1 ? "s" : ""} across movies, series, and shorts.
                    </p>
                </div>

                {results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {results.map((item) =>
                            item.type === "series" ? (
                                <SeriesCard
                                    key={item._id}
                                    series={{
                                        _id: item._id,
                                        title: item.title,
                                        slug: item.link.split("/").pop() || "",
                                        poster: item.poster,
                                        releaseYear: item.releaseYear,
                                        rating: item.rating || 0,
                                        downloadurl: item.downloadurl,
                                        category: item.category
                                            ? { name: item.category.name, slug: "all" }
                                            : undefined,
                                    }}
                                />
                            ) : (
                                <MovieCard
                                    key={item._id}
                                    movie={{
                                        _id: item._id,
                                        title: item.title,
                                        slug: item.link.split("/").pop() || "",
                                        poster: item.poster,
                                        releaseYear: item.releaseYear,
                                        rating: item.rating || 0,
                                        downloadUrl: item.downloadUrl,
                                        duration: item.duration,
                                        category: item.category
                                            ? { name: item.category.name }
                                            : undefined,
                                    }}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-secondary/10 rounded-3xl border border-dashed border-border mt-8">
                        <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h2 className="text-2xl font-semibold mb-2">No results found</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            We couldn't find anything matching your search. Try checking for typos or using different keywords.
                        </p>
                        <Link href="/" className="inline-block mt-8 text-primary font-medium hover:underline">
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
