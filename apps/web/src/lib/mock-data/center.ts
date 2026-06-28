export type CenterClientStatus = "active" | "trial" | "suspended" | "pending";
export type CenterPlan = "starter" | "business" | "enterprise" | "custom";
export type CenterDbStatus = "connected" | "degraded" | "offline" | "pending";
export type CenterDeploymentMode = "saas" | "hybrid" | "enterprise";
export type CenterRegistrationStatus = "pending_review" | "approved" | "rejected";

export type CenterModuleId =
  | "catalog"
  | "orders"
  | "customers"
  | "inventory"
  | "marketing"
  | "suppliers"
  | "ai-os"
  | "configurator"
  | "reports"
  | "seo"
  | "media";

export interface CenterModuleDefinition {
  id: CenterModuleId;
  label: string;
  description: string;
  tier: "core" | "growth" | "premium";
  dependencies: CenterModuleId[];
  minErpVersion: string;
  platformDefault: boolean;
  featureFlagKey: string;
}

export interface CenterClient {
  id: string;
  businessName: string;
  slug: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  status: CenterClientStatus;
  plan: CenterPlan;
  modules: CenterModuleId[];
  aiEnabled: boolean;
  aiAgentsLimit: number;
  aiTokensUsed: number;
  aiTokensLimit: number;
  registeredAt: string;
  subscriptionEnds: string;
  serverHost: string;
  dbHost: string;
  dbName: string;
  dbStatus: CenterDbStatus;
  adminUrl: string;
  mrr: number;
  country: string;
  deploymentMode: CenterDeploymentMode;
  instanceId: string;
  agentVersion: string;
  erpVersion: string;
  lastHeartbeat: string;
  notes?: string;
}

