"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { register } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { FileText, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { refreshSession } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Hasła nie są zgodne")
      return
    }

    setLoading(true)

    const result = await register(email, password, name)

    if (result.success) {
      refreshSession()
      router.push("/dashboard")
    } else {
      setError(result.error || "Wystąpił błąd podczas rejestracji")
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
            <CardTitle>Rejestracja</CardTitle>
            <CardDescription>Utwórz nowe konto</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan Kowalski"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

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
                <p className="text-xs text-muted-foreground">Min. 8 znaków, wielka litera i cyfra</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <UserPlus className="mr-2 h-4 w-4 animate-pulse" />
                    Tworzenie konta...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Zarejestruj się
                  </>
                )}
              </Button>

              <div className="text-sm text-center text-muted-foreground">
                Masz już konto?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Zaloguj się
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
