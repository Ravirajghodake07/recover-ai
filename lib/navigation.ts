// lib/navigation.ts
import {
  LayoutDashboard,
  RotateCcw,
  ClipboardList,
  CreditCard,
  Users,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const appNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "RecoverAI Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/recovery",
    label: "Recovery",
    description: "Recovery workspace",
    icon: RotateCcw,
  },
  {
    href: "/approvals",
    label: "Approvals",
    description: "Approval queue",
    icon: ShieldCheck,
  },
  {
    href: "/payments",
    label: "Payments",
    description: "Payments workspace",
    icon: CreditCard,
  },
  {
    href: "/customers",
    label: "Customers",
    description: "Customers workspace",
    icon: Users,
  },
  {
    href: "/audit",
    label: "Audit",
    description: "Audit trail",
    icon: ClipboardList,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Workspace settings",
    icon: Settings,
  },
];

export function getNavItem(pathname: string): NavItem | undefined {
  return appNavItems.find((item) => pathname === item.href);
}