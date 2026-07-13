"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SeriesForm } from "@/components/admin/series-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface NewSeriesClientProps {
    categories: any[]
    allSeries: any[]
}

export function NewSeriesClient({ categories, allSeries }: NewSeriesClientProps) {
    const router = useRouter()
    const [isNewMovie, setIsNewMovie] = useState<boolean | null>(null)
    const [showTypeModal, setShowTypeModal] = useState(true)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [filteredSeries, setFilteredSeries] = useState<any[]>(allSeries)
    const [selectedSeries, setSelectedSeries] = useState<any>(null)

    // User inputs
    const [movieName, setMovieName] = useState<string>("")
    const [modalMovieName, setModalMovieName] = useState<string>("")
    const [season, setSeason] = useState<number | "">(1)
    const [episode, setEpisode] = useState<number | "">(1)

    // Generated title
    const [generatedTitle, setGeneratedTitle] = useState<string>("")

    // Handle modal close (both by clicking close button or outside)
    const handleModalClose = (open: boolean) => {
        if (!open) {
            // If modal is closed without selecting an option, go back to series list
            if (isNewMovie === null) {
                router.push('/admin/series')
            } else {
                setShowTypeModal(false)
            }
        }
    }

    // Filter series when searching for existing movies
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchTerm(value)
        if (!value.trim()) {
            setFilteredSeries(allSeries)
        } else {
            const filtered = allSeries.filter(series =>
                series.title.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredSeries(filtered)
        }
    }

    // Handle series selection
    const handleSeriesSelect = (series: any) => {
        setSelectedSeries(series)
        setSearchTerm(series.title)
        setMovieName(series.title)
    }

    // Generate title based on user inputs
    const generateTitle = () => {
        if (!movieName.trim()) return ""

        // Strip existing sXepX or sX patterns from the end to avoid duplication
        const baseName = movieName.replace(/\s*s\d+(?:\s*e?p\d+)?\s*$/i, "").trim()
        const s = Number(season)
        const ep = Number(episode)

        if (s > 0 && ep > 0) return `${baseName} s${s}ep${ep}`
        if (s > 0) return `${baseName} s${s}`
        return baseName
    }

    // Update generated title whenever inputs change
    useEffect(() => {
        setGeneratedTitle(generateTitle())
    }, [movieName, season, episode])

    // Show modal on mount if user hasn't chosen yet
    useEffect(() => {
        setShowTypeModal(isNewMovie === null)
    }, [isNewMovie])

    return (
        <div>
            {/* Modal for selecting new or existing movie */}
            <Dialog open={showTypeModal} onOpenChange={handleModalClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Select Content Type</DialogTitle>
                        <DialogDescription>
                            Are you adding a new movie/series or updating an existing one?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                        <button
                            className={`w-full p-4 rounded-lg border text-left transition-colors ${isNewMovie === true ? 'bg-primary/10 border-primary' : 'hover:bg-red-500/10'}`}
                            onClick={() => {
                                setIsNewMovie(true)
                                setShowTypeModal(false)
                                setSelectedSeries(null)
                                setSearchTerm("")
                                setMovieName("")
                                setSeason(1)
                                setEpisode(1)
                            }}
                        >
                            <span className="font-medium">Brand New Movie/Series</span>
                            <p className="text-sm text-muted-foreground mt-1">
                                This movie/series does not exist in the database yet.
                            </p>
                        </button>

                        <button
                            className={`w-full p-4 rounded-lg border text-left transition-colors ${isNewMovie === false ? 'bg-primary/10 border-primary' : 'hover:bg-red-500/10'}`}
                            onClick={() => {
                                setIsNewMovie(false)
                                setShowTypeModal(false)
                                setSelectedSeries(null)
                                setSearchTerm("")
                                setMovieName("")
                                setSeason(1)
                                setEpisode(1)
                            }}
                        >
                            <span className="font-medium">Update Existing Movie/Series</span>
                            <p className="text-sm text-muted-foreground mt-1">
                                Add a new season or episode to an existing movie/series.
                            </p>
                        </button>
                    </div>

                    {/* Optional: Add a cancel button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => router.push('/admin/series')}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* After modal is closed, show the form */}
            {isNewMovie !== null && (
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-foreground">
                                {isNewMovie ? "Add New Series" : "Update Existing Series"}
                            </h1>
                            <p className="text-muted-foreground">
                                {isNewMovie
                                    ? "Upload a new series to the library"
                                    : "Add a new season or episode to an existing series"}
                            </p>
                        </div>
                        {/* Add a back button */}
                        <button
                            onClick={() => router.push('/admin/series')}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border rounded-lg hover:bg-red-500/10"
                        >
                            Back to Series
                        </button>
                    </div>

                    {/* Movie Name Input / Search */}
                    <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                        <label className="block text-sm font-medium text-foreground">
                            Movie/Series Name *
                        </label>

                        {isNewMovie ? (
                            <input
                                type="text"
                                value={movieName}
                                onChange={e => setMovieName(e.target.value)}
                                placeholder="Enter the name of the new movie/series"
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                required
                            />
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search for existing movie/series..."
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                />

                                {/* Search results */}
                                {searchTerm && (
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <div className="bg-muted px-4 py-2 border-b">
                                            <span className="text-sm font-medium text-foreground">
                                                {filteredSeries.length} results found
                                            </span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {filteredSeries.length > 0 ? (
                                                filteredSeries.map((series, index) => (
                                                    <div
                                                        key={series._id || index}
                                                        className={`p-3 cursor-pointer border-b hover:bg-red-500/10 transition-colors ${selectedSeries?._id === series._id ? 'bg-primary/10 border-primary/20' : ''
                                                            }`}
                                                        onClick={() => handleSeriesSelect(series)}
                                                    >
                                                        <span className={`font-medium ${selectedSeries?._id === series._id ? 'text-primary' : 'text-foreground'}`}>
                                                            {series.title}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-muted-foreground">
                                                    No results found for "{searchTerm}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Season and Episode Inputs — shown for BOTH new and existing */}
                        {(isNewMovie || (!isNewMovie && selectedSeries)) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Season</label>
                                    <input
                                        type="number"
                                        value={season}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setSeason(val === "" ? "" : parseInt(val));
                                        }}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground">Episode</label>
                                    <input
                                        type="number"
                                        value={episode}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setEpisode(val === "" ? "" : parseInt(val));
                                        }}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                        min={1}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Generated Title */}
                    {generatedTitle && (
                        <div className="mb-8 p-6 bg-muted/50 rounded-lg border">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-2 w-2 bg-primary rounded-full"></div>
                                <h3 className="font-medium text-foreground">Generated Title</h3>
                            </div>
                            <div className="p-4 bg-background rounded border">
                                <p className="text-xl font-semibold text-primary font-mono">{generatedTitle}</p>
                                <div className="text-sm text-muted-foreground mt-2">
                                    {isNewMovie
                                        ? "This title will be used as-is for the new movie/series"
                                        : <>Template: <code>{"{name} s{season}ep{episode}"}</code></>
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    <SeriesForm
                        categories={categories}
                        isNewMovie={isNewMovie}
                        generatedTitle={generatedTitle}
                        selectedSeries={selectedSeries}
                        season={Number(season) || 1}
                        episode={Number(episode) || 1}
                    />
                </div>
            )}
        </div>
    )
}