import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Watchlist",
  description: "Your personal collection of movies and series to watch later.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
