import { EmptyState } from "@/shared/ui/empty-state";
import { FOOD_ITEMS, findItemByHref } from "@/shared/ui/nav-items";
import { PageHeader } from "@/shared/ui/page-header";
import { SectionTabs } from "@/shared/ui/section-tabs";

/** Сторінка-заглушка розділу, якого за roadmap ще немає. */
export function SectionPlaceholder({ href }: { href: string }) {
  const { label, icon, availability, p1, tab } = findItemByHref(href);
  return (
    <>
      <PageHeader title={label}>
        {tab === "food" ? (
          <SectionTabs items={FOOD_ITEMS} activeHref={href} label="Розділи «Їжа»" />
        ) : null}
      </PageHeader>
      <div className="mx-auto flex max-w-[1200px] stagger flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <EmptyState
          icon={icon}
          title={`Розділ зʼявиться ${availability}`}
          description={
            p1
              ? "Це частина LifeHub 1.0, яка зʼявиться після MVP."
              : "Поки що тут порожньо: розділ ще в розробці."
          }
        />
      </div>
    </>
  );
}