export interface CenterRegistration {
  id: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  requestedPlan: CenterPlan;
  requestedModules: CenterModuleId[];
  wantsAi: boolean;
  submittedAt: string;
  status: CenterRegistrationStatus;
  industry: string;
  deploymentMode: CenterDeploymentMode;
  region: string;
  website?: string;
  employeeCount?: string;
  referralSource?: string;
  operatorNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface CenterSubscriptionPlan {
  id: CenterPlan;
  label: string;
  priceMonthly: number;
  maxUsers: number;
  includedModules: CenterModuleId[];
  aiIncluded: boolean;
  aiAgentsLimit: number;
  aiCreditsMonthly: number;
  graceDays: number;
  description: string;
}

export type CenterSubscriptionStatus = "active" | "trial" | "past_due" | "suspended" | "cancelled";
export type CenterLicenseStatus = "active" | "grace" | "revoked" | "expired" | "superseded";

export interface CenterClientSubscription {
  id: string;
  clientId: string;
  businessName: string;
  plan: CenterPlan;
  status: CenterSubscriptionStatus;
  billingCycle: "monthly" | "annual";
  periodStart: string;
  periodEnd: string;
  mrr: number;
  seatsUsed: number;
  seatsLimit: number;
  autoRenew: boolean;
}

export interface CenterLicense {
  id: string;
  clientId: string;
  businessName: string;
  plan: CenterPlan;
  status: CenterLicenseStatus;
  licenseKeyMasked: string;
  issuedAt: string;
  expiresAt: string;
  graceDays: number;
  graceEndsAt?: string;
  instanceId: string;
  modulesCount: number;
  aiEnabled: boolean;
  lastSyncedAt: string;
  revokeReason?: string;
}

export interface CenterAgentHeartbeat {
  clientId: string;
  businessName: string;
  instanceId: string;
  deploymentMode: CenterDeploymentMode;
  serverHost: string;
  agentStatus: CenterDbStatus;
  lastHeartbeat: string;
  agentVersion: string;
  erpVersion: string;
  cpuPercent: number;
  ramPercent: number;
  diskPercent: number;
  apiLatencyP95Ms: number;
  dockerHealthy: number;
  dockerTotal: number;
  dbReachable: boolean;
  dbLatencyMs: number;
  redisReachable: boolean;
  queuePendingJobs: number;
}

export interface CenterAgentMetricPoint {
  label: string;
  cpu: number;
  ram: number;
  disk: number;
  apiP95: number;
}

export type CenterMonitoringAlertSeverity = "critical" | "warning" | "info";

export interface CenterMonitoringAlert {
  id: string;
  severity: CenterMonitoringAlertSeverity;
  rule: string;
  title: string;
  detail: string;
  clientId?: string;
  clientName?: string;
  time: string;
  acknowledged: boolean;
}

export type CenterAgentCommandType =
  | "config.reload"
  | "module.enable"
  | "update.apply"
  | "backup.run"
  | "agent.restart"
  | "diagnostics.collect"
  | "container.restart";

export type CenterAgentCommandStatus =
  | "queued"
  | "delivered"
  | "running"
  | "succeeded"
  | "failed"
  | "expired"
  | "cancelled";

export type CenterAgentCommandRisk = "low" | "medium" | "high";

export interface CenterAgentCommand {
  id: string;
  clientId: string;
  businessName: string;
  type: CenterAgentCommandType;
  risk: CenterAgentCommandRisk;
  status: CenterAgentCommandStatus;
  issuedAt: string;
  expiresAt: string;
  deliveredAt?: string;
  completedAt?: string;
  issuedBy: string;
  payloadSummary: string;
  resultSummary?: string;
  signatureValid: boolean;
  correlationId: string;
}

export type CenterActivationBundleStatus = "pending" | "activated" | "expired" | "revoked";

export interface CenterActivationBundle {
  id: string;
  clientId: string;
  businessName: string;
  status: CenterActivationBundleStatus;
  createdAt: string;
  expiresAt: string;
  activatedAt?: string;
  bootstrapTokenPrefix: string;
  createdBy: string;
}

export type CenterAgentConnectivity = "online" | "degraded" | "offline";

export type CenterAgentQueueType = "update" | "ai_request" | "command" | "config";

export interface CenterAgentSyncQueue {
  id: string;
  clientId: string;
  businessName: string;
  connectivity: CenterAgentConnectivity;
  queueType: CenterAgentQueueType;
  pendingCount: number;
  oldestQueuedAt: string;
  graceActive: boolean;
  graceExpiresAt?: string;
  lastFlushAt?: string;
  summary: string;
}

export type CenterDiagnosticStatus =
  | "requested"
  | "collecting"
  | "uploading"
  | "ready"
  | "failed"
  | "expired";

export interface CenterAgentDiagnostic {
  id: string;
  clientId: string;
  businessName: string;
  commandId?: string;
  status: CenterDiagnosticStatus;
  requestedAt: string;
  requestedBy: string;
  bundleSizeMb?: number;
  uploadedAt?: string;
  expiresAt: string;
  bundlePrefix: string;
}

export type CenterUpdateChannel = "stable" | "beta" | "lts" | "hotfix";
export type CenterUpdateType = "hotfix" | "patch" | "minor" | "major";
export type CenterRolloutStage = "canary" | "early" | "tier1" | "tier2" | "ga" | "draft";
export type CenterRolloutStatus = "active" | "paused" | "completed" | "aborted";
export type CenterClientUpdateStatus =
  | "up_to_date"
  | "available"
  | "scheduled"
  | "applying"
  | "validating"
  | "failed"
  | "rolling_back";

export interface CenterErpVersion {
  id: string;
  version: string;
  channel: CenterUpdateChannel;
  type: CenterUpdateType;
  releasedAt: string;
  agentMinVersion: string;
  summary: string;
  rolloutStage: CenterRolloutStage;
  isLatest: boolean;
}

export interface CenterUpdateRollout {
  id: string;
  name: string;
  targetVersion: string;
  channel: CenterUpdateChannel;
  type: CenterUpdateType;
  stage: CenterRolloutStage;
  status: CenterRolloutStatus;
  startedAt: string;
  soakUntil: string;
  clientsTotal: number;
  clientsComplete: number;
  clientsFailed: number;
  clientsPending: number;
}

export interface CenterClientUpdate {
  id: string;
  clientId: string;
  businessName: string;
  currentVersion: string;
  targetVersion: string | null;
  channel: CenterUpdateChannel;
  status: CenterClientUpdateStatus;
  autoUpdate: boolean;
  scheduledAt?: string;
  lastAttempt?: string;
  errorMessage?: string;
  rolloutId?: string;
}

export type CenterBackupType = "full" | "incremental" | "media" | "config" | "pre_update";
export type CenterBackupStatus = "verified" | "completed" | "running" | "failed" | "overdue";
export type CenterBackupStorageTarget = "local" | "client_s3" | "platform_assisted";

export interface CenterClientBackupStatus {
  clientId: string;
  businessName: string;
  plan: CenterPlan;
  lastBackupAt: string;
  lastBackupType: CenterBackupType;
  status: CenterBackupStatus;
  sizeMb: number;
  retentionDays: number;
  scheduleLabel: string;
  storageTarget: CenterBackupStorageTarget;
  verificationEnabled: boolean;
  nextScheduled?: string;
  hoursSinceBackup: number;
  policyMaxAgeHours: number;
  checksumMasked: string;
  errorMessage?: string;
}

export interface CenterBackupRecord {
  id: string;
  clientId: string;
  businessName: string;
  type: CenterBackupType;
  status: CenterBackupStatus;
  startedAt: string;
  completedAt?: string;
  sizeMb: number;
  checksumMasked: string;
  storageTarget: CenterBackupStorageTarget;
  verifiedAt?: string;
  errorMessage?: string;
}

export type CenterAiAccessStatus = "active" | "disabled" | "suspended" | "pending";
export type CenterAiCreditStatus = "ok" | "warning" | "exceeded" | "none";
export type CenterPlatformAiAgentId =
  | "chief"
  | "health"
  | "recommendation"
  | "update"
  | "license"
  | "monitoring"
  | "automation";

export interface CenterClientAiAccess {
  clientId: string;
  businessName: string;
  plan: CenterPlan;
  clientStatus: CenterClientStatus;
  aiEnabled: boolean;
  accessStatus: CenterAiAccessStatus;
  agentsLimit: number;
  agentsActive: number;
  creditsMonthly: number;
  creditsUsed: number;
  creditsStatus: CenterAiCreditStatus;
  toolsEnabled: string[];
  lastAiRequest?: string;
  proxyMode: "cloud" | "queued";
}

export interface CenterAiRecommendation {
  id: string;
  agent: CenterPlatformAiAgentId;
  title: string;
  detail: string;
  clientId?: string;
  clientName?: string;
  severity: "info" | "warning" | "action";
  dismissed: boolean;
}

export interface CenterPlatformAiAgent {
  id: CenterPlatformAiAgentId;
  label: string;
  description: string;
  autonomy: string;
  status: "active" | "idle";
}

export interface CenterChiefBriefingInsight {
  id: string;
  source: CenterPlatformAiAgentId;
  text: string;
  href?: string;
  hrefLabel?: string;
}

export interface CenterChiefAiBriefing {
  generatedAt: string;
  summary: string;
  insights: CenterChiefBriefingInsight[];
  creditNote?: string;
}

export type CenterInvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "past_due"
  | "void"
  | "uncollectible";

export interface CenterBillingInvoiceLine {
  label: string;
  amount: number;
}

export interface CenterBillingInvoice {
  id: string;
  clientId: string;
  businessName: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: CenterInvoiceStatus;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  externalRef?: string;
  lineItems: CenterBillingInvoiceLine[];
}

export type CenterAuditActorType = "operator" | "system" | "agent";
export type CenterAuditResourceType =
  | "client"
  | "registration"
  | "subscription"
  | "license"
  | "module"
  | "update"
  | "backup"
  | "billing"
  | "agent"
  | "ai"
  | "security";

export interface CenterAuditLogEntry {
  id: string;
  timestamp: string;
  actorType: CenterAuditActorType;
  actorId: string;
  actorLabel: string;
  action: string;
  resourceType: CenterAuditResourceType;
  resourceId: string;
  clientId?: string;
  clientName?: string;
  correlationId: string;
  ipAddress?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

export type CenterOperatorRole =
  | "super_admin"
  | "platform_admin"
  | "support_agent"
  | "billing_admin"
  | "read_only"
  | "partner_admin";

export type CenterOperatorStatus = "active" | "invited" | "disabled";

export interface CenterOperator {
  id: string;
  name: string;
  email: string;
  role: CenterOperatorRole;
  status: CenterOperatorStatus;
  mfaEnabled: boolean;
  mfaType?: "totp" | "webauthn" | "hardware";
  lastLogin?: string;
  ipAllowlist?: string;
  createdAt: string;
}

export type CenterApiKeyOwnerType = "operator" | "partner" | "integration";
export type CenterApiKeyStatus = "active" | "revoked" | "expired";

export interface CenterApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  ownerType: CenterApiKeyOwnerType;
  ownerLabel: string;
  scopes: string[];
  status: CenterApiKeyStatus;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

export interface CenterPlatformSettings {
  platformName: string;
  defaultGraceDays: number;
  maintenanceWindow: string;
  alertEmail: string;
  requireMfaAllOperators: boolean;
  agentHeartbeatIntervalSec: number;
  auditRetentionYears: number;
  defaultUpdateChannel: "stable" | "beta" | "lts";
}

export const centerModules: CenterModuleDefinition[] = [
  {
    id: "catalog",
    label: "Catalog",
    description: "Products, categories, brands, variants",
    tier: "core",
    dependencies: [],
    minErpVersion: "2026.1.0",
    platformDefault: true,
    featureFlagKey: "module.catalog",
  },
  {
    id: "orders",
    label: "Orders",
    description: "Order management, payments, shipments",
    tier: "core",
    dependencies: ["catalog", "customers"],
    minErpVersion: "2026.1.0",
    platformDefault: true,
    featureFlagKey: "module.orders",
  },
  {
    id: "customers",
    label: "Customers",
    description: "CRM, segments, support",
    tier: "core",
    dependencies: [],
    minErpVersion: "2026.1.0",
    platformDefault: true,
    featureFlagKey: "module.customers",
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock, warehouses, alerts",
    tier: "core",
    dependencies: ["catalog"],
    minErpVersion: "2026.2.0",
    platformDefault: true,
    featureFlagKey: "module.inventory",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Campaigns, coupons, journeys",
    tier: "growth",
    dependencies: ["catalog", "customers"],
    minErpVersion: "2026.3.0",
    platformDefault: false,
    featureFlagKey: "module.marketing",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    description: "PO, RFQ, vendor management",
    tier: "growth",
    dependencies: ["inventory"],
    minErpVersion: "2026.3.0",
    platformDefault: false,
    featureFlagKey: "module.suppliers",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Meta, schema, sitemap",
    tier: "growth",
    dependencies: ["catalog"],
    minErpVersion: "2026.4.0",
    platformDefault: false,
    featureFlagKey: "module.seo",
  },
  {
    id: "media",
    label: "Media",
    description: "Asset library & CDN",
    tier: "growth",
    dependencies: [],
    minErpVersion: "2026.2.0",
    platformDefault: true,
    featureFlagKey: "module.media",
  },
  {
    id: "configurator",
    label: "Configurator",
    description: "PC builder & product configurator",
    tier: "premium",
    dependencies: ["catalog", "inventory"],
    minErpVersion: "2026.5.0",
    platformDefault: false,
    featureFlagKey: "module.configurator",
  },
  {
    id: "reports",
    label: "Reports",
    description: "Analytics & exports",
    tier: "premium",
    dependencies: ["orders"],
    minErpVersion: "2026.4.0",
    platformDefault: false,
    featureFlagKey: "module.reports",
  },
  {
    id: "ai-os",
    label: "AI OS",
    description: "Agents, tools, approvals, audit",
    tier: "premium",
    dependencies: ["catalog"],
    minErpVersion: "2026.6.0",
    platformDefault: false,
    featureFlagKey: "module.ai_os",
  },
];

export const centerPlans: CenterSubscriptionPlan[] = [
  {
    id: "starter",
    label: "Starter",
    priceMonthly: 4999,
    maxUsers: 5,
    includedModules: ["catalog", "orders", "customers"],
    aiIncluded: false,
    aiAgentsLimit: 0,
    aiCreditsMonthly: 0,
    graceDays: 7,
    description: "Essential commerce for small shops",
  },
  {
    id: "business",
    label: "Business",
    priceMonthly: 14999,
    maxUsers: 20,
    includedModules: ["catalog", "orders", "customers", "inventory", "marketing", "media"],
    aiIncluded: false,
    aiAgentsLimit: 0,
    aiCreditsMonthly: 10000,
    graceDays: 14,
    description: "Growing retailers with marketing needs",
  },
  {
    id: "enterprise",
    label: "Enterprise",
    priceMonthly: 34999,
    maxUsers: 100,
    includedModules: [
      "catalog",
      "orders",
      "customers",
      "inventory",
      "marketing",
      "suppliers",
      "seo",
      "media",
      "reports",
    ],
    aiIncluded: true,
    aiAgentsLimit: 5,
    aiCreditsMonthly: 50000,
    graceDays: 14,
    description: "Full ERP minus configurator",
  },
  {
    id: "custom",
    label: "Custom",
    priceMonthly: 0,
    maxUsers: 999,
    includedModules: centerModules.map((m) => m.id),
    aiIncluded: true,
    aiAgentsLimit: 50,
    aiCreditsMonthly: 2000000,
    graceDays: 30,
    description: "Tailored module & AI limits per contract",
  },
];

export const centerClientSubscriptions: CenterClientSubscription[] = [
  {
    id: "sub-001",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    plan: "enterprise",
    status: "active",
    billingCycle: "annual",
    periodStart: "2025-11-12",
    periodEnd: "2026-11-12",
    mrr: 34999,
    seatsUsed: 12,
    seatsLimit: 100,
    autoRenew: true,
  },
  {
    id: "sub-002",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    plan: "custom",
    status: "active",
    billingCycle: "monthly",
    periodStart: "2026-06-01",
    periodEnd: "2026-07-01",
    mrr: 52000,
    seatsUsed: 34,
    seatsLimit: 999,
    autoRenew: true,
  },
  {
    id: "sub-003",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    plan: "business",
    status: "trial",
    billingCycle: "monthly",
    periodStart: "2026-06-01",
    periodEnd: "2026-07-01",
    mrr: 0,
    seatsUsed: 4,
    seatsLimit: 20,
    autoRenew: false,
  },
  {
    id: "sub-004",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    plan: "starter",
    status: "past_due",
    billingCycle: "monthly",
    periodStart: "2026-03-20",
    periodEnd: "2026-04-20",
    mrr: 4999,
    seatsUsed: 3,
    seatsLimit: 5,
    autoRenew: true,
  },
  {
    id: "sub-005",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    plan: "enterprise",
    status: "active",
    billingCycle: "annual",
    periodStart: "2026-01-15",
    periodEnd: "2027-01-15",
    mrr: 34999,
    seatsUsed: 18,
    seatsLimit: 100,
    autoRenew: true,
  },
];

export const centerLicenses: CenterLicense[] = [
  {
    id: "lic-001",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    plan: "enterprise",
    status: "active",
    licenseKeyMasked: "AGP-7K2M-****-R9P4",
    issuedAt: "2025-11-12",
    expiresAt: "2026-11-12",
    graceDays: 14,
    instanceId: "inst_urbanwear_001",
    modulesCount: 7,
    aiEnabled: true,
    lastSyncedAt: "2 min ago",
  },
  {
    id: "lic-002",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    plan: "custom",
    status: "active",
    licenseKeyMasked: "AGP-X9PL-****-H2W8",
    issuedAt: "2025-08-03",
    expiresAt: "2026-08-03",
    graceDays: 30,
    instanceId: "inst_techzone_001",
    modulesCount: 11,
    aiEnabled: true,
    lastSyncedAt: "45 sec ago",
  },
  {
    id: "lic-003",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    plan: "business",
    status: "active",
    licenseKeyMasked: "AGP-T4RN-****-M1Q7",
    issuedAt: "2026-06-01",
    expiresAt: "2026-07-01",
    graceDays: 14,
    instanceId: "inst_freshmart_001",
    modulesCount: 5,
    aiEnabled: false,
    lastSyncedAt: "3 min ago",
  },
  {
    id: "lic-004",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    plan: "starter",
    status: "grace",
    licenseKeyMasked: "AGP-STYL-****-F4N2",
    issuedAt: "2025-03-20",
    expiresAt: "2026-03-20",
    graceDays: 7,
    graceEndsAt: "2026-03-27",
    instanceId: "inst_stylehub_001",
    modulesCount: 3,
    aiEnabled: false,
    lastSyncedAt: "—",
    revokeReason: "Payment overdue — grace period active",
  },
  {
    id: "lic-005",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    plan: "enterprise",
    status: "active",
    licenseKeyMasked: "AGP-BLD7-****-K3S9",
    issuedAt: "2026-01-15",
    expiresAt: "2027-01-15",
    graceDays: 14,
    instanceId: "inst_buildpro_001",
    modulesCount: 7,
    aiEnabled: false,
    lastSyncedAt: "8 min ago",
  },
];

export const centerClients: CenterClient[] = [
  {
    id: "cl-001",
    businessName: "UrbanWear Retail",
    slug: "urbanwear",
    contactName: "Rahim Ahmed",
    contactEmail: "rahim@urbanwear.bd",
    phone: "+880 1711-223344",
    status: "active",
    plan: "enterprise",
    modules: ["catalog", "orders", "customers", "inventory", "marketing", "ai-os", "reports"],
    aiEnabled: true,
    aiAgentsLimit: 8,
    aiTokensUsed: 142000,
    aiTokensLimit: 500000,
    registeredAt: "2025-11-12",
    subscriptionEnds: "2026-11-12",
    serverHost: "erp.urbanwear.bd",
    dbHost: "db.urbanwear.bd:5432",
    dbName: "urbanwear_erp",
    dbStatus: "connected",
    adminUrl: "https://erp.urbanwear.bd/admin",
    mrr: 34999,
    country: "Bangladesh",
    deploymentMode: "enterprise",
    instanceId: "inst_urbanwear_001",
    agentVersion: "1.2.0",
    erpVersion: "2026.6.1",
    lastHeartbeat: "1 min ago",
  },
  {
    id: "cl-002",
    businessName: "TechZone Computers",
    slug: "techzone",
    contactName: "Sadia Khan",
    contactEmail: "sadia@techzone.com.bd",
    phone: "+880 1812-556677",
    status: "active",
    plan: "custom",
    modules: centerModules.map((m) => m.id),
    aiEnabled: true,
    aiAgentsLimit: 15,
    aiTokensUsed: 890000,
    aiTokensLimit: 2000000,
    registeredAt: "2025-08-03",
    subscriptionEnds: "2026-08-03",
    serverHost: "app.techzone.com.bd",
    dbHost: "10.0.4.12:5432",
    dbName: "techzone_prod",
    dbStatus: "connected",
    adminUrl: "https://app.techzone.com.bd/dashboard",
    mrr: 52000,
    country: "Bangladesh",
    deploymentMode: "enterprise",
    instanceId: "inst_techzone_001",
    agentVersion: "1.2.0",
    erpVersion: "2026.6.1",
    lastHeartbeat: "45 sec ago",
    notes: "On-prem server — enterprise deployment",
  },
  {
    id: "cl-003",
    businessName: "FreshMart Grocery",
    slug: "freshmart",
    contactName: "Karim Hossain",
    contactEmail: "karim@freshmart.bd",
    phone: "+880 1911-889900",
    status: "trial",
    plan: "business",
    modules: ["catalog", "orders", "customers", "inventory", "marketing"],
    aiEnabled: false,
    aiAgentsLimit: 0,
    aiTokensUsed: 0,
    aiTokensLimit: 0,
    registeredAt: "2026-06-01",
    subscriptionEnds: "2026-07-01",
    serverHost: "freshmart.moharaz.cloud",
    dbHost: "pg.moharaz.cloud:5432",
    dbName: "freshmart_trial",
    dbStatus: "connected",
    adminUrl: "https://freshmart.moharaz.cloud/dashboard",
    mrr: 0,
    country: "Bangladesh",
    deploymentMode: "hybrid",
    instanceId: "inst_freshmart_001",
    agentVersion: "1.1.8",
    erpVersion: "2026.5.2",
    lastHeartbeat: "3 min ago",
  },
  {
    id: "cl-004",
    businessName: "StyleHub Fashion",
    slug: "stylehub",
    contactName: "Nusrat Jahan",
    contactEmail: "hello@stylehub.fashion",
    phone: "+880 1611-334455",
    status: "suspended",
    plan: "starter",
    modules: ["catalog", "orders", "customers"],
    aiEnabled: false,
    aiAgentsLimit: 0,
    aiTokensUsed: 0,
    aiTokensLimit: 0,
    registeredAt: "2025-03-20",
    subscriptionEnds: "2026-03-20",
    serverHost: "stylehub.moharaz.cloud",
    dbHost: "pg.moharaz.cloud:5432",
    dbName: "stylehub_erp",
    dbStatus: "offline",
    adminUrl: "https://stylehub.moharaz.cloud/dashboard",
    mrr: 4999,
    country: "Bangladesh",
    deploymentMode: "hybrid",
    instanceId: "inst_stylehub_001",
    agentVersion: "1.2.0",
    erpVersion: "2026.6.0",
    lastHeartbeat: "—",
    notes: "Payment overdue — license suspended, agent offline",
  },
  {
    id: "cl-005",
    businessName: "BuildPro Hardware",
    slug: "buildpro",
    contactName: "Tanvir Islam",
    contactEmail: "ops@buildpro.bd",
    phone: "+880 1511-667788",
    status: "active",
    plan: "enterprise",
    modules: [
      "catalog",
      "orders",
      "customers",
      "inventory",
      "suppliers",
      "configurator",
      "reports",
    ],
    aiEnabled: false,
    aiAgentsLimit: 0,
    aiTokensUsed: 0,
    aiTokensLimit: 0,
    registeredAt: "2026-01-15",
    subscriptionEnds: "2027-01-15",
    serverHost: "erp.buildpro.bd",
    dbHost: "db.buildpro.local:5432",
    dbName: "buildpro_erp",
    dbStatus: "degraded",
    adminUrl: "https://erp.buildpro.bd/dashboard",
    mrr: 34999,
    country: "Bangladesh",
    deploymentMode: "enterprise",
    instanceId: "inst_buildpro_001",
    agentVersion: "1.2.0",
    erpVersion: "2026.6.1",
    lastHeartbeat: "8 min ago",
    notes: "Agent heartbeat degraded — high server latency",
  },
];

export const centerRegistrations: CenterRegistration[] = [
  {
    id: "reg-101",
    businessName: "GreenLeaf Organics",
    contactName: "Ayesha Rahman",
    contactEmail: "ayesha@greenleaf.bd",
    phone: "+880 1712-990011",
    requestedPlan: "business",
    requestedModules: ["catalog", "orders", "customers", "inventory", "marketing"],
    wantsAi: true,
    submittedAt: "2026-06-26T09:14:00",
    status: "pending_review",
    industry: "Grocery & Organic",
    deploymentMode: "hybrid",
    region: "Asia/Dhaka",
    website: "https://greenleaf.bd",
    employeeCount: "11–25",
    referralSource: "Partner — AgroHub",
  },
  {
    id: "reg-102",
    businessName: "Nova Electronics",
    contactName: "Imran Chowdhury",
    contactEmail: "imran@novaelectronics.com",
    phone: "+880 1813-445566",
    requestedPlan: "enterprise",
    requestedModules: [
      "catalog",
      "orders",
      "customers",
      "inventory",
      "suppliers",
      "configurator",
      "ai-os",
    ],
    wantsAi: true,
    submittedAt: "2026-06-25T14:30:00",
    status: "pending_review",
    industry: "Consumer Electronics",
    deploymentMode: "enterprise",
    region: "Asia/Dhaka",
    website: "https://novaelectronics.com",
    employeeCount: "50+",
    referralSource: "Direct sales",
    operatorNotes: "Requires configurator + AI — verify enterprise quote attached.",
  },
  {
    id: "reg-103",
    businessName: "CraftCorner BD",
    contactName: "Mira Das",
    contactEmail: "mira@craftcorner.bd",
    phone: "+880 1914-778899",
    requestedPlan: "starter",
    requestedModules: ["catalog", "orders", "customers"],
    wantsAi: false,
    submittedAt: "2026-06-24T11:05:00",
    status: "approved",
    industry: "Handicrafts",
    deploymentMode: "hybrid",
    region: "Asia/Dhaka",
    reviewedAt: "2026-06-24T15:20:00",
    reviewedBy: "Super Admin",
  },
  {
    id: "reg-104",
    businessName: "QuickShip Logistics",
    contactName: "Farhan Ali",
    contactEmail: "farhan@quickship.bd",
    phone: "+880 1612-334455",
    requestedPlan: "business",
    requestedModules: ["catalog", "orders", "customers", "inventory"],
    wantsAi: false,
    submittedAt: "2026-06-20T08:45:00",
    status: "rejected",
    industry: "Logistics",
    deploymentMode: "saas",
    region: "Asia/Dhaka",
    reviewedAt: "2026-06-21T10:00:00",
    reviewedBy: "Platform Admin",
    rejectionReason: "Business model outside current AgainERP commerce focus.",
  },
];

export const centerKpis = [
  { label: "Active Clients", value: "42", change: "+3 this month", up: true },
  { label: "Monthly Revenue", value: "৳8.4L", change: "+18.2%", up: true },
  { label: "AI Enabled", value: "12 / 42", change: "28.6%", up: true },
  { label: "Pending Signups", value: "2", change: "Needs review", up: false },
];

export type CenterDashboardAlertSeverity = "info" | "warning" | "critical";

export interface CenterDashboardAlert {
  id: string;
  severity: CenterDashboardAlertSeverity;
  title: string;
  detail: string;
  href: string;
  time: string;
}

export type CenterNotificationCategory =
  | "agent"
  | "registration"
  | "billing"
  | "security"
  | "update"
  | "system";

export interface CenterPlatformNotification {
  id: string;
  category: CenterNotificationCategory;
  severity: CenterDashboardAlertSeverity;
  title: string;
  body: string;
  href: string;
  time: string;
}

export interface CenterDashboardActivity {
  id: string;
  time: string;
  client: string;
  clientId?: string;
  action: string;
  actor: string;
  category: "license" | "registration" | "billing" | "agent" | "update" | "ai" | "module";
}

export const centerDashboardAlerts: CenterDashboardAlert[] = [
  {
    id: "alert-1",
    severity: "critical",
    title: "StyleHub Fashion suspended",
    detail: "Payment overdue — client in read-only mode",
    href: "/center/clients/cl-004",
    time: "1d ago",
  },
  {
    id: "alert-2",
    severity: "warning",
    title: "BuildPro Hardware agent degraded",
    detail: "Heartbeat latency 820ms — investigate infrastructure",
    href: "/center/monitoring?client=cl-005",
    time: "1d ago",
  },
  {
    id: "alert-3",
    severity: "warning",
    title: "2 registrations awaiting review",
    detail: "Approve or reject before onboarding",
    href: "/center/registrations",
    time: "5h ago",
  },
  {
    id: "alert-4",
    severity: "info",
    title: "FreshMart trial ends in 12 days",
    detail: "Business plan trial — renewal reminder scheduled",
    href: "/center/clients/cl-003",
    time: "Today",
  },
];

export const centerPlatformNotifications: CenterPlatformNotification[] = [
  {
    id: "ntf-1",
    category: "billing",
    severity: "critical",
    title: "StyleHub Fashion suspended",
    body: "Payment overdue — client in read-only mode until invoice cleared.",
    href: "/center/clients/cl-004",
    time: "1d ago",
  },
  {
    id: "ntf-2",
    category: "agent",
    severity: "warning",
    title: "BuildPro agent degraded",
    body: "Heartbeat latency 820ms and queue backlog — review monitoring.",
    href: "/center/monitoring?client=cl-005",
    time: "1d ago",
  },
  {
    id: "ntf-3",
    category: "registration",
    severity: "warning",
    title: "2 registrations awaiting review",
    body: "FreshMart Grocery and Nova Electronics pending operator approval.",
    href: "/center/registrations",
    time: "5h ago",
  },
  {
    id: "ntf-4",
    category: "update",
    severity: "info",
    title: "2026.6.1 rollout at 78%",
    body: "Tier-1 stage progressing — zero rollbacks reported so far.",
    href: "/center/updates",
    time: "3h ago",
  },
  {
    id: "ntf-5",
    category: "agent",
    severity: "critical",
    title: "StyleHub agent offline",
    body: "No heartbeat for 18h — 3 commands buffered in sync queue.",
    href: "/center/agents?tab=sync&client=cl-004",
    time: "1d ago",
  },
  {
    id: "ntf-6",
    category: "security",
    severity: "warning",
    title: "API key rotation reminder",
    body: "Partner integration key expires in 7 days — rotate before cutoff.",
    href: "/center/settings/api-keys",
    time: "Today",
  },
  {
    id: "ntf-7",
    category: "billing",
    severity: "info",
    title: "UrbanWear invoice due soon",
    body: "INV-2026-06-0041 due in 3 days — enterprise plan renewal.",
    href: "/center/billing",
    time: "Today",
  },
  {
    id: "ntf-8",
    category: "system",
    severity: "info",
    title: "Chief AI briefing ready",
    body: "Daily fleet synthesis available on platform dashboard.",
    href: "/center",
    time: "Today",
  },
];

export const centerRecentActivity: CenterDashboardActivity[] = [
  {
    id: "act-1",
    time: "2h ago",
    client: "TechZone Computers",
    clientId: "cl-002",
    action: "AI agents limit increased to 15",
    actor: "Super Admin",
    category: "ai",
  },
  {
    id: "act-2",
    time: "5h ago",
    client: "GreenLeaf Organics",
    action: "New registration submitted",
    actor: "System",
    category: "registration",
  },
  {
    id: "act-3",
    time: "1d ago",
    client: "StyleHub Fashion",
    clientId: "cl-004",
    action: "Account suspended — payment overdue",
    actor: "Billing Bot",
    category: "billing",
  },
  {
    id: "act-4",
    time: "1d ago",
    client: "BuildPro Hardware",
    clientId: "cl-005",
    action: "Agent heartbeat degraded — high latency",
    actor: "Monitoring AI",
    category: "agent",
  },
  {
    id: "act-5",
    time: "2d ago",
    client: "FreshMart Grocery",
    clientId: "cl-003",
    action: "Trial started — Business plan",
    actor: "Super Admin",
    category: "license",
  },
  {
    id: "act-6",
    time: "3d ago",
    client: "UrbanWear Retail",
    clientId: "cl-001",
    action: "Module enabled: reports",
    actor: "Super Admin",
    category: "module",
  },
];

function buildAgentHeartbeat(client: CenterClient): CenterAgentHeartbeat {
  const online = client.dbStatus === "connected";
  const degraded = client.dbStatus === "degraded";
  const offline = client.dbStatus === "offline";

  return {
    clientId: client.id,
    businessName: client.businessName,
    instanceId: client.instanceId,
    deploymentMode: client.deploymentMode,
    serverHost: client.serverHost,
    agentStatus: client.dbStatus,
    lastHeartbeat: offline ? "—" : client.lastHeartbeat,
    agentVersion: client.agentVersion,
    erpVersion: client.erpVersion,
    cpuPercent: offline ? 0 : degraded ? 78 : client.id === "cl-002" ? 42 : 28,
    ramPercent: offline ? 0 : degraded ? 88 : client.id === "cl-002" ? 61 : 52,
    diskPercent: offline ? 0 : degraded ? 72 : client.id === "cl-002" ? 58 : 41,
    apiLatencyP95Ms: offline ? 0 : degraded ? 820 : client.id === "cl-002" ? 120 : 65,
    dockerHealthy: offline ? 0 : degraded ? 4 : 6,
    dockerTotal: 6,
    dbReachable: online || degraded,
    dbLatencyMs: offline ? 0 : degraded ? 820 : 45,
    redisReachable: online || degraded,
    queuePendingJobs: offline ? 0 : degraded ? 142 : client.id === "cl-002" ? 8 : 2,
  };
}

export const centerAgentHeartbeats: CenterAgentHeartbeat[] =
  centerClients.map(buildAgentHeartbeat);

export const centerMonitoringAlerts: CenterMonitoringAlert[] = [
  {
    id: "mon-1",
    severity: "critical",
    rule: "agent.offline",
    title: "StyleHub Fashion agent offline",
    detail: "No heartbeat for 18h — license suspended, investigate host",
    clientId: "cl-004",
    clientName: "StyleHub Fashion",
    time: "1d ago",
    acknowledged: false,
  },
  {
    id: "mon-2",
    severity: "warning",
    rule: "agent.degraded",
    title: "BuildPro Hardware high latency",
    detail: "API p95 820ms · RAM 88% — agent-reported infrastructure stress",
    clientId: "cl-005",
    clientName: "BuildPro Hardware",
    time: "1d ago",
    acknowledged: false,
  },
  {
    id: "mon-3",
    severity: "warning",
    rule: "queue.backlog",
    title: "BuildPro queue backlog",
    detail: "142 pending jobs — review worker containers",
    clientId: "cl-005",
    clientName: "BuildPro Hardware",
    time: "6h ago",
    acknowledged: false,
  },
  {
    id: "mon-4",
    severity: "info",
    rule: "disk.warning",
    title: "TechZone disk approaching threshold",
    detail: "Disk 58% used — no action required yet",
    clientId: "cl-002",
    clientName: "TechZone Computers",
    time: "Today",
    acknowledged: true,
  },
];

export const centerAgentCommands: CenterAgentCommand[] = [
  {
    id: "cmd-001",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    type: "update.apply",
    risk: "high",
    status: "running",
    issuedAt: "2026-06-28T08:15:00Z",
    expiresAt: "2026-06-28T10:15:00Z",
    deliveredAt: "2026-06-28T08:16:12Z",
    issuedBy: "Update Service",
    payloadSummary: "version 2026.6.1 · channel stable · pre-backup required",
    signatureValid: true,
    correlationId: "corr-upd-20260628-001",
  },
  {
    id: "cmd-002",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    type: "backup.run",
    risk: "medium",
    status: "succeeded",
    issuedAt: "2026-06-28T02:00:00Z",
    expiresAt: "2026-06-28T04:00:00Z",
    deliveredAt: "2026-06-28T02:00:45Z",
    completedAt: "2026-06-28T02:18:30Z",
    issuedBy: "Backup Service",
    payloadSummary: "scheduled nightly · encrypt · verify checksum",
    resultSummary: "2.4 GB · 18m duration · verification passed",
    signatureValid: true,
    correlationId: "corr-bak-20260628-001",
  },
  {
    id: "cmd-003",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    type: "module.enable",
    risk: "medium",
    status: "queued",
    issuedAt: "2026-06-28T09:30:00Z",
    expiresAt: "2026-06-28T11:30:00Z",
    issuedBy: "Module Service",
    payloadSummary: "module inventory_pro · entitlement verified",
    signatureValid: true,
    correlationId: "corr-mod-20260628-003",
  },
  {
    id: "cmd-004",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    type: "diagnostics.collect",
    risk: "low",
    status: "delivered",
    issuedAt: "2026-06-28T09:45:00Z",
    expiresAt: "2026-06-28T11:45:00Z",
    deliveredAt: "2026-06-28T09:46:02Z",
    issuedBy: "support@againsoft.io",
    payloadSummary: "bundle: docker logs + agent config redacted",
    signatureValid: true,
    correlationId: "corr-diag-20260628-004",
  },
  {
    id: "cmd-005",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    type: "config.reload",
    risk: "low",
    status: "succeeded",
    issuedAt: "2026-06-27T14:20:00Z",
    expiresAt: "2026-06-27T16:20:00Z",
    deliveredAt: "2026-06-27T14:20:18Z",
    completedAt: "2026-06-27T14:20:22Z",
    issuedBy: "Config Service",
    payloadSummary: "feature flags v1842 · delta patch",
    resultSummary: "config_version 1842 applied",
    signatureValid: true,
    correlationId: "corr-cfg-20260627-005",
  },
  {
    id: "cmd-006",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    type: "agent.restart",
    risk: "medium",
    status: "failed",
    issuedAt: "2026-06-27T10:00:00Z",
    expiresAt: "2026-06-27T12:00:00Z",
    issuedBy: "support@againsoft.io",
    payloadSummary: "graceful restart · preserve queue",
    resultSummary: "Agent offline — command not delivered before expiry",
    signatureValid: true,
    correlationId: "corr-agt-20260627-006",
  },
  {
    id: "cmd-007",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    type: "container.restart",
    risk: "high",
    status: "queued",
    issuedAt: "2026-06-28T10:00:00Z",
    expiresAt: "2026-06-28T12:00:00Z",
    issuedBy: "support@againsoft.io",
    payloadSummary: "service queue-worker · operator approval pending",
    signatureValid: true,
    correlationId: "corr-cnt-20260628-007",
  },
  {
    id: "cmd-008",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    type: "update.apply",
    risk: "high",
    status: "expired",
    issuedAt: "2026-06-25T08:00:00Z",
    expiresAt: "2026-06-25T10:00:00Z",
    issuedBy: "Update Service",
    payloadSummary: "version 2026.6.0 · superseded by retry",
    resultSummary: "Never delivered — agent degraded during window",
    signatureValid: true,
    correlationId: "corr-upd-20260625-008",
  },
];

export const centerActivationBundles: CenterActivationBundle[] = [
  {
    id: "act-001",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    status: "pending",
    createdAt: "2026-06-27T11:00:00Z",
    expiresAt: "2026-06-28T11:00:00Z",
    bootstrapTokenPrefix: "bst_fresh_7k2…",
    createdBy: "platform@againsoft.io",
  },
  {
    id: "act-002",
    clientId: "cl-006",
    businessName: "Nova Electronics",
    status: "pending",
    createdAt: "2026-06-28T08:30:00Z",
    expiresAt: "2026-06-29T08:30:00Z",
    bootstrapTokenPrefix: "bst_nova_9m1…",
    createdBy: "platform@againsoft.io",
  },
  {
    id: "act-003",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    status: "activated",
    createdAt: "2026-05-10T09:00:00Z",
    expiresAt: "2026-05-11T09:00:00Z",
    activatedAt: "2026-05-10T09:42:00Z",
    bootstrapTokenPrefix: "bst_tech_4x8…",
    createdBy: "platform@againsoft.io",
  },
  {
    id: "act-004",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    status: "activated",
    createdAt: "2026-04-02T14:00:00Z",
    expiresAt: "2026-04-03T14:00:00Z",
    activatedAt: "2026-04-02T14:28:00Z",
    bootstrapTokenPrefix: "bst_urban_2p5…",
    createdBy: "platform@againsoft.io",
  },
  {
    id: "act-005",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    status: "expired",
    createdAt: "2026-06-20T10:00:00Z",
    expiresAt: "2026-06-21T10:00:00Z",
    bootstrapTokenPrefix: "bst_style_1a3…",
    createdBy: "support@againsoft.io",
  },
];

export const centerAgentSyncQueues: CenterAgentSyncQueue[] = [
  {
    id: "sync-001",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    connectivity: "offline",
    queueType: "command",
    pendingCount: 3,
    oldestQueuedAt: "2026-06-27T18:00:00Z",
    graceActive: true,
    graceExpiresAt: "2026-07-01T00:00:00Z",
    summary: "Agent offline — 3 signed commands buffered until reconnect",
  },
  {
    id: "sync-002",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    connectivity: "degraded",
    queueType: "update",
    pendingCount: 1,
    oldestQueuedAt: "2026-06-28T07:30:00Z",
    graceActive: true,
    graceExpiresAt: "2026-07-12T00:00:00Z",
    lastFlushAt: "2026-06-27T22:10:00Z",
    summary: "2026.6.1 update queued — apply on next stable heartbeat window",
  },
  {
    id: "sync-003",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    connectivity: "online",
    queueType: "ai_request",
    pendingCount: 12,
    oldestQueuedAt: "2026-06-28T09:55:00Z",
    graceActive: false,
    lastFlushAt: "2026-06-28T09:58:00Z",
    summary: "12 AI proxy requests flushing — cloud proxy reachable",
  },
  {
    id: "sync-004",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    connectivity: "degraded",
    queueType: "config",
    pendingCount: 2,
    oldestQueuedAt: "2026-06-28T08:00:00Z",
    graceActive: true,
    graceExpiresAt: "2026-07-03T00:00:00Z",
    summary: "Feature flag delta v1843 — cached locally until sync completes",
  },
  {
    id: "sync-005",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    connectivity: "online",
    queueType: "ai_request",
    pendingCount: 0,
    oldestQueuedAt: "2026-06-28T10:00:00Z",
    graceActive: false,
    lastFlushAt: "2026-06-28T10:05:00Z",
    summary: "Queue empty — all AI requests delivered via cloud proxy",
  },
];

export const centerAgentDiagnostics: CenterAgentDiagnostic[] = [
  {
    id: "diag-001",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    commandId: "cmd-004",
    status: "collecting",
    requestedAt: "2026-06-28T09:45:00Z",
    requestedBy: "support@againsoft.io",
    expiresAt: "2026-06-29T09:45:00Z",
    bundlePrefix: "diag_fresh_20260628…",
  },
  {
    id: "diag-002",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    status: "ready",
    requestedAt: "2026-06-27T16:00:00Z",
    requestedBy: "Monitoring AI",
    bundleSizeMb: 48,
    uploadedAt: "2026-06-27T16:22:00Z",
    expiresAt: "2026-07-04T16:22:00Z",
    bundlePrefix: "diag_build_20260627…",
  },
  {
    id: "diag-003",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    status: "failed",
    requestedAt: "2026-06-26T11:00:00Z",
    requestedBy: "support@againsoft.io",
    expiresAt: "2026-06-27T11:00:00Z",
    bundlePrefix: "diag_style_20260626…",
  },
  {
    id: "diag-004",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    status: "ready",
    requestedAt: "2026-06-25T08:30:00Z",
    requestedBy: "support@againsoft.io",
    bundleSizeMb: 22,
    uploadedAt: "2026-06-25T08:41:00Z",
    expiresAt: "2026-07-02T08:41:00Z",
    bundlePrefix: "diag_tech_20260625…",
  },
  {
    id: "diag-005",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    status: "expired",
    requestedAt: "2026-06-10T14:00:00Z",
    requestedBy: "support@againsoft.io",
    bundleSizeMb: 18,
    uploadedAt: "2026-06-10T14:12:00Z",
    expiresAt: "2026-06-17T14:12:00Z",
    bundlePrefix: "diag_urban_20260610…",
  },
];

export const centerErpVersions: CenterErpVersion[] = [
  {
    id: "ver-001",
    version: "2026.6.1",
    channel: "stable",
    type: "patch",
    releasedAt: "2026-06-18",
    agentMinVersion: "1.2.0",
    summary: "Inventory sync fixes, catalog PATCH validation, security hardening",
    rolloutStage: "tier1",
    isLatest: true,
  },
  {
    id: "ver-002",
    version: "2026.6.0",
    channel: "stable",
    type: "minor",
    releasedAt: "2026-06-01",
    agentMinVersion: "1.1.8",
    summary: "Configurator v2, AI OS approval workflow, module dependency checks",
    rolloutStage: "ga",
    isLatest: false,
  },
  {
    id: "ver-003",
    version: "2026.5.2",
    channel: "stable",
    type: "patch",
    releasedAt: "2026-05-12",
    agentMinVersion: "1.1.8",
    summary: "Order export fix, marketing coupon edge cases",
    rolloutStage: "ga",
    isLatest: false,
  },
  {
    id: "ver-004",
    version: "2026.7.0-beta",
    channel: "beta",
    type: "minor",
    releasedAt: "2026-06-22",
    agentMinVersion: "1.2.0",
    summary: "Unified analytics dashboard, experimental AI tools API",
    rolloutStage: "canary",
    isLatest: false,
  },
  {
    id: "ver-005",
    version: "2026.6.1-hotfix",
    channel: "hotfix",
    type: "hotfix",
    releasedAt: "2026-06-25",
    agentMinVersion: "1.2.0",
    summary: "Critical CVE patch for media upload handler",
    rolloutStage: "early",
    isLatest: false,
  },
];

export const centerUpdateRollouts: CenterUpdateRollout[] = [
  {
    id: "roll-001",
    name: "2026.6.1 stable patch",
    targetVersion: "2026.6.1",
    channel: "stable",
    type: "patch",
    stage: "tier1",
    status: "active",
    startedAt: "2026-06-20",
    soakUntil: "2026-06-28",
    clientsTotal: 5,
    clientsComplete: 2,
    clientsFailed: 1,
    clientsPending: 2,
  },
  {
    id: "roll-002",
    name: "2026.6.1-hotfix security",
    targetVersion: "2026.6.1-hotfix",
    channel: "hotfix",
    type: "hotfix",
    stage: "early",
    status: "active",
    startedAt: "2026-06-25",
    soakUntil: "2026-06-27",
    clientsTotal: 5,
    clientsComplete: 0,
    clientsFailed: 0,
    clientsPending: 5,
  },
];

export const centerClientUpdates: CenterClientUpdate[] = [
  {
    id: "cup-001",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    currentVersion: "2026.6.1",
    targetVersion: null,
    channel: "stable",
    status: "up_to_date",
    autoUpdate: true,
    rolloutId: "roll-001",
  },
  {
    id: "cup-002",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    currentVersion: "2026.6.1",
    targetVersion: null,
    channel: "stable",
    status: "up_to_date",
    autoUpdate: false,
    rolloutId: "roll-001",
  },
  {
    id: "cup-003",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    currentVersion: "2026.5.2",
    targetVersion: "2026.6.1",
    channel: "stable",
    status: "scheduled",
    autoUpdate: true,
    scheduledAt: "Sun 02:00 Asia/Dhaka",
    rolloutId: "roll-001",
  },
  {
    id: "cup-004",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    currentVersion: "2026.6.0",
    targetVersion: "2026.6.1",
    channel: "stable",
    status: "failed",
    autoUpdate: true,
    lastAttempt: "2d ago",
    errorMessage: "Agent offline — pre-flight backup check failed",
    rolloutId: "roll-001",
  },
  {
    id: "cup-005",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    currentVersion: "2026.6.1",
    targetVersion: "2026.6.1-hotfix",
    channel: "hotfix",
    status: "available",
    autoUpdate: false,
    rolloutId: "roll-002",
  },
];

export const centerClientBackupStatuses: CenterClientBackupStatus[] = [
  {
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    plan: "enterprise",
    lastBackupAt: "Today 02:14",
    lastBackupType: "full",
    status: "verified",
    sizeMb: 2840,
    retentionDays: 90,
    scheduleLabel: "Daily 02:00 Asia/Dhaka",
    storageTarget: "client_s3",
    verificationEnabled: true,
    nextScheduled: "Tomorrow 02:00",
    hoursSinceBackup: 6,
    policyMaxAgeHours: 26,
    checksumMasked: "sha256:a3f8…9c2e",
  },
  {
    clientId: "cl-002",
    businessName: "TechZone Computers",
    plan: "custom",
    lastBackupAt: "Yesterday 02:08",
    lastBackupType: "full",
    status: "verified",
    sizeMb: 6120,
    retentionDays: 365,
    scheduleLabel: "Daily 02:00 + hourly WAL",
    storageTarget: "client_s3",
    verificationEnabled: true,
    nextScheduled: "Today 02:00",
    hoursSinceBackup: 30,
    policyMaxAgeHours: 26,
    checksumMasked: "sha256:b71d…4a01",
  },
  {
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    plan: "business",
    lastBackupAt: "3d ago",
    lastBackupType: "full",
    status: "overdue",
    sizeMb: 890,
    retentionDays: 30,
    scheduleLabel: "Daily 02:00 Asia/Dhaka",
    storageTarget: "local",
    verificationEnabled: false,
    nextScheduled: "Overdue",
    hoursSinceBackup: 78,
    policyMaxAgeHours: 26,
    checksumMasked: "sha256:c902…1f88",
    errorMessage: "Last scheduled run missed — agent reported low disk space",
  },
  {
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    plan: "starter",
    lastBackupAt: "5d ago",
    lastBackupType: "full",
    status: "failed",
    sizeMb: 0,
    retentionDays: 7,
    scheduleLabel: "Daily 02:00 Asia/Dhaka",
    storageTarget: "local",
    verificationEnabled: false,
    hoursSinceBackup: 120,
    policyMaxAgeHours: 26,
    checksumMasked: "—",
    errorMessage: "Agent offline — backup job could not start",
  },
  {
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    plan: "business",
    lastBackupAt: "Today 01:55",
    lastBackupType: "incremental",
    status: "completed",
    sizeMb: 124,
    retentionDays: 30,
    scheduleLabel: "Daily 02:00 + hourly WAL",
    storageTarget: "local",
    verificationEnabled: true,
    nextScheduled: "Today 03:00 WAL",
    hoursSinceBackup: 7,
    policyMaxAgeHours: 2,
    checksumMasked: "sha256:d4e1…7b33",
  },
];

export const centerBackupRecords: CenterBackupRecord[] = [
  {
    id: "bk-001",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    type: "full",
    status: "verified",
    startedAt: "Today 02:00",
    completedAt: "Today 02:14",
    sizeMb: 2840,
    checksumMasked: "sha256:a3f8…9c2e",
    storageTarget: "client_s3",
    verifiedAt: "Today 02:18",
  },
  {
    id: "bk-002",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    type: "full",
    status: "verified",
    startedAt: "Yesterday 02:00",
    completedAt: "Yesterday 02:08",
    sizeMb: 6120,
    checksumMasked: "sha256:b71d…4a01",
    storageTarget: "client_s3",
    verifiedAt: "Yesterday 02:22",
  },
  {
    id: "bk-003",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    type: "full",
    status: "failed",
    startedAt: "2d ago 02:00",
    sizeMb: 0,
    checksumMasked: "—",
    storageTarget: "local",
    errorMessage: "Insufficient disk space (12% free)",
  },
  {
    id: "bk-004",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    type: "incremental",
    status: "completed",
    startedAt: "Today 01:55",
    completedAt: "Today 01:56",
    sizeMb: 124,
    checksumMasked: "sha256:d4e1…7b33",
    storageTarget: "local",
  },
  {
    id: "bk-005",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    type: "media",
    status: "verified",
    startedAt: "Sun 03:00",
    completedAt: "Sun 03:12",
    sizeMb: 980,
    checksumMasked: "sha256:e5a2…0c44",
    storageTarget: "client_s3",
    verifiedAt: "Sun 03:15",
  },
  {
    id: "bk-006",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    type: "pre_update",
    status: "verified",
    startedAt: "2026-06-18 01:30",
    completedAt: "2026-06-18 01:38",
    sizeMb: 6080,
    checksumMasked: "sha256:f6b3…2d91",
    storageTarget: "client_s3",
    verifiedAt: "2026-06-18 01:42",
  },
  {
    id: "bk-007",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    type: "full",
    status: "failed",
    startedAt: "5d ago 02:00",
    sizeMb: 0,
    checksumMasked: "—",
    storageTarget: "local",
    errorMessage: "Agent offline",
  },
];

function creditStatusFor(used: number, limit: number): CenterAiCreditStatus {
  if (limit <= 0) return "none";
  const pct = used / limit;
  if (pct >= 1) return "exceeded";
  if (pct >= 0.85) return "warning";
  return "ok";
}

function accessStatusFor(client: CenterClient): CenterAiAccessStatus {
  if (client.status === "suspended") return "suspended";
  if (client.aiEnabled) return "active";
  if (client.status === "trial") return "pending";
  return "disabled";
}

export const centerClientAiAccess: CenterClientAiAccess[] = centerClients.map((client) => {
  const base: CenterClientAiAccess = {
    clientId: client.id,
    businessName: client.businessName,
    plan: client.plan,
    clientStatus: client.status,
    aiEnabled: client.aiEnabled,
    accessStatus: accessStatusFor(client),
    agentsLimit: client.aiAgentsLimit,
    agentsActive: client.aiEnabled ? Math.max(1, Math.floor(client.aiAgentsLimit * 0.7)) : 0,
    creditsMonthly: client.aiTokensLimit,
    creditsUsed: client.aiTokensUsed,
    creditsStatus: creditStatusFor(client.aiTokensUsed, client.aiTokensLimit),
    toolsEnabled: [],
    proxyMode: client.dbStatus === "offline" ? "queued" : "cloud",
  };

  if (client.id === "cl-001") {
    return {
      ...base,
      agentsActive: 6,
      creditsUsed: 465000,
      creditsStatus: "warning",
      toolsEnabled: ["chat", "automation", "catalog-assist"],
      lastAiRequest: "12 min ago",
    };
  }
  if (client.id === "cl-002") {
    return {
      ...base,
      agentsActive: 12,
      toolsEnabled: ["chat", "automation", "developer", "configurator-assist"],
      lastAiRequest: "2 min ago",
    };
  }
  if (client.id === "cl-003") {
    return {
      ...base,
      accessStatus: "pending",
      toolsEnabled: [],
    };
  }
  if (client.id === "cl-005") {
    return {
      ...base,
      accessStatus: "disabled",
    };
  }

  return base;
});

export const centerAiRecommendations: CenterAiRecommendation[] = [
  {
    id: "ai-rec-1",
    agent: "recommendation",
    title: "Enable AI OS for BuildPro Hardware",
    detail: "Enterprise plan includes 50k credits/mo — client has configurator but AI module not provisioned.",
    clientId: "cl-005",
    clientName: "BuildPro Hardware",
    severity: "action",
    dismissed: false,
  },
  {
    id: "ai-rec-2",
    agent: "license",
    title: "UrbanWear approaching credit limit",
    detail: "93% of monthly AI credits consumed — consider plan upgrade or temporary boost.",
    clientId: "cl-001",
    clientName: "UrbanWear Retail",
    severity: "warning",
    dismissed: false,
  },
  {
    id: "ai-rec-3",
    agent: "health",
    title: "FreshMart trial — AI intake pending",
    detail: "Registration requested AI — enable after business plan conversion.",
    clientId: "cl-003",
    clientName: "FreshMart Grocery",
    severity: "info",
    dismissed: false,
  },
  {
    id: "ai-rec-4",
    agent: "update",
    title: "TechZone ready for beta channel",
    detail: "Low update failure rate and high AI adoption — candidate for 2026.7.0-beta canary.",
    clientId: "cl-002",
    clientName: "TechZone Computers",
    severity: "info",
    dismissed: true,
  },
];

export const centerPlatformAiAgents: CenterPlatformAiAgent[] = [
  {
    id: "chief",
    label: "Chief AI",
    description: "Orchestrates specialist agents and synthesizes fleet-wide operator briefings.",
    autonomy: "Recommend only — no destructive actions",
    status: "active",
  },
  {
    id: "health",
    label: "Health AI",
    description: "Root cause analysis and capacity planning from agent-reported metrics.",
    autonomy: "Recommend only",
    status: "active",
  },
  {
    id: "recommendation",
    label: "Recommendation AI",
    description: "Plan optimization, module usage, and config best practices.",
    autonomy: "Recommend only",
    status: "active",
  },
  {
    id: "update",
    label: "Update AI",
    description: "Rollout risk scoring and compatibility checks before stage promotion.",
    autonomy: "Advises Update Service",
    status: "idle",
  },
  {
    id: "license",
    label: "License AI",
    description: "Expiry forecasting and entitlement audit from heartbeat metadata.",
    autonomy: "Cannot modify licenses",
    status: "active",
  },
  {
    id: "monitoring",
    label: "Monitoring AI",
    description: "Alert correlation, false-positive reduction, and SLA breach prediction.",
    autonomy: "Recommend only",
    status: "active",
  },
  {
    id: "automation",
    label: "Automation AI",
    description: "Proposed runbooks — human approval required for deploy, suspend, or restore.",
    autonomy: "Human-in-the-loop",
    status: "idle",
  },
];

export const centerChiefAiBriefing: CenterChiefAiBriefing = {
  generatedAt: "Today · 08:00 UTC",
  summary:
    "Fleet is stable with 2 items needing operator attention. Chief AI synthesized inputs from Health, License, Monitoring, and Recommendation agents — metadata only, no client business data.",
  insights: [
    {
      id: "brief-1",
      source: "monitoring",
      text: "BuildPro Hardware agent heartbeat latency elevated (820ms). Health AI suggests disk I/O pressure — review monitoring before next update window.",
      href: "/center/monitoring?client=cl-005",
      hrefLabel: "View agent",
    },
    {
      id: "brief-2",
      source: "license",
      text: "StyleHub Fashion remains suspended for overdue payment. License AI recommends follow-up before grace expires in 3 days.",
      href: "/center/clients/cl-004",
      hrefLabel: "Client detail",
    },
    {
      id: "brief-3",
      source: "recommendation",
      text: "2 registrations await review — FreshMart Grocery requested AI module on trial conversion. Prioritize onboarding queue.",
      href: "/center/registrations",
      hrefLabel: "Review queue",
    },
    {
      id: "brief-4",
      source: "health",
      text: "UrbanWear Retail at 93% AI credit usage. No agent degradation — consider proactive credit boost or plan upgrade.",
      href: "/center/ai-access?client=cl-001",
      hrefLabel: "AI access",
    },
    {
      id: "brief-5",
      source: "update",
      text: "2026.6.1 rollout at 78% complete with zero rollbacks. Update AI recommends promoting TechZone to beta channel after canary validation.",
      href: "/center/updates",
      hrefLabel: "Update manager",
    },
  ],
  creditNote:
    "Platform AI credit budget: 84% consumed fleet-wide this month. Destructive actions require human approval — Chief AI recommends only.",
};

export const centerBillingInvoices: CenterBillingInvoice[] = [
  {
    id: "inv-001",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    subscriptionId: "sub-002",
    invoiceNumber: "INV-2026-06-0042",
    amount: 52000,
    currency: "BDT",
    status: "open",
    periodStart: "2026-06-01",
    periodEnd: "2026-07-01",
    issuedAt: "2026-06-01",
    dueAt: "2026-06-15",
    externalRef: "pi_3TechZoneJun",
    lineItems: [
      { label: "Custom plan — monthly", amount: 48000 },
      { label: "AI credits overage", amount: 4000 },
    ],
  },
  {
    id: "inv-002",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    subscriptionId: "sub-004",
    invoiceNumber: "INV-2026-05-0118",
    amount: 4999,
    currency: "BDT",
    status: "past_due",
    periodStart: "2026-05-20",
    periodEnd: "2026-06-20",
    issuedAt: "2026-05-20",
    dueAt: "2026-06-05",
    externalRef: "pi_3StyleHubMay",
    lineItems: [{ label: "Starter plan — monthly", amount: 4999 }],
  },
  {
    id: "inv-003",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    subscriptionId: "sub-001",
    invoiceNumber: "INV-2026-06-0031",
    amount: 34999,
    currency: "BDT",
    status: "paid",
    periodStart: "2026-06-01",
    periodEnd: "2026-07-01",
    issuedAt: "2026-06-01",
    dueAt: "2026-06-15",
    paidAt: "2026-06-03",
    externalRef: "pi_3UrbanWearJun",
    lineItems: [
      { label: "Enterprise plan — monthly portion", amount: 29166 },
      { label: "Dedicated support add-on", amount: 5833 },
    ],
  },
  {
    id: "inv-004",
    clientId: "cl-005",
    businessName: "BuildPro Hardware",
    subscriptionId: "sub-005",
    invoiceNumber: "INV-2026-06-0038",
    amount: 34999,
    currency: "BDT",
    status: "paid",
    periodStart: "2026-06-01",
    periodEnd: "2026-07-01",
    issuedAt: "2026-06-01",
    dueAt: "2026-06-15",
    paidAt: "2026-06-02",
    externalRef: "pi_3BuildProJun",
    lineItems: [{ label: "Enterprise plan — monthly portion", amount: 34999 }],
  },
  {
    id: "inv-005",
    clientId: "cl-003",
    businessName: "FreshMart Grocery",
    subscriptionId: "sub-003",
    invoiceNumber: "INV-2026-06-DRAFT",
    amount: 0,
    currency: "BDT",
    status: "draft",
    periodStart: "2026-07-01",
    periodEnd: "2026-08-01",
    issuedAt: "—",
    dueAt: "—",
    lineItems: [{ label: "Business plan — trial conversion", amount: 0 }],
  },
  {
    id: "inv-006",
    clientId: "cl-002",
    businessName: "TechZone Computers",
    subscriptionId: "sub-002",
    invoiceNumber: "INV-2026-05-0040",
    amount: 52000,
    currency: "BDT",
    status: "paid",
    periodStart: "2026-05-01",
    periodEnd: "2026-06-01",
    issuedAt: "2026-05-01",
    dueAt: "2026-05-15",
    paidAt: "2026-05-02",
    externalRef: "pi_3TechZoneMay",
    lineItems: [{ label: "Custom plan — monthly", amount: 52000 }],
  },
  {
    id: "inv-007",
    clientId: "cl-004",
    businessName: "StyleHub Fashion",
    subscriptionId: "sub-004",
    invoiceNumber: "INV-2026-04-0095",
    amount: 4999,
    currency: "BDT",
    status: "uncollectible",
    periodStart: "2026-04-20",
    periodEnd: "2026-05-20",
    issuedAt: "2026-04-20",
    dueAt: "2026-05-05",
    externalRef: "pi_3StyleHubApr",
    lineItems: [{ label: "Starter plan — monthly", amount: 4999 }],
  },
  {
    id: "inv-008",
    clientId: "cl-001",
    businessName: "UrbanWear Retail",
    subscriptionId: "sub-001",
    invoiceNumber: "INV-2026-05-0028",
    amount: 34999,
    currency: "BDT",
    status: "paid",
    periodStart: "2026-05-01",
    periodEnd: "2026-06-01",
    issuedAt: "2026-05-01",
    dueAt: "2026-05-15",
    paidAt: "2026-05-04",
    externalRef: "pi_3UrbanWearMay",
    lineItems: [{ label: "Enterprise plan — monthly portion", amount: 34999 }],
  },
];

export const centerAuditLogs: CenterAuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-06-28T10:14:00",
    actorType: "operator",
    actorId: "op-super-1",
    actorLabel: "Super Admin",
    action: "registration.approve",
    resourceType: "registration",
    resourceId: "reg-102",
    clientId: "cl-006",
    clientName: "Metro Pharmacy",
    correlationId: "corr-a1b2c3d4",
    ipAddress: "103.12.44.88",
    beforeState: { status: "pending_review" },
    afterState: { status: "approved", reviewedBy: "Super Admin" },
  },
  {
    id: "aud-002",
    timestamp: "2026-06-28T09:02:00",
    actorType: "system",
    actorId: "billing-service",
    actorLabel: "Billing Service",
    action: "client.suspend",
    resourceType: "client",
    resourceId: "cl-004",
    clientId: "cl-004",
    clientName: "StyleHub Fashion",
    correlationId: "corr-e5f6g7h8",
    beforeState: { status: "active", subscriptionStatus: "past_due" },
    afterState: { status: "suspended", reason: "payment_overdue" },
  },
  {
    id: "aud-003",
    timestamp: "2026-06-28T08:45:00",
    actorType: "agent",
    actorId: "inst_techzone_001",
    actorLabel: "Edge Agent — TechZone",
    action: "heartbeat.received",
    resourceType: "agent",
    resourceId: "inst_techzone_001",
    clientId: "cl-002",
    clientName: "TechZone Computers",
    correlationId: "corr-i9j0k1l2",
  },
  {
    id: "aud-004",
    timestamp: "2026-06-27T18:30:00",
    actorType: "operator",
    actorId: "op-super-1",
    actorLabel: "Super Admin",
    action: "ai.limits.update",
    resourceType: "ai",
    resourceId: "cl-002",
    clientId: "cl-002",
    clientName: "TechZone Computers",
    correlationId: "corr-m3n4o5p6",
    ipAddress: "103.12.44.88",
    beforeState: { aiAgentsLimit: 8 },
    afterState: { aiAgentsLimit: 15 },
  },
  {
    id: "aud-005",
    timestamp: "2026-06-27T14:12:00",
    actorType: "system",
    actorId: "update-service",
    actorLabel: "Update Service",
    action: "rollout.stage.advance",
    resourceType: "update",
    resourceId: "roll-001",
    correlationId: "corr-q7r8s9t0",
    beforeState: { stage: "early" },
    afterState: { stage: "tier1" },
  },
  {
    id: "aud-006",
    timestamp: "2026-06-27T11:00:00",
    actorType: "agent",
    actorId: "inst_urbanwear_001",
    actorLabel: "Edge Agent — UrbanWear",
    action: "license.sync",
    resourceType: "license",
    resourceId: "lic-001",
    clientId: "cl-001",
    clientName: "UrbanWear Retail",
    correlationId: "corr-u1v2w3x4",
  },
  {
    id: "aud-007",
    timestamp: "2026-06-26T16:22:00",
    actorType: "operator",
    actorId: "op-billing-2",
    actorLabel: "Billing Admin",
    action: "invoice.payment.recorded",
    resourceType: "billing",
    resourceId: "inv-003",
    clientId: "cl-001",
    clientName: "UrbanWear Retail",
    correlationId: "corr-y5z6a7b8",
    ipAddress: "103.12.44.91",
    afterState: { status: "paid", paidAt: "2026-06-03" },
  },
  {
    id: "aud-008",
    timestamp: "2026-06-26T09:15:00",
    actorType: "system",
    actorId: "backup-service",
    actorLabel: "Backup Service",
    action: "backup.metadata.received",
    resourceType: "backup",
    resourceId: "bk-001",
    clientId: "cl-001",
    clientName: "UrbanWear Retail",
    correlationId: "corr-c9d0e1f2",
    afterState: { status: "verified", sizeMb: 2840 },
  },
  {
    id: "aud-009",
    timestamp: "2026-06-25T20:01:00",
    actorType: "system",
    actorId: "auth-service",
    actorLabel: "Auth Service",
    action: "login.success",
    resourceType: "security",
    resourceId: "op-super-1",
    correlationId: "corr-g3h4i5j6",
    ipAddress: "103.12.44.88",
    afterState: { mfa: true, role: "platform_admin" },
  },
  {
    id: "aud-010",
    timestamp: "2026-06-25T15:40:00",
    actorType: "operator",
    actorId: "op-super-1",
    actorLabel: "Super Admin",
    action: "module.enable",
    resourceType: "module",
    resourceId: "reports",
    clientId: "cl-001",
    clientName: "UrbanWear Retail",
    correlationId: "corr-k7l8m9n0",
    ipAddress: "103.12.44.88",
    beforeState: { modules: ["catalog", "orders"] },
    afterState: { modules: ["catalog", "orders", "reports"] },
  },
  {
    id: "aud-011",
    timestamp: "2026-06-24T08:00:00",
    actorType: "agent",
    actorId: "inst_stylehub_001",
    actorLabel: "Edge Agent — StyleHub",
    action: "update.preflight.failed",
    resourceType: "update",
    resourceId: "cup-004",
    clientId: "cl-004",
    clientName: "StyleHub Fashion",
    correlationId: "corr-o1p2q3r4",
    afterState: { error: "Agent offline — pre-flight backup check failed" },
  },
  {
    id: "aud-012",
    timestamp: "2026-06-23T12:30:00",
    actorType: "operator",
    actorId: "op-super-1",
    actorLabel: "Super Admin",
    action: "registration.reject",
    resourceType: "registration",
    resourceId: "reg-099",
    correlationId: "corr-s5t6u7v8",
    ipAddress: "103.12.44.88",
    beforeState: { status: "pending_review" },
    afterState: { status: "rejected", rejectionReason: "Incomplete business verification" },
  },
];

