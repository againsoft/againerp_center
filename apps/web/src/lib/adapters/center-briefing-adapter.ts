import type { ApiChiefAiBriefing } from "@/lib/api/ai";
import type {
  CenterChiefAiBriefing,
  CenterChiefBriefingInsight,
  CenterPlatformAiAgentId,
} from "@/lib/mock-data/center";

const AGENT_SOURCES = new Set<CenterPlatformAiAgentId>([
  "chief",
  "health",
  "recommendation",
  "update",
  "license",
  "monitoring",
  "automation",
]);

function mapSource(value: string): CenterChiefBriefingInsight["source"] {
  return AGENT_SOURCES.has(value as CenterPlatformAiAgentId)
    ? (value as CenterPlatformAiAgentId)
    : "chief";
}

export function apiBriefingToCenter(briefing: ApiChiefAiBriefing): CenterChiefAiBriefing {
  return {
    generatedAt: briefing.generated_at,
    summary: briefing.summary,
    insights: briefing.insights.map((row) => ({
      id: row.id,
      source: mapSource(row.source),
      text: row.text,
      href: row.href ?? undefined,
      hrefLabel: row.href_label ?? undefined,
    })),
    creditNote: briefing.credit_note ?? undefined,
  };
}
