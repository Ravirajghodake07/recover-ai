"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getNavItem } from "@/lib/navigation";

type HeaderProps = {
  onOpenMobileNav: () => void;
};

export function Header({ onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const current = getNavItem(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{current?.label ?? "RecoverAI"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {current?.description ?? "Autonomous revenue recovery"}
        </p>
      </div>
    </header>
  );
}
