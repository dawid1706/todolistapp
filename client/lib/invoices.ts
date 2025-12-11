// Invoice management library
const API_BASE_URL = "http://localhost:3001/api/invoices";

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE";

export interface Invoice {
  id: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  contractor: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
}

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const mapBackendToFrontend = (invoice: any): Invoice => ({
  id: invoice._id,
  userId: invoice.user,
  invoiceNumber: invoice.invoiceNumber,
  amount: invoice.amount,
  contractor: invoice.contractor,
  issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
  dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
  status: invoice.status,
  filePath: invoice.filePath,
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
});

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const token = getAuthToken();
  if (!token) {
    console.error("No auth token found");
    return [];
  }

  try {
    const response = await fetch(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    const data = await response.json();
    return data.content.map(mapBackendToFrontend);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function createInvoice(
  userId: string,
  data: {
    invoiceNumber: string;
    amount: number;
    contractor: string;
    issueDate: string;
    dueDate: string;
    file?: File;
  }
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "Brak autoryzacji" };
  }

  try {
    const formData = new FormData();
    formData.append("invoiceNumber", data.invoiceNumber);
    formData.append("amount", data.amount.toString());
    formData.append("contractor", data.contractor);
    formData.append("issueDate", data.issueDate);
    formData.append("dueDate", data.dueDate);
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Wystąpił błąd" };
    }

    return { success: true, invoice: mapBackendToFrontend(result.content) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Wystąpił nieoczekiwany błąd" };
  }
}

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  data: Partial<{
    invoiceNumber: string;
    amount: number;
    contractor: string;
    issueDate: string;
    dueDate: string;
    status: InvoiceStatus;
  }>
): Promise<{ success: boolean; error?: string; invoice?: Invoice }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "Brak autoryzacji" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || "Wystąpił błąd" };
    }

    return { success: true, invoice: mapBackendToFrontend(result.invoice) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Wystąpił nieoczekiwany błąd" };
  }
}

export async function deleteInvoice(
  userId: string,
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: "Brak autoryzacji" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${invoiceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.message || "Wystąpił błąd" };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Wystąpił nieoczekiwany błąd" };
  }
}

export async function getInvoiceById(
  userId: string,
  invoiceId: string
): Promise<Invoice | null> {
  const invoices = await getInvoices(userId); // This is inefficient, but works for now.
  return invoices.find((inv) => inv.id === invoiceId) || null;
}

export async function getInvoiceDownloadUrl(invoiceId: string): Promise<string | null> {
  const token = getAuthToken();
  if (!token) {
    console.error("No auth token found");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${invoiceId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get download URL");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error fetching download URL:", error);
    return null;
  }
}

// Check for upcoming due dates (for notifications) - This logic remains client-side
export async function getUpcomingDueInvoices(
  userId: string,
  daysAhead = 7
): Promise<Invoice[]> {
  const invoices = await getInvoices(userId);
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  return invoices.filter((inv) => {
    if (inv.status !== "PENDING") return false;

    const dueDate = new Date(inv.dueDate);
    return dueDate >= today && dueDate <= futureDate;
  });
}
