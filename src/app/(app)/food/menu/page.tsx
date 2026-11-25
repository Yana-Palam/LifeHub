import type { Metadata } from "next";

import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

export const metadata: Metadata = { title: "Меню" };

export default function Page() {
  return <SectionPlaceholder href="/food/menu" />;
}
