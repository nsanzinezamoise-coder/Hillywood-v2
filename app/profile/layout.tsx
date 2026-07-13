import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your personal account settings.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
