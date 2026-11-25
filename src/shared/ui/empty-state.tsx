import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Порожній стан: іконка в колі, одне речення, необовʼязкова дія (DESIGN.md §6). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-card bg-card px-6 py-10 text-center text-card-foreground shadow-card dark:border">
      <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h2 className="text-base/[22px] font-bold">{title}</h2>
      {description ? <p className="max-w-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </section>
  );
}