export const centerPlatformSettings: CenterPlatformSettings = {
  platformName: "AgainERP Control Center",
  defaultGraceDays: 7,
  maintenanceWindow: "Sun 02:00–06:00 Asia/Dhaka",
  alertEmail: "ops@againsoft.com",
  requireMfaAllOperators: true,
  agentHeartbeatIntervalSec: 60,
  auditRetentionYears: 7,
  defaultUpdateChannel: "stable",
};

export const centerOperators: CenterOperator[] = [
  {
    id: "op-super-1",
    name: "Super Admin",
    email: "admin@againsoft.com",
    role: "super_admin",
    status: "active",
    mfaEnabled: true,
    mfaType: "hardware",
    lastLogin: "2026-06-28 10:00",
    createdAt: "2024-01-15",
  },
  {
    id: "op-platform-2",
    name: "Rafiq Hassan",
    email: "rafiq@againsoft.com",
    role: "platform_admin",
    status: "active",
    mfaEnabled: true,
    mfaType: "webauthn",
    lastLogin: "2026-06-27 16:45",
    ipAllowlist: "103.12.44.0/24",
    createdAt: "2025-03-10",
  },
  {
    id: "op-billing-2",
    name: "Billing Admin",
    email: "billing@againsoft.com",
    role: "billing_admin",
    status: "active",
    mfaEnabled: true,
    mfaType: "totp",
    lastLogin: "2026-06-26 11:20",
    createdAt: "2025-06-01",
  },
  {
    id: "op-support-3",
    name: "Sara Mahmud",
    email: "support@againsoft.com",
    role: "support_agent",
    status: "active",
    mfaEnabled: true,
    mfaType: "totp",
    lastLogin: "2026-06-28 09:30",
    createdAt: "2025-09-20",
  },
  {
    id: "op-readonly-4",
    name: "Audit Viewer",
    email: "audit@againsoft.com",
    role: "read_only",
    status: "invited",
    mfaEnabled: false,
    createdAt: "2026-06-25",
  },
  {
    id: "op-partner-5",
    name: "AgroHub Partner",
    email: "partner@agrohub.bd",
    role: "partner_admin",
    status: "active",
    mfaEnabled: true,
    mfaType: "totp",
    lastLogin: "2026-06-24 14:00",
    createdAt: "2026-02-01",
  },
];

