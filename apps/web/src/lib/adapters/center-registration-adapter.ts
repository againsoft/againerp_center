import type { ApiRegistration } from "@/lib/api/registrations";
import type {
  CenterDeploymentMode,
  CenterModuleId,
  CenterPlan,
  CenterRegistration,
  CenterRegistrationStatus,
} from "@/lib/mock-data/center";

const PLAN_MAP: Record<string, CenterPlan> = {
  starter: "starter",
  business: "business",
  professional: "business",
  enterprise: "enterprise",
  custom: "custom",
};

const MODULE_IDS = new Set<string>([
  "catalog", "orders", "customers", "inventory", "suppliers",
  "marketing", "configurator", "ai-os", "finance", "crm",
]);

function mapPlan(plan: string): CenterPlan {
  return PLAN_MAP[plan.toLowerCase()] ?? "starter";
}

function mapStatus(status: string): CenterRegistrationStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "pending_review";
}

function mapDeployment(mode: string): CenterDeploymentMode {
  if (mode === "hybrid" || mode === "enterprise") return mode;
  return "saas";
}

function mapModules(modules: string[]): CenterModuleId[] {
  return modules.filter((m): m is CenterModuleId => MODULE_IDS.has(m)) as CenterModuleId[];
}

export function apiRegistrationToCenterRegistration(reg: ApiRegistration): CenterRegistration {
  return {
    id: reg.id,
    businessName: reg.business_name,
    contactName: reg.contact_name,
    contactEmail: reg.contact_email,
    phone: reg.phone ?? "—",
    requestedPlan: mapPlan(reg.requested_plan),
    requestedModules: mapModules(reg.requested_modules),
    wantsAi: reg.wants_ai,
    submittedAt: reg.submitted_at ?? new Date().toISOString(),
    status: mapStatus(reg.status),
    industry: reg.industry ?? "—",
    deploymentMode: mapDeployment(reg.deployment_mode),
    region: reg.region ?? "—",
    website: reg.website ?? undefined,
    employeeCount: reg.employee_count ?? undefined,
    referralSource: reg.referral_source ?? undefined,
    operatorNotes: reg.operator_notes ?? undefined,
    reviewedAt: reg.reviewed_at ?? undefined,
    reviewedBy: reg.reviewed_by ?? undefined,
    rejectionReason: reg.rejection_reason ?? undefined,
  };
}

export function apiRegistrationsToCenterRegistrations(regs: ApiRegistration[]): CenterRegistration[] {
  return regs.map(apiRegistrationToCenterRegistration);
}

export function countPendingRegistrations(regs: ApiRegistration[]): number {
  return regs.filter((r) => r.status === "pending_review").length;
}
