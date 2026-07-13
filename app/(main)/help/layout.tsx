import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Help Center",
  description: "Get help and support for using hillywood.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