export const centerApiKeys: CenterApiKey[] = [
  {
    id: "key-001",
    name: "SIEM export",
    keyPrefix: "cc_live_a3f8",
    ownerType: "integration",
    ownerLabel: "Security integration",
    scopes: ["audit.read", "clients.read"],
    status: "active",
    createdAt: "2026-01-10",
    lastUsedAt: "2026-06-28 08:00",
    expiresAt: "2027-01-10",
  },
  {
    id: "key-002",
    name: "Billing webhook verifier",
    keyPrefix: "cc_live_b71d",
    ownerType: "integration",
    ownerLabel: "Stripe bridge",
    scopes: ["billing.read"],
    status: "active",
    createdAt: "2025-11-01",
    lastUsedAt: "2026-06-27 22:15",
  },
  {
    id: "key-003",
    name: "Legacy fleet script",
    keyPrefix: "cc_live_c902",
    ownerType: "operator",
    ownerLabel: "Super Admin",
    scopes: ["clients.read", "clients.write"],
    status: "revoked",
    createdAt: "2024-08-15",
    lastUsedAt: "2026-03-01",
  },
  {
    id: "key-004",
    name: "AgroHub partner API",
    keyPrefix: "cc_live_d4e1",
    ownerType: "partner",
    ownerLabel: "AgroHub Partner",
    scopes: ["clients.read", "registrations.read"],
    status: "active",
    createdAt: "2026-02-01",
    lastUsedAt: "2026-06-26 10:00",
    expiresAt: "2027-02-01",
  },
];

