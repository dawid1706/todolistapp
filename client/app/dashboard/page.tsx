"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getInvoices, type Invoice, type InvoiceStatus, deleteInvoice } from "@/lib/invoices"
import { FileText, Plus, LogOut, Clock, CheckCircle2, AlertCircle, Pencil, Trash2, Download, Bell } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

export default function DashboardPage() {
  const { session, loading, logout } = useAuth()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login")
    }
  }, [session, loading, router])

  useEffect(() => {
    if (session) {
      loadInvoices()
    }
  }, [session])

  const loadInvoices = () => {
    if (session) {
      const userInvoices = getInvoices(session.user.id)
      setInvoices(userInvoices)
    }
  }

  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (invoiceToDelete && session) {
      const result = await deleteInvoice(session.user.id, invoiceToDelete)
      if (result.success) {
        toast({
          title: "Faktura usunięta",
          description: "Faktura została pomyślnie usunięta",
        })
        loadInvoices()
      } else {
        toast({
          title: "Błąd",
          description: result.error || "Nie udało się usunąć faktury",
          variant: "destructive",
        })
      }
    }
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  const handleDownload = (invoice: Invoice) => {
    if (invoice.fileData) {
      const link = document.createElement("a")
      link.href = invoice.fileData
      link.download = invoice.fileName || `faktura_${invoice.invoiceNumber}.pdf`
      link.click()

      toast({
        title: "Pobieranie pliku",
        description: "Faktura została pobrana",
      })
    }
  }

  if (loading || !session) {
    return null
  }

  const stats = {
    total: invoices.length,
    pending: invoices.filter((inv) => inv.status === "PENDING").length,
    paid: invoices.filter((inv) => inv.status === "PAID").length,
    overdue: invoices.filter((inv) => inv.status === "OVERDUE").length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants = {
      PENDING: { label: "Oczekująca", variant: "secondary" as const, icon: Clock },
      PAID: { label: "Zapłacona", variant: "default" as const, icon: CheckCircle2 },
      OVERDUE: { label: "Zaległa", variant: "destructive" as const, icon: AlertCircle },
    }
    const config = variants[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Invoice Manager</h1>
                <p className="text-sm text-muted-foreground">Witaj, {session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Powiadomienia
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Wszystkie faktury</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Łączna liczba faktur</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Oczekujące</CardDescription>
              <CardTitle className="text-3xl">{stats.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Oczekują na płatność</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Zapłacone</CardDescription>
              <CardTitle className="text-3xl text-accent">{stats.paid}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zrealizowane płatności</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Zaległe</CardDescription>
              <CardTitle className="text-3xl text-destructive">{stats.overdue}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Wymagają uwagi</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista faktur</CardTitle>
                <CardDescription>Zarządzaj swoimi fakturami</CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj fakturę
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak faktur</h3>
                <p className="text-muted-foreground mb-4">Rozpocznij dodając swoją pierwszą fakturę</p>
                <Button asChild>
                  <Link href="/dashboard/invoices/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj fakturę
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Numer faktury</p>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kontrahent</p>
                        <p className="font-medium">{invoice.contractor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kwota</p>
                        <p className="font-semibold text-accent">{invoice.amount.toFixed(2)} PLN</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {invoice.fileData && (
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/invoices/${invoice.id}`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edytuj
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Usuń
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę fakturę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Faktura oraz powiązany plik zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
