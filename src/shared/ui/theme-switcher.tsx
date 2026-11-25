"use client";

import { Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/shared/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

type ThemeValue = "light" | "dark";

const THEMES: readonly { value: ThemeValue; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Світла", icon: Sun },
  { value: "dark", label: "Темна", icon: Moon },
];

function subscribe() {
  return () => {};
}

/** true лише на клієнті: застосована тема відома тільки після гідратації. */
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function isThemeValue(value: string | undefined): value is ThemeValue {
  return THEMES.some((theme) => theme.value === value);
}

/**
 * Застосована тема — світла чи темна. Поки користувач нічого не вибрав, вона визначається
 * системою (next-themes, defaultTheme="system"); вибір у перемикачі зберігається і далі має пріоритет.
 */
function useAppliedTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();
  const theme = isClient && isThemeValue(resolvedTheme) ? resolvedTheme : undefined;
  return { theme, setTheme };
}

/** Перемикач теми: Світла / Темна (DESIGN.md §6). */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useAppliedTheme();

  return (
    <ToggleGroup
      type="single"
      value={theme ?? ""}
      onValueChange={(next) => {
        if (isThemeValue(next)) setTheme(next);
      }}
      aria-label="Тема оформлення"
      className={cn("grid w-full grid-cols-2 gap-1 rounded-lg bg-muted p-1", className)}
    >
      {THEMES.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          className="h-11 gap-1.5 rounded-md! px-1 text-[13px] font-semibold text-muted-foreground transition-colors duration-(--dur-base) hover:bg-transparent hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-card"
        >
          <Icon aria-hidden="true" />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** Компактний перемикач для вузької бічної панелі: одна кнопка світла ↔ темна. */
export function ThemeSwitcherCompact({ className }: { className?: string }) {
  const { theme, setTheme } = useAppliedTheme();
  const current = THEMES.find((item) => item.value === theme) ?? THEMES[0];
  const next = THEMES.find((item) => item.value !== current.value) ?? THEMES[1];
  const Icon = current.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setTheme(next.value)}
          aria-label={`Тема: ${current.label.toLowerCase()}. Змінити на «${next.label.toLowerCase()}»`}
          className={cn(
            "flex size-11 pressable items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            className,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">Тема: {current.label.toLowerCase()}</TooltipContent>
    </Tooltip>
  );
}