export function getCenterAgentHeartbeat(clientId: string): CenterAgentHeartbeat | undefined {
  return centerAgentHeartbeats.find((h) => h.clientId === clientId);
}

function metricSeed(clientId: string): number {
  return clientId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getCenterAgentMetricSeries(clientId: string): CenterAgentMetricPoint[] {
  const hb = getCenterAgentHeartbeat(clientId);
  if (!hb || hb.agentStatus === "offline") return [];

  const seed = metricSeed(clientId);
  return Array.from({ length: 24 }, (_, index) => {
    const label = `${String(index).padStart(2, "0")}:00`;
    const wave = Math.sin((index + seed) * 0.55) * 8;
    const spike = index >= 17 && hb.agentStatus === "degraded" ? 14 : 0;

    return {
      label,
      cpu: Math.max(5, Math.min(98, Math.round(hb.cpuPercent + wave + spike))),
      ram: Math.max(10, Math.min(98, Math.round(hb.ramPercent + wave * 0.7 + spike * 0.6))),
      disk: Math.max(10, Math.min(98, Math.round(hb.diskPercent + index * 0.12))),
      apiP95: Math.max(20, Math.round(hb.apiLatencyP95Ms + wave * 12 + spike * 18)),
    };
  });
}

export function getCenterFleetMetricSeries(
  heartbeats = centerAgentHeartbeats.filter((h) => h.agentStatus !== "offline"),
): CenterAgentMetricPoint[] {
  return Array.from({ length: 24 }, (_, index) => {
    const label = `${String(index).padStart(2, "0")}:00`;
    const samples = heartbeats
      .map((hb) => getCenterAgentMetricSeries(hb.clientId)[index])
      .filter((point): point is CenterAgentMetricPoint => Boolean(point));

    if (samples.length === 0) {
      return { label, cpu: 0, ram: 0, disk: 0, apiP95: 0 };
    }

    const average = (key: keyof Omit<CenterAgentMetricPoint, "label">) =>
      Math.round(samples.reduce((sum, point) => sum + point[key], 0) / samples.length);

    return {
      label,
      cpu: average("cpu"),
      ram: average("ram"),
      disk: average("disk"),
      apiP95: average("apiP95"),
    };
  });
}

export function getCenterMonitoringStats(heartbeats = centerAgentHeartbeats) {
  const online = heartbeats.filter((h) => h.agentStatus === "connected").length;
  const degraded = heartbeats.filter((h) => h.agentStatus === "degraded").length;
  const offline = heartbeats.filter((h) => h.agentStatus === "offline").length;
  const pending = heartbeats.filter((h) => h.agentStatus === "pending").length;
  const activeAlerts = centerMonitoringAlerts.filter((a) => !a.acknowledged).length;
  const avgLatency =
    heartbeats.filter((h) => h.agentStatus !== "offline").reduce((sum, h) => sum + h.apiLatencyP95Ms, 0) /
    Math.max(heartbeats.filter((h) => h.agentStatus !== "offline").length, 1);

  return { online, degraded, offline, pending, activeAlerts, avgLatency: Math.round(avgLatency) };
}

export function filterCenterAgentHeartbeats(
  heartbeats: CenterAgentHeartbeat[],
  opts: {
    search?: string;
    agentStatus?: CenterDbStatus | "all";
    deployment?: CenterDeploymentMode | "all";
  },
): CenterAgentHeartbeat[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return heartbeats.filter((hb) => {
    if (opts.agentStatus && opts.agentStatus !== "all" && hb.agentStatus !== opts.agentStatus) {
      return false;
    }
    if (opts.deployment && opts.deployment !== "all" && hb.deploymentMode !== opts.deployment) {
      return false;
    }
    if (!q) return true;
    return (
      hb.businessName.toLowerCase().includes(q) ||
      hb.instanceId.toLowerCase().includes(q) ||
      hb.serverHost.toLowerCase().includes(q)
    );
  });
}

export const centerMonitoringAlertColors: Record<CenterMonitoringAlertSeverity, string> = {
  critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  info: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30",
};

export function getCenterClient(id: string): CenterClient | undefined {
  return centerClients.find((c) => c.id === id);
}

/** Computed dashboard stats from mock fleet — prototype SSOT */
export function getCenterDashboardStats() {
  const total = centerClients.length;
  const active = centerClients.filter((c) => c.status === "active" || c.status === "trial").length;
  const suspended = centerClients.filter((c) => c.status === "suspended").length;
  const mrr = centerClients.reduce((sum, c) => sum + c.mrr, 0);
  const aiEnabled = centerClients.filter((c) => c.aiEnabled).length;
  const pendingRegs = centerRegistrations.filter((r) => r.status === "pending_review").length;
  const agentsOnline = centerClients.filter((c) => c.dbStatus === "connected").length;
  const agentsAlert = centerClients.filter((c) => c.dbStatus !== "connected").length;

  return {
    total,
    active,
    suspended,
    mrr,
    aiEnabled,
    pendingRegs,
    agentsOnline,
    agentsAlert,
  };
}

export function formatCenterPlan(plan: CenterPlan): string {
  return centerPlans.find((p) => p.id === plan)?.label ?? plan;
}

export const centerStatusColors: Record<CenterClientStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  trial: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export const centerDbStatusColors: Record<CenterDbStatus, string> = {
  connected: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  degraded: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  offline: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  pending: "bg-muted text-muted-foreground",
};

/** Agent heartbeat label — dbStatus field stores agent connectivity in prototype */
export const centerAgentStatusLabel: Record<CenterDbStatus, string> = {
  connected: "online",
  degraded: "degraded",
  offline: "offline",
  pending: "pending",
};

export const centerRegistrationStatusColors: Record<CenterRegistrationStatus, string> = {
  pending_review: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function getCenterRegistration(id: string): CenterRegistration | undefined {
  return centerRegistrations.find((r) => r.id === id);
}

export function getCenterPendingRegistrationCount(registrations = centerRegistrations): number {
  return registrations.filter((r) => r.status === "pending_review").length;
}

export function filterCenterRegistrations(
  registrations: CenterRegistration[],
  opts: { search?: string; status?: CenterRegistrationStatus | "all" },
): CenterRegistration[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return registrations.filter((reg) => {
    if (opts.status && opts.status !== "all" && reg.status !== opts.status) return false;
    if (!q) return true;
    return (
      reg.businessName.toLowerCase().includes(q) ||
      reg.contactEmail.toLowerCase().includes(q) ||
      reg.contactName.toLowerCase().includes(q) ||
      reg.industry.toLowerCase().includes(q)
    );
  });
}

export const centerSubscriptionStatusColors: Record<CenterSubscriptionStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  trial: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  past_due: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  cancelled: "bg-muted text-muted-foreground",
};

export const centerLicenseStatusColors: Record<CenterLicenseStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  grace: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  revoked: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  expired: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  superseded: "bg-muted text-muted-foreground",
};

