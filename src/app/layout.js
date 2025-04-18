import PushManager from "@/lib/PushProvider"
import "./globals.css"
import { Inter } from "next/font/google"
// import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Dynamic Web Proxy",
  description: "A dynamic web proxy that bypasses CORS and embedding restrictions",
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <PushManager/>
      <body className={inter.style}>
        {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange> */}
          {children}
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}
