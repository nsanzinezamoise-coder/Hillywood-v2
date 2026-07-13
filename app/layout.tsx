import React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script" // ✅ ADDED
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AppDownloadFloatingButton } from "@/components/app-download-floating-button"
import { LiveUsersProvider } from "@/components/live-users-provider"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hillywood.vercel.app"),
  title: {
    default: "hillywood - Rwandan Cinema Streaming",
    template: "%s | hillywood",
  },
  description:
    "Discover and stream the best of Rwandan cinema. Watch movies,series, documentaries, and short films celebrating Rwandan culture and storytelling.",
keywords: [
    "rwandan netflix",
    "rwandan hillywood movies",
    "rwandan hollywood",
    "rwanda hollywood",
    "rwandan netflix movies",
    "rwandan netflix series",
    "hillywood",
    "hillywood platform",
    "hillywood kigali",
    "kigali movie streaming platform",
    "kigali best movie",
    "kigali best serie",
    "hillywood rwanda",
    "hillywood rwanda website",
    "hillywood rwanda platform",
    "rwanda films platform",
    "rwanda films platform",
    "hillywood rwandan cinema streaming",
    "hillywood rwandan cinema online",
    "hillywood rwandan series",
    "hillywood cinema",
    "hillywood rwanda films",
    "hillywood films",
    "hillywood streaming",
    "hillywood platform",
    "hillywood originals",
    "hillywood local rwandan content",
    "hillywood local rwandan movies",
    "rwandan movies streaming",
    "rwandan series streaming",
    "rwandan movies online",
    "rwandan series online",
    "hillywood local rwandan series",
    "hillywood Rwandan movies",
    "Rwandan films",
    "hillywood Rwandan films",
    "Rwandan series",
    "hillywood Rwandan series",
    "hillywood Rwandan cinema",
    "Rwandan cinema",
    "local Rwandan cinema",
    "local Rwandan series",
    "hillywood Rwandan dramas",
    "hillywood Rwandan documentaries",
    "Rwandan short films online",
    "Rwandan short films",
    "Watch Rwandan short films",
    "Kinyarwanda films",
    "Kinyarwanda series",
    "Kinyarwanda drama",
    "Kinyarwanda entertainment",
    "African cinema",
    "East African films",
    "African streaming",
    "African dramas",
    "African storytelling",
    "Rwandan storytelling",
    "Rwandan culture",
    "authentic Rwandan stories",
    "local Rwandan content",
    "Rwandan narratives",
    "Rwanda streaming platform",
    "watch Rwandan films online",
    "Rwandan video on demand",
    "stream Rwandan content",
    "Rwandan entertainment online",
    "Kigali entertainment",
    "Rwanda creative arts",
    "Watch Rwandan media",
    "Watch Rwandan films",
    "Watch Rwandan films online",
    "Watch Rwandan series",
    "Watch Rwandan series online",
    "Rwandan media",
    "hillywood Rwanda film industry",
    "Rwanda film industry",
    "Watch Rwanda film industry",
    "Rwandan production",
    "hillywood Rwandan romance",
    "Rwandan romance",
    "Rwandan comedy",
    "Rwandan coming-of-age",
    "Rwandan youth stories",
    "contemporary Rwandan films",
    "modern Rwandan series",
    "new Rwandan movies",
    "latest local Rwandan series",
    "latest Rwandan series",
    "latest Rwandan series",
    "trending Rwandan films",
    "local trending Rwandan films",
    "popular Rwandan shows",
    "best 5 Rwandan cinema",
    "best 5 local Rwandan cinema",
    "best Rwandan cinema",
    "top Rwandan dramas",
    "top 5 Rwandan dramas",
    "top 5 Rwandan movies",
    "top 10 Rwandan movies",
    "top 5 Rwandan series",
    "top 10 Rwandan series",
    "top Rwandan dramas",
    "must-watch Rwandan content"
  ],
  authors: [{ name: "hillywood" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "hillywood",
    title: "hillywood - Rwandan Cinema Streaming",
    description: "Discover and stream the best of Rwandan cinema.",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Hillywood Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "hillywood - Rwandan Cinema Streaming",
    description: "Discover and stream the best of Rwandan cinema.",
    images: ["/opengraph.png"],
  },
  icons: {
    icon: [
      { url: '/ab.png' },
      { url: '/ab.png', type: 'image/png', sizes: '512x512' },
      { url: '/ab.png', type: 'image/png', sizes: '592x592' },
    ],
    apple: [
      { url: '/ab.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'google-site-verification': 'LfCXyc0DnX3D8vpZpSIR7B3S24sg1_oOwdDgQMmUByU',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1614" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://drive.google.com" />
        <link rel="dns-prefetch" href="https://drive.google.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />

        {/* ✅ AD SCRIPT ADDED (no changes to your existing code)
       // <Script
          id="popads-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var z=window,p="e99f9439f111dd78c0add5fcda74b212",x=[["siteId",18+19-741*842+5914219],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],k=["d3d3LmJsb2NrYWRzbm90LmNvbS92dmFzdC1jbGllbnQubWluLmNzcw==","ZG5oZmk1bm4yZHQ2Ny5jbG91ZGZyb250Lm5ldC9lL3BobHMubWluLmpz"],w=-1,v,e,y=function(){clearTimeout(e);w++;if(k[w]&&!(1801383289000<(new Date).getTime()&&1<w)){v=document.createElement("script");v.type="text/javascript";v.async=true;var n=document.getElementsByTagName("script")[0];v.src="https://"+atob(k[w]);v.crossOrigin="anonymous";v.onerror=y;v.onload=function(){clearTimeout(e);window[p.slice(0,16)+p.slice(0,16)]||y()};e=setTimeout(y,5000);n.parentNode.insertBefore(v,n)}};if(!window[p]){try{Object.freeze(window[p]=x)}catch(e){}y()}})();`,
          }}
        />*/}
      </head>

      <body className="font-sans antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LiveUsersProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <AppDownloadFloatingButton />
              <Toaster position="top-center" richColors />
            </LiveUsersProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}