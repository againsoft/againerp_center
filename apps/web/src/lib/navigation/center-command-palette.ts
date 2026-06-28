import { centerClients } from "@/lib/mock-data/center";
import { centerNavGroups } from "@/lib/navigation/center-nav";

export const CENTER_COMMAND_PALETTE_OPEN_EVENT = "moharaz:center-command-palette";

export type CenterCommandItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  keywords?: string;
};

export function openCenterCommandPalette() {
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent(CENTER_COMMAND_PALETTE_OPEN_EVENT));
  }
}

export function buildCenterCommandItems(): CenterCommandItem[] {
  const navItems: CenterCommandItem[] = centerNavGroups.flatMap((group) =>
    group.items.map((item) => ({
      id: `nav-${item.href}`,
      group: group.label,
      label: item.title,
      hint: group.label,
      href: item.href,
      keywords: `${group.label} ${item.title}`,
    })),
  );

  const clientItems: CenterCommandItem[] = centerClients.map((client) => ({
    id: `client-${client.id}`,
    group: "Clients",
    label: client.businessName,
    hint: client.slug,
    href: `/center/clients/${client.id}`,
    keywords: `${client.businessName} ${client.slug} ${client.country} ${client.plan}`,
  }));

  const quickItems: CenterCommandItem[] = [
    {
      id: "quick-registrations",
      group: "Quick actions",
      label: "Review pending registrations",
      hint: "Fleet onboarding queue",
      href: "/center/registrations",
      keywords: "signup onboarding approve",
    },
    {
      id: "quick-monitoring",
      group: "Quick actions",
      label: "Open fleet monitoring",
      hint: "Agent heartbeat telemetry",
      href: "/center/monitoring",
      keywords: "health agents online",
    },
    {
      id: "quick-agents",
      group: "Quick actions",
      label: "Edge agent console",
      hint: "Commands and sync queues",
      href: "/center/agents",
      keywords: "command queue diagnostics",
    },
    {
      id: "quick-notifications",
      group: "Quick actions",
      label: "Platform notifications",
      hint: "Unread operator alerts",
      href: "/center/notifications",
      keywords: "alerts bell inbox",
    },
    {
      id: "quick-erp",
      group: "Quick actions",
      label: "Switch to ERP Admin",
      hint: "Tenant workspace",
      href: "/dashboard",
      keywords: "admin workspace tenant",
    },
  ];

  return [...quickItems, ...navItems, ...clientItems];
}
