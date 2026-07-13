import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Notifications",
  description: "Stay updated with your latest alerts and messages.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
