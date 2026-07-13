import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search",
  description: "Search for your favorite Rwandan movies, series, and short films.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
