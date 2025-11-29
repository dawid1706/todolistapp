"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [session, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
