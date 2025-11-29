// Invoice management library
export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE"

export interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  amount: number
  contractor: string
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  fileName?: string
  fileBlobUrl?: string // Blob URL for file access
  createdAt: string
  updatedAt: string
}

const INVOICES_KEY = "invoice_manager_invoices"
const BLOBS_KEY = "invoice_manager_blobs"

function saveBlobToStorage(invoiceId: string, blob: Blob): string {
  const blobUrl = URL.createObjectURL(blob)
  const blobs = getBlobsFromStorage()
  blobs[invoiceId] = blobUrl
  localStorage.setItem(BLOBS_KEY, JSON.stringify(blobs))
  return blobUrl
}

function getBlobsFromStorage(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(BLOBS_KEY)
  return data ? JSON.parse(data) : {}
}

function deleteBlobFromStorage(invoiceId: string) {
  const blobs = getBlobsFromStorage()
  const blobUrl = blobs[invoiceId]
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    delete blobs[invoiceId]
    localStorage.setItem(BLOBS_KEY, JSON.stringify(blobs))
  }
}

export function getInvoices(userId: string): Invoice[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(INVOICES_KEY)
  if (!data) return []

  const allInvoices: Invoice[] = JSON.parse(data)
  return allInvoices.filter((inv) => inv.userId === userId)
}

function getAllInvoices(): Invoice[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(INVOICES_KEY)
  if (!data) return []
  return JSON.parse(data)
}

function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices))
}

export async function createInvoice(
  userId: string,
  data: {
    invoiceNumber: string
    amount: number
    contractor: string
    issueDate: string
    dueDate: string
    file?: File
  },
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  try {
    const allInvoices = getAllInvoices()

    // Check for duplicate invoice number
    const duplicate = allInvoices.find((inv) => inv.invoiceNumber === data.invoiceNumber && inv.userId === userId)

    if (duplicate) {
      return { success: false, error: "Faktura o tym numerze już istnieje" }
    }

    let fileName: string | undefined
    let fileBlobUrl: string | undefined

    if (data.file) {
      fileName = data.file.name
      // Create invoice first to get ID for blob storage
      const tempId = crypto.randomUUID()
      fileBlobUrl = saveBlobToStorage(tempId, data.file)
    }

    // Determine initial status based on due date
    const dueDate = new Date(data.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let status: InvoiceStatus = "PENDING"

    if (dueDate < today) {
      status = "OVERDUE"
    }

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      userId,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      contractor: data.contractor,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status,
      fileName,
      fileBlobUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    allInvoices.push(invoice)
    saveInvoices(allInvoices)

    return { success: true, invoice }
  } catch (error) {
    return { success: false, error: "Wystąpił nieoczekiwany błąd" }
  }
}

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  data: Partial<{
    invoiceNumber: string
    amount: number
    contractor: string
    issueDate: string
    dueDate: string
    status: InvoiceStatus
  }>,
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  const allInvoices = getAllInvoices()
  const index = allInvoices.findIndex((inv) => inv.id === invoiceId && inv.userId === userId)

  if (index === -1) {
    return { success: false, error: "Faktura nie została znaleziona" }
  }

  const invoice = allInvoices[index]

  // Update fields
  const updated: Invoice = {
    ...invoice,
    ...data,
    updatedAt: new Date().toISOString(),
  }

  allInvoices[index] = updated
  saveInvoices(allInvoices)

  return { success: true, invoice: updated }
}

export async function deleteInvoice(userId: string, invoiceId: string): Promise<{ success: boolean; error?: string }> {
  const allInvoices = getAllInvoices()
  const index = allInvoices.findIndex((inv) => inv.id === invoiceId && inv.userId === userId)

  if (index === -1) {
    return { success: false, error: "Faktura nie została znaleziona" }
  }

  deleteBlobFromStorage(invoiceId)

  allInvoices.splice(index, 1)
  saveInvoices(allInvoices)

  return { success: true }
}

export function getInvoiceById(userId: string, invoiceId: string): Invoice | null {
  const invoices = getInvoices(userId)
  return invoices.find((inv) => inv.id === invoiceId) || null
}

// Check for upcoming due dates (for notifications)
export function getUpcomingDueInvoices(userId: string, daysAhead = 7): Invoice[] {
  const invoices = getInvoices(userId)
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysAhead)

  return invoices.filter((inv) => {
    if (inv.status !== "PENDING") return false

    const dueDate = new Date(inv.dueDate)
    return dueDate >= today && dueDate <= futureDate
  })
}
