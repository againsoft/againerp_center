import type { ApiBillingInvoice, ApiBillingStats, ApiFleetMrrRow } from "@/lib/api/billing";
import type {
  CenterBillingInvoice,
  CenterClientSubscription,
  CenterInvoiceStatus,
  CenterPlan,
  CenterSubscriptionStatus,
} from "@/lib/mock-data/center";

const PLAN_MAP: Record<string, CenterPlan> = {
  starter: "starter",
  business: "business",
  professional: "business",
  pro: "business",
  enterprise: "enterprise",
  custom: "custom",
};

function mapPlan(plan: string): CenterPlan {
  return PLAN_MAP[plan.toLowerCase()] ?? "starter";
}

function mapSubStatus(status: string): CenterSubscriptionStatus {
  const s = status.toLowerCase();
  if (s === "trial") return "trial";
  if (s === "past_due") return "past_due";
  if (s === "suspended") return "suspended";
  if (s === "cancelled") return "cancelled";
  return "active";
}

function mapInvoiceStatus(status: string): CenterInvoiceStatus {
  const s = status.toLowerCase();
  if (s === "draft") return "draft";
  if (s === "open") return "open";
  if (s === "paid") return "paid";
  if (s === "past_due") return "past_due";
  if (s === "void") return "void";
  if (s === "uncollectible") return "uncollectible";
  return "open";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function apiInvoiceToCenterInvoice(inv: ApiBillingInvoice): CenterBillingInvoice {
  return {
    id: inv.id,
    clientId: inv.client_id,
    businessName: inv.business_name ?? inv.client_id,
    subscriptionId: inv.subscription_id,
    invoiceNumber: inv.invoice_number,
    amount: inv.amount,
    currency: inv.currency,
    status: mapInvoiceStatus(inv.status),
    periodStart: formatDate(inv.period_start),
    periodEnd: formatDate(inv.period_end),
    issuedAt: formatDate(inv.issued_at),
    dueAt: formatDate(inv.due_at),
    paidAt: inv.paid_at ? formatDate(inv.paid_at) : undefined,
    externalRef: inv.external_ref ?? undefined,
    lineItems: inv.line_items.map((l) => ({ label: l.label, amount: l.amount })),
  };
}

export function apiInvoicesToCenterInvoices(invoices: ApiBillingInvoice[]): CenterBillingInvoice[] {
  return invoices.map(apiInvoiceToCenterInvoice);
}

export function apiStatsToCenterBillingStats(stats: ApiBillingStats) {
  return {
    totalMrr: stats.total_mrr,
    openInvoices: stats.open_invoices,
    pastDueAmount: stats.past_due_amount,
    paidThisMonth: stats.paid_this_month,
    invoiceCount: stats.invoice_count,
  };
}

export function apiMrrRowToCenterSubscription(row: ApiFleetMrrRow): CenterClientSubscription {
  return {
    id: row.subscription_id,
    clientId: row.client_id,
    businessName: row.business_name,
    plan: mapPlan(row.plan),
    status: mapSubStatus(row.status),
    billingCycle: row.billing_cycle === "annual" ? "annual" : "monthly",
    periodStart: "—",
    periodEnd: formatDate(row.period_end),
    mrr: row.mrr,
    seatsUsed: 0,
    seatsLimit: 0,
    autoRenew: row.auto_renew,
  };
}

export function apiMrrRowsToCenterSubscriptions(rows: ApiFleetMrrRow[]): CenterClientSubscription[] {
  return rows.map(apiMrrRowToCenterSubscription);
}

export function findPastDueClients(invoices: CenterBillingInvoice[]): string[] {
  return [...new Set(invoices.filter((i) => i.status === "past_due").map((i) => i.businessName))];
}