export function getCenterLicense(id: string): CenterLicense | undefined {
  return centerLicenses.find((l) => l.id === id);
}

export function getCenterLicenseByClient(clientId: string): CenterLicense | undefined {
  return centerLicenses.find((l) => l.clientId === clientId);
}

export function filterCenterLicenses(
  licenses: CenterLicense[],
  opts: { search?: string; status?: CenterLicenseStatus | "all" },
): CenterLicense[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return licenses.filter((lic) => {
    if (opts.status && opts.status !== "all" && lic.status !== opts.status) return false;
    if (!q) return true;
    return (
      lic.businessName.toLowerCase().includes(q) ||
      lic.licenseKeyMasked.toLowerCase().includes(q) ||
      lic.instanceId.toLowerCase().includes(q)
    );
  });
}

export function filterCenterSubscriptions(
  subscriptions: CenterClientSubscription[],
  opts: { search?: string; status?: CenterSubscriptionStatus | "all" },
): CenterClientSubscription[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return subscriptions.filter((sub) => {
    if (opts.status && opts.status !== "all" && sub.status !== opts.status) return false;
    if (!q) return true;
    return sub.businessName.toLowerCase().includes(q);
  });
}

export function filterCenterModules(
  modules: CenterModuleDefinition[],
  opts: {
    search?: string;
    tier?: CenterModuleDefinition["tier"] | "all";
    platformDefault?: "all" | "yes" | "no";
  },
): CenterModuleDefinition[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return modules.filter((mod) => {
    if (opts.tier && opts.tier !== "all" && mod.tier !== opts.tier) return false;
    if (opts.platformDefault === "yes" && !mod.platformDefault) return false;
    if (opts.platformDefault === "no" && mod.platformDefault) return false;
    if (!q) return true;
    return (
      mod.label.toLowerCase().includes(q) ||
      mod.description.toLowerCase().includes(q) ||
      mod.id.toLowerCase().includes(q) ||
      mod.featureFlagKey.toLowerCase().includes(q)
    );
  });
}

