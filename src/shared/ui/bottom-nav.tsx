"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import {
  MOBILE_TABS_LEFT,
  MOBILE_TABS_RIGHT,
  findActiveTab,
  type MobileTabItem,
} from "@/shared/ui/nav-items";
import { NewOperationDrawer } from "@/shared/ui/new-operation-drawer";

function TabLink({ item, active }: { item: MobileTabItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-14 min-w-0 pressable-nav flex-col items-center justify-center gap-[3px] rounded-[22px] text-xs font-bold focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="size-[22px]" aria-hidden="true" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

/** Плаваюча скляна нижня панель для телефона (< 768 px), DESIGN.md §5. */
export function BottomNav() {
  const pathname = usePathname();
  const activeTab = findActiveTab(pathname);

  return (
    <nav
      aria-label="Основна навігація"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="grid h-[68px] animate-nav-in grid-cols-6 items-center gap-0.5 rounded-sheet border border-glass-border bg-glass-strong p-1.5 shadow-glass glass-blur">
        {MOBILE_TABS_LEFT.map((item) => (
          <TabLink key={item.tab} item={item} active={activeTab === item.tab} />
        ))}
        <div className="flex justify-center">
          <NewOperationDrawer
            trigger={
              <button
                type="button"
                aria-label="Нова операція"
                className="flex size-[52px] pressable-nav items-center justify-center rounded-full bg-primary text-primary-foreground shadow-primary-glow focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Plus className="size-[26px]" strokeWidth={2.5} aria-hidden="true" />
              </button>
            }
          />
        </div>
        {MOBILE_TABS_RIGHT.map((item) => (
          <TabLink key={item.tab} item={item} active={activeTab === item.tab} />
        ))}
      </div>
    </nav>
  );
}
