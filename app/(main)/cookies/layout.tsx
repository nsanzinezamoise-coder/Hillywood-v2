import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how we use cookies at hillywood.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
