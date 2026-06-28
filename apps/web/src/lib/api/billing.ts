import { apiFetch } from "./client";

export type ApiBillingInvoiceLine = {
  label: string;
  amount: number;
};

export type ApiBillingInvoice = {
  id: string;
  client_id: string;
  business_name: string | null;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  external_ref: string | null;
  line_items: ApiBillingInvoiceLine[];
};

export type ApiBillingStats = {
  total_mrr: number;
  open_invoices: number;
  past_due_amount: number;
  paid_this_month: number;
  invoice_count: number;
};

export type ApiFleetMrrRow = {
  subscription_id: string;
  client_id: string;
  business_name: string;
  plan: string;
  status: string;
  billing_cycle: string;
  mrr: number;
  period_end: string | null;
  auto_renew: boolean;
};

export async function fetchBillingStats(): Promise<ApiBillingStats> {
  return apiFetch<ApiBillingStats>("/api/v1/billing/stats");
}

export async function fetchBillingInvoices(opts?: {
  clientId?: string;
  status?: string;
}): Promise<ApiBillingInvoice[]> {
  const params = new URLSearchParams();
  if (opts?.clientId) params.set("client_id", opts.clientId);
  if (opts?.status) params.set("status", opts.status);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<ApiBillingInvoice[]>(`/api/v1/billing/invoices${qs}`);
}

export async function fetchBillingInvoice(id: string): Promise<ApiBillingInvoice> {
  return apiFetch<ApiBillingInvoice>(`/api/v1/billing/invoices/${encodeURIComponent(id)}`);
}

export async function fetchFleetMrr(): Promise<ApiFleetMrrRow[]> {
  return apiFetch<ApiFleetMrrRow[]>("/api/v1/billing/mrr");
}

export async function recordInvoicePayment(
  invoiceId: string,
  externalRef?: string,
): Promise<ApiBillingInvoice> {
  return apiFetch<ApiBillingInvoice>(
    `/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}/record-payment`,
    {
      method: "POST",
      body: JSON.stringify({ external_ref: externalRef ?? null }),
    },
  );
}

export async function seedBillingInvoices(): Promise<{ created: number }> {
  return apiFetch<{ created: number }>("/api/v1/billing/seed", { method: "POST" });
}
