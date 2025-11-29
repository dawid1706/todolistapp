import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Invoice Manager - Zarządzanie Fakturami",
  description:
    "Profesjonalny system zarządzania fakturami z bezpiecznym uwierzytelnianiem i przechowywaniem dokumentów",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl" className="dark">
      <body className={`${geistSans.className} ${geistMono.className} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
