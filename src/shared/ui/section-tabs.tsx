import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import type { NavItem } from "@/shared/ui/nav-items";

/**
 * Вкладки підрозділів під заголовком (зараз — «Меню / Рецепти» у вкладці «Їжа»).
 * Лише на телефоні: на ширших екранах обидва розділи є в бічній панелі.
 */
export function SectionTabs({
  items,
  activeHref,
  label,
}: {
  items: readonly NavItem[];
  activeHref: string;
  label: string;
}) {
  return (
    <nav aria-label={label} className="pb-3 md:hidden">
      <ul className="grid grid-flow-col gap-1 rounded-lg bg-muted p-1">
        {items.map(({ href, label: itemLabel }) => {
          const active = href === activeHref;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 pressable items-center justify-center rounded-md text-[13px] font-semibold focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
                  active
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {itemLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
