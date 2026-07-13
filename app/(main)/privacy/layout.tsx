import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy to understand how we protect your data.",
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
