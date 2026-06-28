import type { ApiClient } from "@/lib/api/clients";
import type { ApiSubscription } from "@/lib/api/subscriptions";
import type {
  CenterClientSubscription,
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

function mapStatus(status: string): CenterSubscriptionStatus {
  const s = status.toLowerCase();
  if (s === "trial") return "trial";
  if (s === "past_due") return "past_due";
  if (s === "suspended") return "suspended";
  if (s === "cancelled") return "cancelled";
  return "active";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function apiSubscriptionToCenterSubscription(
  sub: ApiSubscription,
  clientMap: Map<string, ApiClient>,
): CenterClientSubscription {
  const client = clientMap.get(sub.client_id);
  return {
    id: sub.id,
    clientId: sub.client_id,
    businessName: client?.name ?? sub.client_id,
    plan: mapPlan(sub.plan),
    status: mapStatus(sub.status),
    billingCycle: sub.billing_cycle === "annual" ? "annual" : "monthly",
    periodStart: formatDate(sub.current_period_start),
    periodEnd: formatDate(sub.current_period_end),
    mrr: 0,
    seatsUsed: 0,
    seatsLimit: sub.seats_purchased,
    autoRenew: true,
  };
}

export function apiSubscriptionsToCenterSubscriptions(
  subs: ApiSubscription[],
  clients: ApiClient[],
): CenterClientSubscription[] {
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  return subs.map((s) => apiSubscriptionToCenterSubscription(s, clientMap));
}