export function getCenterModule(id: CenterModuleId): CenterModuleDefinition | undefined {
  return centerModules.find((m) => m.id === id);
}

export function getCenterModuleDependents(moduleId: CenterModuleId): CenterModuleDefinition[] {
  return centerModules.filter((m) => m.dependencies.includes(moduleId));
}

export function getCenterModuleClientCount(
  moduleId: CenterModuleId,
  clients: CenterClient[] = centerClients,
): number {
  return clients.filter((c) => c.modules.includes(moduleId)).length;
}

export function getCenterPlansIncludingModule(moduleId: CenterModuleId): CenterSubscriptionPlan[] {
  return centerPlans.filter((p) => p.includedModules.includes(moduleId));
}

export function filterCenterClients(
  clients: CenterClient[],
  opts: {
    search?: string;
    status?: CenterClientStatus | "all";
    plan?: CenterPlan | "all";
    agent?: CenterDbStatus | "all";
  },
): CenterClient[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return clients.filter((client) => {
    if (opts.status && opts.status !== "all" && client.status !== opts.status) return false;
    if (opts.plan && opts.plan !== "all" && client.plan !== opts.plan) return false;
    if (opts.agent && opts.agent !== "all" && client.dbStatus !== opts.agent) return false;
    if (!q) return true;
    return (
      client.businessName.toLowerCase().includes(q) ||
      client.contactEmail.toLowerCase().includes(q) ||
      client.contactName.toLowerCase().includes(q) ||
      client.slug.toLowerCase().includes(q)
    );
  });
}

export function getCenterUpdateStats(updates = centerClientUpdates) {
  const upToDate = updates.filter((u) => u.status === "up_to_date").length;
  const pending = updates.filter((u) =>
    ["available", "scheduled", "applying", "validating"].includes(u.status),
  ).length;
  const failed = updates.filter((u) => u.status === "failed" || u.status === "rolling_back").length;
  const activeRollouts = centerUpdateRollouts.filter((r) => r.status === "active").length;
  const latest = centerErpVersions.find((v) => v.isLatest)?.version ?? "—";

  return { upToDate, pending, failed, activeRollouts, latest };
}

export function getCenterClientUpdate(clientId: string): CenterClientUpdate | undefined {
  return centerClientUpdates.find((u) => u.clientId === clientId);
}

export function filterCenterClientUpdates(
  updates: CenterClientUpdate[],
  opts: { search?: string; status?: CenterClientUpdateStatus | "all"; channel?: CenterUpdateChannel | "all" },
): CenterClientUpdate[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return updates.filter((u) => {
    if (opts.status && opts.status !== "all" && u.status !== opts.status) return false;
    if (opts.channel && opts.channel !== "all" && u.channel !== opts.channel) return false;
    if (!q) return true;
    return (
      u.businessName.toLowerCase().includes(q) ||
      u.currentVersion.toLowerCase().includes(q) ||
      (u.targetVersion?.toLowerCase().includes(q) ?? false)
    );
  });
}

