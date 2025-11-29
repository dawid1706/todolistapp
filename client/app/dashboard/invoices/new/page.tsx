"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createInvoice } from "@/lib/invoices"
import { ArrowLeft, Upload, FileText } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NewInvoicePage() {
  const { session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    amount: "",
    contractor: "",
    issueDate: "",
    dueDate: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Tylko pliki PDF są akceptowane")
        setFile(null)
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("Plik jest zbyt duży (maksymalnie 10MB)")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Form submitted")
    console.log("[v0] Session:", session)
    console.log("[v0] Form data:", formData)
    console.log("[v0] File:", file)

    if (!session) {
      console.log("[v0] No session, redirecting to login")
      router.push("/login")
      return
    }

    if (
      !formData.invoiceNumber ||
      !formData.contractor ||
      !formData.amount ||
      !formData.issueDate ||
      !formData.dueDate
    ) {
      setError("Wszystkie pola są wymagane")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("[v0] Calling createInvoice...")
      const result = await createInvoice(session.user.id, {
        invoiceNumber: formData.invoiceNumber,
        amount: Number.parseFloat(formData.amount),
        contractor: formData.contractor,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        file: file || undefined,
      })

      console.log("[v0] createInvoice result:", result)

      if (result.success) {
        toast({
          title: "Faktura utworzona",
          description: "Faktura została pomyślnie dodana",
        })
        router.push("/dashboard")
      } else {
        setError(result.error || "Wystąpił błąd podczas tworzenia faktury")
      }
    } catch (error) {
      console.log("[v0] Exception in handleSubmit:", error)
      setError("Wystąpił nieoczekiwany błąd")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót do dashboardu
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Dodaj nową fakturę</CardTitle>
            <CardDescription>Wypełnij formularz, aby dodać fakturę do systemu</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Numer faktury *</Label>
                <Input
                  id="invoiceNumber"
                  placeholder="FV/2025/001"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractor">Kontrahent *</Label>
                <Input
                  id="contractor"
                  placeholder="Nazwa firmy lub osoby"
                  value={formData.contractor}
                  onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Kwota (PLN) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1000.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Data wystawienia *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Termin płatności *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Plik faktury (PDF)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="flex-1"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Opcjonalne. Maksymalny rozmiar: 10MB. Format: PDF</p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>Tworzenie faktury...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Dodaj fakturę
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Anuluj</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
