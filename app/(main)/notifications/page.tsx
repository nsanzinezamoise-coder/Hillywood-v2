export const dynamic = "force-dynamic"
import { Film, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import { Movie, Series, Short } from "@/lib/models";

interface Notification {
    id: string;
    title: string;
    type: "movie" | "series" | "short";
    image: string;
    createdAt: string;
    link: string;
    message: string;
}

export const revalidate = 120

async function getNotifications(): Promise<Notification[]> {
    await connectToDatabase()

    const [movies, series, shorts] = await Promise.all([
        Movie.find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).limit(10).lean(),
        Series.find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).limit(10).lean(),
        Short.find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).limit(10).lean(),
    ])

    return [
        ...movies.map((m: any) => ({
            id: m._id.toString(),
            title: m.title,
            type: "movie" as const,
            image: m.poster,
            createdAt: m.createdAt,
            link: `/movie/${m.slug}`,
            message: "New movie added",
        })),
        ...series.map((s: any) => ({
            id: s._id.toString(),
            title: s.title,
            type: "series" as const,
            image: s.poster,
            createdAt: s.createdAt,
            link: `/serie/${s.slug}`,
            message: "New series added",
        })),
        ...shorts.map((s: any) => ({
            id: s._id.toString(),
            title: s.title,
            type: "short" as const,
            image: s.poster,
            createdAt: s.createdAt,
            link: `/shorts/${s.slug}`,
            message: "New short film added",
        })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
}

export default async function NotificationsPage() {
    const notifications = await getNotifications()

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
                            New for You
                        </h1>
                        <p className="text-muted-foreground">
                            Stay updated with the latest movies, series, and shorts.
                        </p>
                    </div>
                </header>

                <div className="grid gap-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div key={notif.id}>
                                <Link
                                    href={notif.link}
                                    className="group flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-primary/20 transition-all"
                                >
                                    <div className="relative w-24 h-32 md:w-32 md:h-40 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                                        <Image
                                            src={notif.image}
                                            alt={notif.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex flex-col flex-1 py-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                {notif.type}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                                            {notif.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-auto">
                                            {notif.message}. Start watching now on hillywood.
                                        </p>
                                        <div className="mt-4 flex items-center text-primary text-sm font-medium">
                                            Watch Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
                            <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">No new notifications at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
