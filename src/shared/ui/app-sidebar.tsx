"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";
import { NAV_ITEMS, findActiveItem } from "@/shared/ui/nav-items";
import { NewOperationDrawer } from "@/shared/ui/new-operation-drawer";
import { ThemeSwitcher, ThemeSwitcherCompact } from "@/shared/ui/theme-switcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

/**
 * Скляна бічна панель (DESIGN.md §5):
 * ≥ 1024 px — 248 px з підписами; 768–1023 px — 72 px, лише іконки з підказками; < 768 px — прихована.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const activeHref = findActiveItem(pathname)?.href;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col gap-5 border-r border-glass-border bg-glass px-3 py-6 glass-blur md:flex lg:w-[248px] lg:px-4">
      <Link
        href="/"
        aria-label="LifeHub — на головну"
        className="flex items-center gap-2.5 rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none lg:px-2"
      >
        <span
          aria-hidden="true"
          className="mx-auto flex size-11 shrink-0 items-center justify-center rounded-lg bg-(image:--hero) text-base font-extrabold text-hero-foreground lg:mx-0 lg:size-9"
        >
          L
        </span>
        <span aria-hidden="true" className="hidden text-xl font-extrabold lg:inline">
          LifeHub
        </span>
      </Link>

      <NewOperationDrawer
        trigger={
          <button
            type="button"
            aria-label="Нова операція"
            className="flex h-11 pressable items-center justify-center gap-2 rounded-lg bg-primary text-[15px] font-extrabold text-primary-foreground shadow-primary-glow hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Plus className="size-5 lg:size-[18px]" strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden lg:inline" aria-hidden="true">
              Операція
            </span>
          </button>
        }
      />

      <nav aria-label="Розділи" className="-mx-1 flex flex-1 flex-col gap-0.5 overflow-y-auto px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === activeHref;
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 shrink-0 pressable items-center justify-center gap-3 rounded-[10px] text-sm font-bold focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none lg:h-10 lg:justify-start lg:px-3",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="size-6" aria-hidden="true" />
                  <span className="sr-only lg:not-sr-only">{label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="flex justify-center lg:block">
        <p className="mb-2 hidden px-2 text-xs font-semibold text-muted-foreground lg:block">
          Тема
        </p>
        <ThemeSwitcher className="hidden lg:grid" />
        <ThemeSwitcherCompact className="lg:hidden" />
      </div>
    </aside>
  );
}
