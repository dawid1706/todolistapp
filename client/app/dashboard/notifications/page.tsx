"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { checkAndSendNotifications, getNotificationStats, type NotificationLog } from "@/lib/notifications"
import { ArrowLeft, Bell, Send, Clock, CheckCircle2, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function NotificationsPage() {
  const { session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalSent: 0,
    lastCheck: null as Date | null,
    pendingNotifications: 0,
    recentLogs: [] as NotificationLog[],
  })

  useEffect(() => {
    if (session) {
      refreshStats()
    }
  }, [session])

  const refreshStats = () => {
    if (session) {
      const newStats = getNotificationStats(session.user.id)
      setStats(newStats)
    }
  }

  const handleSendNotifications = async () => {
    if (!session) return

    setLoading(true)

    try {
      const result = await checkAndSendNotifications(session.user.id)

      if (result.success) {
        if (result.sent > 0) {
          toast({
            title: "Powiadomienia wysłane",
            description: `Wysłano ${result.sent} powiadomień e-mail`,
          })
        } else {
          toast({
            title: "Brak powiadomień do wysłania",
            description: "Nie ma faktur z zbliżającym się terminem płatności",
          })
        }
        refreshStats()
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas wysyłania powiadomień",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!session) {
    return null
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Powiadomienia e-mail
            </h1>
            <p className="text-muted-foreground mt-2">
              System automatycznych powiadomień o zbliżających się terminach płatności
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              System wysyła automatyczne powiadomienia e-mail dla faktur o statusie "Oczekująca", których termin
              płatności upływa w ciągu 7 dni.
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Wysłane powiadomienia</CardDescription>
                <CardTitle className="text-3xl">{stats.totalSent}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Łącznie wysłanych</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Oczekujące</CardDescription>
                <CardTitle className="text-3xl text-accent">{stats.pendingNotifications}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Do wysłania</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Ostatnie sprawdzenie</CardDescription>
                <CardTitle className="text-lg">
                  {stats.lastCheck ? stats.lastCheck.toLocaleDateString("pl-PL") : "Nigdy"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Data sprawdzenia</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Send Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Wyślij powiadomienia teraz</CardTitle>
              <CardDescription>Ręcznie uruchom sprawdzanie terminów i wysyłkę powiadomień e-mail</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSendNotifications} disabled={loading} size="lg">
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Wysyłanie powiadomień...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Sprawdź i wyślij powiadomienia
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                W środowisku produkcyjnym ta operacja byłaby wykonywana automatycznie raz dziennie za pomocą Cloud
                Scheduler wywołującego dedykowany endpoint w Cloud Run.
              </p>
            </CardContent>
          </Card>

          {/* Recent Notifications Log */}
          <Card>
            <CardHeader>
              <CardTitle>Historia powiadomień</CardTitle>
              <CardDescription>Ostatnio wysłane powiadomienia e-mail</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Brak wysłanych powiadomień</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentLogs.map((log) => (
                    <div key={log.id} className="p-4 border border-border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">
                              <Mail className="h-3 w-3 mr-1" />
                              {log.invoiceNumber}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatDateTime(log.sentAt)}</span>
                          </div>
                          <p className="font-medium text-sm mb-1">{log.subject}</p>
                          <p className="text-sm text-muted-foreground">Wysłano do: {log.emailTo}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Pokaż treść wiadomości
                        </summary>
                        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
                          {log.message}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Info */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Informacje techniczne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Wymagania projektu (WF-3.1 - WF-3.4):</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>System identyfikuje faktury PENDING z terminem płatności w ciągu 7 dni</li>
                <li>Automatyczne powiadomienia e-mail są wysyłane dla każdej zidentyfikowanej faktury</li>
                <li>Treść zawiera: numer faktury, kontrahent, termin płatności</li>
                <li>W produkcji: Cloud Scheduler uruchamia zadanie raz dziennie</li>
              </ul>
              <p className="mt-4">
                <strong>Implementacja produkcyjna (GCP):</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cloud Scheduler: Cron job (0 9 * * *) - codziennie o 9:00</li>
                <li>Cloud Run: Endpoint /api/notifications/check (chroniony service account)</li>
                <li>SendGrid/Cloud Functions: Wysyłka rzeczywistych e-maili</li>
                <li>Cloud SQL: Logowanie wysłanych powiadomień</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
