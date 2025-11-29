"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateInvoice, getInvoiceById, type InvoiceStatus } from "@/lib/invoices"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function EditInvoicePage() {
  const { session } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    amount: "",
    contractor: "",
    issueDate: "",
    dueDate: "",
    status: "PENDING" as InvoiceStatus,
  })

  useEffect(() => {
    if (session && params.id) {
      const invoice = getInvoiceById(session.user.id, params.id as string)
      if (invoice) {
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount.toString(),
          contractor: invoice.contractor,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
        })
      } else {
        setError("Faktura nie została znaleziona")
      }
    }
  }, [session, params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session || !params.id) {
      router.push("/login")
      return
    }

    setError("")
    setLoading(true)

    const result = await updateInvoice(session.user.id, params.id as string, {
      invoiceNumber: formData.invoiceNumber,
      amount: Number.parseFloat(formData.amount),
      contractor: formData.contractor,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: formData.status,
    })

    if (result.success) {
      toast({
        title: "Faktura zaktualizowana",
        description: "Zmiany zostały pomyślnie zapisane",
      })
      router.push("/dashboard")
    } else {
      setError(result.error || "Wystąpił błąd podczas aktualizacji faktury")
    }

    setLoading(false)
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
            <CardTitle>Edytuj fakturę</CardTitle>
            <CardDescription>Zaktualizuj dane faktury</CardDescription>
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
                <Label htmlFor="status">Status płatności *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: InvoiceStatus) => setFormData({ ...formData, status: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Oczekująca</SelectItem>
                    <SelectItem value="PAID">Zapłacona</SelectItem>
                    <SelectItem value="OVERDUE">Zaległa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>Zapisywanie...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Zapisz zmiany
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
