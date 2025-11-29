// Notification system for email reminders
import { getUpcomingDueInvoices, type Invoice } from "./invoices"
import { getUsers } from "./auth"

export interface NotificationLog {
  id: string
  userId: string
  invoiceId: string
  invoiceNumber: string
  sentAt: string
  emailTo: string
  subject: string
  message: string
}

const NOTIFICATIONS_KEY = "invoice_manager_notifications"
const LAST_CHECK_KEY = "invoice_manager_last_notification_check"

function getNotificationLogs(): NotificationLog[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(NOTIFICATIONS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

function saveNotificationLog(log: NotificationLog) {
  const logs = getNotificationLogs()
  logs.push(log)
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(logs))
}

export function getUserNotificationLogs(userId: string): NotificationLog[] {
  return getNotificationLogs().filter((log) => log.userId === userId)
}

function getLastCheckDate(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LAST_CHECK_KEY)
}

function setLastCheckDate(date: string) {
  localStorage.setItem(LAST_CHECK_KEY, date)
}

// Simulate email sending (in production, this would use a service like SendGrid)
async function sendEmail(to: string, subject: string, message: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log("[v0] Symulacja wysyłki e-mail:")
  console.log("[v0] Do:", to)
  console.log("[v0] Temat:", subject)
  console.log("[v0] Treść:", message)

  return true
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export async function checkAndSendNotifications(userId: string): Promise<{
  success: boolean
  sent: number
  invoices: Invoice[]
}> {
  const upcomingInvoices = getUpcomingDueInvoices(userId, 7)
  const users = getUsers()

  let sentCount = 0
  const processedInvoices: Invoice[] = []

  for (const invoice of upcomingInvoices) {
    // Find user email
    let userEmail = ""
    for (const [uid, userData] of users) {
      if (uid === userId) {
        userEmail = userData.email
        break
      }
    }

    if (!userEmail) continue

    const daysUntilDue = calculateDaysUntilDue(invoice.dueDate)
    const subject = `Przypomnienie: Faktura ${invoice.invoiceNumber} - termin płatności`
    const message = `
Szanowny Kliencie,

To przypomnienie o zbliżającym się terminie płatności faktury.

Szczegóły faktury:
- Numer faktury: ${invoice.invoiceNumber}
- Kontrahent: ${invoice.contractor}
- Kwota: ${invoice.amount.toFixed(2)} PLN
- Termin płatności: ${formatDate(invoice.dueDate)} (za ${daysUntilDue} dni)

Prosimy o terminową płatność.

Pozdrawiamy,
Invoice Manager
    `.trim()

    const emailSent = await sendEmail(userEmail, subject, message)

    if (emailSent) {
      const log: NotificationLog = {
        id: crypto.randomUUID(),
        userId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        sentAt: new Date().toISOString(),
        emailTo: userEmail,
        subject,
        message,
      }

      saveNotificationLog(log)
      sentCount++
      processedInvoices.push(invoice)
    }
  }

  setLastCheckDate(new Date().toISOString())

  return {
    success: true,
    sent: sentCount,
    invoices: processedInvoices,
  }
}

export function getNotificationStats(userId: string) {
  const logs = getUserNotificationLogs(userId)
  const lastCheck = getLastCheckDate()
  const upcomingInvoices = getUpcomingDueInvoices(userId, 7)

  return {
    totalSent: logs.length,
    lastCheck: lastCheck ? new Date(lastCheck) : null,
    pendingNotifications: upcomingInvoices.length,
    recentLogs: logs.slice(-10).reverse(),
  }
}