export const centerClientUpdateStatusColors: Record<CenterClientUpdateStatus, string> = {
  up_to_date: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  available: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  scheduled: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  applying: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  validating: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  rolling_back: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export const centerRolloutStageLabels: Record<CenterRolloutStage, string> = {
  canary: "Canary",
  early: "Early adopters (5%)",
  tier1: "Business tier (25%)",
  tier2: "Professional (50%)",
  ga: "General availability",
  draft: "Draft",
};

export const centerUpdateChannelColors: Record<CenterUpdateChannel, string> = {
  stable: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  beta: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  lts: "bg-muted text-muted-foreground",
  hotfix: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function getCenterBackupStats(statuses = centerClientBackupStatuses) {
  const verified = statuses.filter((s) => s.status === "verified").length;
  const overdue = statuses.filter((s) => s.status === "overdue" || s.status === "failed").length;
  const pendingVerify = statuses.filter((s) => s.status === "completed").length;
  const totalMetadataMb = statuses.reduce((sum, s) => sum + s.sizeMb, 0);

  return { verified, overdue, pendingVerify, totalMetadataMb, fleet: statuses.length };
}

export function getCenterClientBackupStatus(clientId: string): CenterClientBackupStatus | undefined {
  return centerClientBackupStatuses.find((s) => s.clientId === clientId);
}

export function getCenterBackupRecordsForClient(clientId: string): CenterBackupRecord[] {
  return centerBackupRecords.filter((r) => r.clientId === clientId);
}

export function filterCenterClientBackupStatuses(
  statuses: CenterClientBackupStatus[],
  opts: { search?: string; status?: CenterBackupStatus | "all"; storage?: CenterBackupStorageTarget | "all" },
): CenterClientBackupStatus[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return statuses.filter((s) => {
    if (opts.status && opts.status !== "all" && s.status !== opts.status) return false;
    if (opts.storage && opts.storage !== "all" && s.storageTarget !== opts.storage) return false;
    if (!q) return true;
    return s.businessName.toLowerCase().includes(q);
  });
}

export function filterCenterBackupRecords(
  records: CenterBackupRecord[],
  opts: { search?: string; status?: CenterBackupStatus | "all"; type?: CenterBackupType | "all" },
): CenterBackupRecord[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return records.filter((r) => {
    if (opts.status && opts.status !== "all" && r.status !== opts.status) return false;
    if (opts.type && opts.type !== "all" && r.type !== opts.type) return false;
    if (!q) return true;
    return (
      r.businessName.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q)
    );
  });
}

export const centerBackupStatusColors: Record<CenterBackupStatus, string> = {
  verified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  completed: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  running: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  overdue: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export const centerBackupStorageLabels: Record<CenterBackupStorageTarget, string> = {
  local: "Client local",
  client_s3: "Client S3",
  platform_assisted: "Platform assisted",
};

export function formatBackupSizeMb(mb: number): string {
  if (mb === 0) return "—";
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

export function getCenterAiStats(access = centerClientAiAccess) {
  const enabled = access.filter((a) => a.aiEnabled).length;
  const agentsAllocated = access.reduce((sum, a) => sum + a.agentsLimit, 0);
  const agentsActive = access.reduce((sum, a) => sum + a.agentsActive, 0);
  const creditsUsed = access.reduce((sum, a) => sum + a.creditsUsed, 0);
  const creditsMonthly = access.reduce((sum, a) => sum + a.creditsMonthly, 0);
  const creditPct = creditsMonthly > 0 ? Math.round((creditsUsed / creditsMonthly) * 100) : 0;
  const recommendations = centerAiRecommendations.filter((r) => !r.dismissed).length;
  const creditWarnings = access.filter((a) => a.creditsStatus === "warning" || a.creditsStatus === "exceeded").length;

  return { enabled, agentsAllocated, agentsActive, creditPct, recommendations, creditWarnings, fleet: access.length };
}

export function getCenterClientAiAccess(clientId: string): CenterClientAiAccess | undefined {
  return centerClientAiAccess.find((a) => a.clientId === clientId);
}

export function filterCenterClientAiAccess(
  access: CenterClientAiAccess[],
  opts: {
    search?: string;
    aiEnabled?: "all" | "yes" | "no";
    creditStatus?: CenterAiCreditStatus | "all";
  },
): CenterClientAiAccess[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return access.filter((a) => {
    if (opts.aiEnabled === "yes" && !a.aiEnabled) return false;
    if (opts.aiEnabled === "no" && a.aiEnabled) return false;
    if (opts.creditStatus && opts.creditStatus !== "all" && a.creditsStatus !== opts.creditStatus) return false;
    if (!q) return true;
    return a.businessName.toLowerCase().includes(q);
  });
}

export const centerAiAccessStatusColors: Record<CenterAiAccessStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  disabled: "bg-muted text-muted-foreground",
  suspended: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export const centerAiCreditStatusColors: Record<CenterAiCreditStatus, string> = {
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  exceeded: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  none: "bg-muted text-muted-foreground",
};

export const centerPlatformAiAgentLabels: Record<CenterPlatformAiAgentId, string> = {
  chief: "Chief AI",
  health: "Health AI",
  recommendation: "Recommendation AI",
  update: "Update AI",
  license: "License AI",
  monitoring: "Monitoring AI",
  automation: "Automation AI",
};

export function formatAiCredits(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

export function getAiCreditPercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function getCenterBillingStats(invoices = centerBillingInvoices) {
  const totalMrr = centerClients.reduce((sum, c) => sum + c.mrr, 0);
  const openInvoices = invoices.filter((i) => i.status === "open" || i.status === "past_due").length;
  const pastDueAmount = invoices
    .filter((i) => i.status === "past_due")
    .reduce((sum, i) => sum + i.amount, 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === "paid" && i.paidAt?.startsWith("2026-06"))
    .reduce((sum, i) => sum + i.amount, 0);

  return { totalMrr, openInvoices, pastDueAmount, paidThisMonth, invoiceCount: invoices.length };
}

export function getCenterBillingInvoice(id: string): CenterBillingInvoice | undefined {
  return centerBillingInvoices.find((i) => i.id === id);
}

export function getCenterInvoicesForClient(clientId: string): CenterBillingInvoice[] {
  return centerBillingInvoices.filter((i) => i.clientId === clientId);
}

export function filterCenterBillingInvoices(
  invoices: CenterBillingInvoice[],
  opts: { search?: string; status?: CenterInvoiceStatus | "all" },
): CenterBillingInvoice[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return invoices.filter((inv) => {
    if (opts.status && opts.status !== "all" && inv.status !== opts.status) return false;
    if (!q) return true;
    return (
      inv.businessName.toLowerCase().includes(q) ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.externalRef?.toLowerCase().includes(q) ?? false)
    );
  });
}

export const centerInvoiceStatusColors: Record<CenterInvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  open: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  past_due: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  void: "bg-muted text-muted-foreground",
  uncollectible: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function getCenterAuditStats(logs = centerAuditLogs) {
  const operator = logs.filter((l) => l.actorType === "operator").length;
  const system = logs.filter((l) => l.actorType === "system").length;
  const agent = logs.filter((l) => l.actorType === "agent").length;
  const security = logs.filter((l) => l.resourceType === "security").length;

  return { total: logs.length, operator, system, agent, security };
}

export function getCenterAuditLog(id: string): CenterAuditLogEntry | undefined {
  return centerAuditLogs.find((l) => l.id === id);
}

export function filterCenterAuditLogs(
  logs: CenterAuditLogEntry[],
  opts: {
    search?: string;
    actorType?: CenterAuditActorType | "all";
    resourceType?: CenterAuditResourceType | "all";
  },
): CenterAuditLogEntry[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return logs.filter((log) => {
    if (opts.actorType && opts.actorType !== "all" && log.actorType !== opts.actorType) return false;
    if (opts.resourceType && opts.resourceType !== "all" && log.resourceType !== opts.resourceType) {
      return false;
    }
    if (!q) return true;
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorLabel.toLowerCase().includes(q) ||
      (log.clientName?.toLowerCase().includes(q) ?? false) ||
      log.correlationId.toLowerCase().includes(q) ||
      log.resourceId.toLowerCase().includes(q)
    );
  });
}

export const centerAuditActorTypeColors: Record<CenterAuditActorType, string> = {
  operator: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  system: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  agent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
};

export const centerAuditResourceTypeLabels: Record<CenterAuditResourceType, string> = {
  client: "Client",
  registration: "Registration",
  subscription: "Subscription",
  license: "License",
  module: "Module",
  update: "Update",
  backup: "Backup",
  billing: "Billing",
  agent: "Agent",
  ai: "AI",
  security: "Security",
};

export function formatAuditTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCenterSettingsStats() {
  const operators = centerOperators.length;
  const activeOperators = centerOperators.filter((o) => o.status === "active").length;
  const invited = centerOperators.filter((o) => o.status === "invited").length;
  const apiKeys = centerApiKeys.filter((k) => k.status === "active").length;
  const revokedKeys = centerApiKeys.filter((k) => k.status === "revoked").length;

  return { operators, activeOperators, invited, apiKeys, revokedKeys };
}

export function getCenterOperator(id: string): CenterOperator | undefined {
  return centerOperators.find((o) => o.id === id);
}

export function filterCenterOperators(
  operators: CenterOperator[],
  opts: { search?: string; role?: CenterOperatorRole | "all"; status?: CenterOperatorStatus | "all" },
): CenterOperator[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return operators.filter((op) => {
    if (opts.role && opts.role !== "all" && op.role !== opts.role) return false;
    if (opts.status && opts.status !== "all" && op.status !== opts.status) return false;
    if (!q) return true;
    return (
      op.name.toLowerCase().includes(q) ||
      op.email.toLowerCase().includes(q) ||
      op.role.toLowerCase().includes(q)
    );
  });
}

export function filterCenterApiKeys(
  keys: CenterApiKey[],
  opts: { search?: string; status?: CenterApiKeyStatus | "all"; ownerType?: CenterApiKeyOwnerType | "all" },
): CenterApiKey[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return keys.filter((key) => {
    if (opts.status && opts.status !== "all" && key.status !== opts.status) return false;
    if (opts.ownerType && opts.ownerType !== "all" && key.ownerType !== opts.ownerType) return false;
    if (!q) return true;
    return (
      key.name.toLowerCase().includes(q) ||
      key.keyPrefix.toLowerCase().includes(q) ||
      key.ownerLabel.toLowerCase().includes(q)
    );
  });
}

export function getCenterApiKey(id: string): CenterApiKey | undefined {
  return centerApiKeys.find((k) => k.id === id);
}

export const centerOperatorRoleLabels: Record<CenterOperatorRole, string> = {
  super_admin: "Super Admin",
  platform_admin: "Platform Admin",
  support_agent: "Support Agent",
  billing_admin: "Billing Admin",
  read_only: "Read Only",
  partner_admin: "Partner Admin",
};

export const centerOperatorStatusColors: Record<CenterOperatorStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  invited: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  disabled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export const centerApiKeyStatusColors: Record<CenterApiKeyStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  revoked: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  expired: "bg-muted text-muted-foreground",
};

export function getCenterAgentConsoleStats(
  commands = centerAgentCommands,
  bundles = centerActivationBundles,
  syncQueues = centerAgentSyncQueues,
  diagnostics = centerAgentDiagnostics,
) {
  return {
    pendingCommands: commands.filter((c) =>
      ["queued", "delivered", "running"].includes(c.status),
    ).length,
    succeededToday: commands.filter((c) => c.status === "succeeded").length,
    failedOrExpired: commands.filter((c) => ["failed", "expired"].includes(c.status)).length,
    pendingActivations: bundles.filter((b) => b.status === "pending").length,
    offlineAgents: syncQueues.filter((q) => q.connectivity === "offline").length,
    queuedItems: syncQueues.reduce((sum, q) => sum + q.pendingCount, 0),
    diagnosticsReady: diagnostics.filter((d) => d.status === "ready").length,
    diagnosticsPending: diagnostics.filter((d) =>
      ["requested", "collecting", "uploading"].includes(d.status),
    ).length,
  };
}

export function filterCenterAgentCommands(
  commands: CenterAgentCommand[],
  opts: {
    search?: string;
    status?: CenterAgentCommandStatus | "all";
    risk?: CenterAgentCommandRisk | "all";
    type?: CenterAgentCommandType | "all";
  },
): CenterAgentCommand[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return commands.filter((cmd) => {
    if (opts.status && opts.status !== "all" && cmd.status !== opts.status) return false;
    if (opts.risk && opts.risk !== "all" && cmd.risk !== opts.risk) return false;
    if (opts.type && opts.type !== "all" && cmd.type !== opts.type) return false;
    if (!q) return true;
    return (
      cmd.businessName.toLowerCase().includes(q) ||
      cmd.type.toLowerCase().includes(q) ||
      cmd.issuedBy.toLowerCase().includes(q) ||
      cmd.id.toLowerCase().includes(q)
    );
  });
}

export function filterCenterActivationBundles(
  bundles: CenterActivationBundle[],
  opts: { search?: string; status?: CenterActivationBundleStatus | "all" },
): CenterActivationBundle[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return bundles.filter((bundle) => {
    if (opts.status && opts.status !== "all" && bundle.status !== opts.status) return false;
    if (!q) return true;
    return (
      bundle.businessName.toLowerCase().includes(q) ||
      bundle.bootstrapTokenPrefix.toLowerCase().includes(q) ||
      bundle.createdBy.toLowerCase().includes(q)
    );
  });
}

export function getCenterAgentCommand(id: string): CenterAgentCommand | undefined {
  return centerAgentCommands.find((c) => c.id === id);
}

export function getCenterAgentCommandsForClient(clientId: string): CenterAgentCommand[] {
  return centerAgentCommands.filter((c) => c.clientId === clientId);
}

export function getCenterAgentSyncQueuesForClient(clientId: string): CenterAgentSyncQueue[] {
  return centerAgentSyncQueues.filter((q) => q.clientId === clientId);
}

export function filterCenterAgentSyncQueues(
  queues: CenterAgentSyncQueue[],
  opts: {
    search?: string;
    connectivity?: CenterAgentConnectivity | "all";
    queueType?: CenterAgentQueueType | "all";
  },
): CenterAgentSyncQueue[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return queues.filter((item) => {
    if (opts.connectivity && opts.connectivity !== "all" && item.connectivity !== opts.connectivity)
      return false;
    if (opts.queueType && opts.queueType !== "all" && item.queueType !== opts.queueType) return false;
    if (!q) return true;
    return (
      item.businessName.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.queueType.toLowerCase().includes(q)
    );
  });
}

export function filterCenterAgentDiagnostics(
  diagnostics: CenterAgentDiagnostic[],
  opts: { search?: string; status?: CenterDiagnosticStatus | "all" },
): CenterAgentDiagnostic[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  return diagnostics.filter((item) => {
    if (opts.status && opts.status !== "all" && item.status !== opts.status) return false;
    if (!q) return true;
    return (
      item.businessName.toLowerCase().includes(q) ||
      item.requestedBy.toLowerCase().includes(q) ||
      item.bundlePrefix.toLowerCase().includes(q)
    );
  });
}

export function getCenterAgentDiagnostic(id: string): CenterAgentDiagnostic | undefined {
  return centerAgentDiagnostics.find((d) => d.id === id);
}

export const centerAgentCommandTypeLabels: Record<CenterAgentCommandType, string> = {
  "config.reload": "Config reload",
  "module.enable": "Module enable",
  "update.apply": "Update apply",
  "backup.run": "Backup run",
  "agent.restart": "Agent restart",
  "diagnostics.collect": "Diagnostics collect",
  "container.restart": "Container restart",
};

export const centerAgentCommandStatusColors: Record<CenterAgentCommandStatus, string> = {
  queued: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  delivered: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  running: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  succeeded: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export const centerAgentCommandRiskColors: Record<CenterAgentCommandRisk, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export const centerActivationBundleStatusColors: Record<CenterActivationBundleStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  activated: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  expired: "bg-muted text-muted-foreground",
  revoked: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export const centerAgentConnectivityColors: Record<CenterAgentConnectivity, string> = {
  online: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  degraded: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  offline: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export const centerAgentQueueTypeLabels: Record<CenterAgentQueueType, string> = {
  update: "Update",
  ai_request: "AI proxy",
  command: "Command",
  config: "Config sync",
};

export const centerDiagnosticStatusColors: Record<CenterDiagnosticStatus, string> = {
  requested: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  collecting: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  uploading: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  expired: "bg-muted text-muted-foreground",
};

export const centerNotificationCategoryLabels: Record<CenterNotificationCategory, string> = {
  agent: "Agent",
  registration: "Registration",
  billing: "Billing",
  security: "Security",
  update: "Update",
  system: "System",
};

export const centerNotificationSeverityColors: Record<CenterDashboardAlertSeverity, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
};

export function filterCenterPlatformNotifications(
  notifications: CenterPlatformNotification[],
  opts: {
    search?: string;
    category?: CenterNotificationCategory | "all";
    severity?: CenterDashboardAlertSeverity | "all";
    unreadOnly?: boolean;
    readIds?: string[];
  },
): CenterPlatformNotification[] {
  const q = opts.search?.trim().toLowerCase() ?? "";
  const readIds = opts.readIds ?? [];

  return notifications.filter((notification) => {
    if (opts.category && opts.category !== "all" && notification.category !== opts.category) {
      return false;
    }
    if (opts.severity && opts.severity !== "all" && notification.severity !== opts.severity) {
      return false;
    }
    if (opts.unreadOnly && readIds.includes(notification.id)) return false;
    if (!q) return true;
    return (
      notification.title.toLowerCase().includes(q) ||
      notification.body.toLowerCase().includes(q) ||
      centerNotificationCategoryLabels[notification.category].toLowerCase().includes(q)
    );
  });
}

export function getCenterNotificationStats(readIds: string[] = []) {
  const total = centerPlatformNotifications.length;
  const unread = centerPlatformNotifications.filter((n) => !readIds.includes(n.id)).length;
  const critical = centerPlatformNotifications.filter(
    (n) => n.severity === "critical" && !readIds.includes(n.id),
  ).length;

  return { total, unread, critical };
}
