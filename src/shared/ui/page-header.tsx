import type { ReactNode } from "react";

/** Липка скляна шапка екрана з великим заголовком (H1) зліва і діями справа (DESIGN.md §5). */
export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Додатковий рядок під заголовком (наприклад, вкладки підрозділів). */
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-glass-border bg-glass pt-[env(safe-area-inset-top)] glass-blur">
      <div className="mx-auto flex max-w-[1200px] items-end justify-between gap-3 px-4 py-3 md:px-8 md:py-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          {description ? (
            <p className="text-[13px]/[18px] font-semibold text-muted-foreground">{description}</p>
          ) : null}
          <h1 className="truncate text-[28px]/[34px] font-extrabold tracking-tight">{title}</h1>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mx-auto max-w-[1200px] px-4 md:px-8">{children}</div> : null}
    </header>
  );
}
