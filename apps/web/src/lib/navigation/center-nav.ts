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
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Fleet",
    items: [
      { title: "Clients", href: "/clients", icon: Building2 },
      {
        title: "Registrations",
        href: "/registrations",
        icon: UserPlus,
      },
    ],
  },
  {
    label: "Commercial",
    items: [
      { title: "Subscriptions", href: "/subscriptions", icon: ClipboardList },
      { title: "Licenses", href: "/licenses", icon: KeyRound },
      { title: "Billing", href: "/billing", icon: Wallet },
    ],
  },
  {
    label: "Technical",
    items: [
      { title: "Modules", href: "/modules", icon: Package },
      { title: "Updates", href: "/updates", icon: RefreshCw },
      { title: "Edge Agents", href: "/agents", icon: Radio },
      {
        title: "Monitoring",
        href: "/monitoring",
        icon: Activity,
      },
      { title: "Backups", href: "/backups", icon: ShieldCheck },
    ],
  },
  {
    label: "Platform",
    items: [
      { title: "AI Access", href: "/ai-access", icon: Bot },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Audit Log", href: "/audit", icon: FileText },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Flat list for badge lookups and legacy use */
export const centerNav = centerNavGroups.flatMap((group) => group.items);
