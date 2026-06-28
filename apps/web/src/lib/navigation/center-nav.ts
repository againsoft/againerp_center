import {
  Activity,
  Bell,
  Bot,
  Building2,
  ClipboardList,
  FileText,
  KeyRound,
  LayoutDashboard,
  Package,
  Radio,
  Receipt,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CenterNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** UI design step — for placeholder screens */
  uiStep?: string;
};

export type CenterNavGroup = {
  label: string;
  items: CenterNavItem[];
};

export const centerNavGroups: CenterNavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/center", icon: LayoutDashboard }],
  },
  {
    label: "Fleet",
    items: [
      { title: "Clients", href: "/center/clients", icon: Building2 },
      {
        title: "Registrations",
        href: "/center/registrations",
        icon: UserPlus,
      },
    ],
  },
  {
    label: "Commercial",
    items: [
      { title: "Subscriptions", href: "/center/subscriptions", icon: ClipboardList },
      { title: "Licenses", href: "/center/licenses", icon: KeyRound },
      { title: "Billing", href: "/center/billing", icon: Wallet },
    ],
  },
  {
    label: "Technical",
    items: [
      { title: "Modules", href: "/center/modules", icon: Package },
      { title: "Updates", href: "/center/updates", icon: RefreshCw },
      { title: "Edge Agents", href: "/center/agents", icon: Radio },
      {
        title: "Monitoring",
        href: "/center/monitoring",
        icon: Activity,
      },
      { title: "Backups", href: "/center/backups", icon: ShieldCheck },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "AI Access", href: "/center/ai-access", icon: Bot },
      { title: "Notifications", href: "/center/notifications", icon: Bell },
      { title: "Audit Log", href: "/center/audit", icon: FileText },
      { title: "Settings", href: "/center/settings", icon: Settings },
    ],
  },
];

/** Flat list for badge lookups and legacy use */
export const centerNav = centerNavGroups.flatMap((group) => group.items);
