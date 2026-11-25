import type { Metadata } from "next";

import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

export const metadata: Metadata = { title: "Покупки" };

export default function Page() {
  return <SectionPlaceholder href="/shopping" />;
}
