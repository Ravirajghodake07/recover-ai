import type { NavItem } from "@/types";

export const appNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "RecoverAI Dashboard",
  },
  {
    href: "/recovery",
    label: "Recovery",
    description: "Recovery workspace",
  },
  {
    href: "/payments",
    label: "Payments",
    description: "Payments workspace",
  },
  {
    href: "/customers",
    label: "Customers",
    description: "Customers workspace",
  },
  {
    href: "/audit",
    label: "Audit",
    description: "Audit trail",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Workspace settings",
  },
];

export function getNavItem(pathname: string): NavItem | undefined {
  return appNavItems.find((item) => pathname === item.href);
}
