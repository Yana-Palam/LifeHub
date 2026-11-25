import type { Metadata } from "next";

import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

export const metadata: Metadata = { title: "Рецепти" };

export default function Page() {
  return <SectionPlaceholder href="/food/recipes" />;
}
