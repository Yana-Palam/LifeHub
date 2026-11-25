import type { Metadata } from "next";

import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

export const metadata: Metadata = { title: "Аналітика" };

export default function Page() {
  return <SectionPlaceholder href="/finance/analytics" />;
}
