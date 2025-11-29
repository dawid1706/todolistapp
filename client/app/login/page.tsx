"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { FileText, Lock } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { refreshSession } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      refreshSession()
      router.push("/dashboard")
    } else {
      setError(result.error || "Wystąpił błąd podczas logowania")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-balance">Invoice Manager</h1>
          <p className="text-muted-foreground mt-2">Bezpieczne zarządzanie fakturami</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Logowanie</CardTitle>
            <CardDescription>Zaloguj się do swojego konta</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Adres e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4 animate-pulse" />
                    Logowanie...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Zaloguj się
                  </>
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Nie masz konta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Zarejestruj się
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
