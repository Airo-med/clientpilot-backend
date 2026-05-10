import { clearAuth, getToken, type StoredUser } from "./auth-storage";

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function jsonHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { ...jsonHeaders(), ...init?.headers },
  });
  const data = await parseBody(res);
  if (res.status === 204 || res.status === 205) return undefined as T;
  if (!res.ok) {
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.startsWith("/auth/")
    ) {
      clearAuth();
      window.location.href = "/authentication/login";
    }
    const body = data as { error?: string; message?: string; details?: unknown };
    const msg =
      body?.error || body?.message || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body?.details);
  }
  return data as T;
}

export async function register(body: {
  name: string;
  email: string;
  password: string;
}) {
  return requestJson<{ token: string; user: StoredUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function login(body: { email: string; password: string }) {
  return requestJson<{ token: string; user: StoredUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function forgotPassword(body: { email: string }) {
  return requestJson<{ message?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function resetPassword(body: {
  token: string;
  password: string;
}) {
  return requestJson<{ message?: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type DashboardMetrics = {
  totals: {
    clients: number;
    projects: number;
    paidInvoices: number;
    unpaidInvoices: number;
    totalRevenue: string;
  };
  revenueByMonth: { month: number; revenue: string }[];
  revenueByYear: { year: number; revenue: string }[];
};

export async function getDashboardMetrics(year?: number) {
  const q = year ? `?year=${year}` : "";
  return requestJson<DashboardMetrics>(`/dashboard/metrics${q}`);
}

export type Client = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listClients() {
  return requestJson<{ clients: Client[] }>("/clients");
}

export async function getClient(id: string) {
  return requestJson<{ client: Client }>(`/clients/${id}`);
}

export async function createClient(body: {
  name: string;
  email?: string;
  phone?: string;
}) {
  return requestJson<{ client: Client }>("/clients", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateClient(
  id: string,
  body: { name?: string; email?: string; phone?: string }
) {
  return requestJson<{ client: Client }>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteClient(id: string) {
  await requestJson<void>(`/clients/${id}`, { method: "DELETE" });
}

export type Project = {
  id: string;
  userId: string;
  clientId: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listProjects(clientId?: string) {
  const q =
    clientId && clientId.length > 0 ? `?clientId=${encodeURIComponent(clientId)}` : "";
  return requestJson<{ projects: Project[] }>(`/projects${q}`);
}

export async function getProject(id: string) {
  return requestJson<{ project: Project }>(`/projects/${id}`);
}

export async function createProject(body: {
  clientId: string;
  title: string;
  description?: string;
  status?: "active" | "completed";
  notes?: string;
  attachmentUrl?: string;
}) {
  return requestJson<{ project: Project }>("/projects", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateProject(
  id: string,
  body: {
    title?: string;
    description?: string;
    status?: "active" | "completed";
    notes?: string;
    attachmentUrl?: string;
  }
) {
  return requestJson<{ project: Project }>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteProject(id: string) {
  await requestJson<void>(`/projects/${id}`, { method: "DELETE" });
}

export type Invoice = {
  id: string;
  userId: string;
  projectId: string;
  amount: string | null;
  status: string;
  dueDate: string;
  paidAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listInvoices(params?: {
  projectId?: string;
  status?: "paid" | "unpaid";
}) {
  const sp = new URLSearchParams();
  if (params?.projectId) sp.set("projectId", params.projectId);
  if (params?.status) sp.set("status", params.status);
  const q = sp.toString();
  return requestJson<{ invoices: Invoice[] }>(
    `/invoices${q ? `?${q}` : ""}`
  );
}

export async function getInvoice(id: string) {
  return requestJson<{ invoice: Invoice }>(`/invoices/${id}`);
}

export async function createInvoice(body: {
  projectId: string;
  amount: number;
  dueDate: string;
  status?: "paid" | "unpaid";
}) {
  return requestJson<{ invoice: Invoice }>("/invoices", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateInvoice(
  id: string,
  body: {
    amount?: number;
    dueDate?: string;
    status?: "paid" | "unpaid";
    pdfUrl?: string;
  }
) {
  return requestJson<{ invoice: Invoice }>(`/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteInvoice(id: string) {
  await requestJson<void>(`/invoices/${id}`, { method: "DELETE" });
}

export async function downloadInvoicePdf(id: string): Promise<Blob> {
  const t = getToken();
  const res = await fetch(`/api/invoices/${id}/pdf`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const j = JSON.parse(text) as { error?: string };
      if (j.error) msg = j.error;
    } catch {}
    throw new Error(msg || `PDF download failed (${res.status})`);
  }
  return res.blob();
}

export type SubscriptionInfo = {
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  limits: {
    clients: { used: number; max: number | null };
    invoices: { used: number; max: number | null };
    projects: { used: number; max: number | null };
  };
};

export async function getSubscription() {
  return requestJson<SubscriptionInfo>("/subscription");
}

export async function createCheckoutSession() {
  return requestJson<{ url: string | null }>("/subscription/checkout-session", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
