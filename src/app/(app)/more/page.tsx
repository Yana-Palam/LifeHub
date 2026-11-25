import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MORE_ITEMS } from "@/shared/ui/nav-items";
import { PageHeader } from "@/shared/ui/page-header";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

export const metadata: Metadata = { title: "Ще" };

/** «Ще» на телефоні: розділи поза нижньою панеллю і налаштування (DESIGN.md §5). */
export default function MorePage() {
  return (
    <>
      <PageHeader title="Ще" />
      <div className="mx-auto flex max-w-[1200px] stagger flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <section aria-labelledby="more-sections" className="flex flex-col gap-2">
          <h2
            id="more-sections"
            className="px-1 text-[13px]/[18px] font-semibold text-muted-foreground"
          >
            Розділи
          </h2>
          <ul className="overflow-hidden rounded-card bg-card text-card-foreground shadow-card dark:border">
            {MORE_ITEMS.map(({ href, label, icon: Icon, availability, p1 }) => (
              <li key={href} className="border-b last:border-b-0">
                <Link
                  href={href}
                  className="flex min-h-14 items-center gap-3 px-4 py-2 transition-colors duration-(--dur-fast) hover:bg-accent focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-bold">{label}</span>
                    <span className="text-[13px]/[18px] text-muted-foreground">
                      {p1 ? "LifeHub 1.0 · " : ""}зʼявиться {availability}
                    </span>
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="more-settings" className="flex flex-col gap-2">
          <h2
            id="more-settings"
            className="px-1 text-[13px]/[18px] font-semibold text-muted-foreground"
          >
            Налаштування
          </h2>
          <div className="flex flex-col gap-3 rounded-card bg-card p-4 text-card-foreground shadow-card dark:border">
            <p className="font-bold">Тема оформлення</p>
            <ThemeSwitcher />
          </div>
        </section>
      </div>
    </>
  );
}
