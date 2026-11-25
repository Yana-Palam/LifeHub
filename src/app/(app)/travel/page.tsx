import type { Metadata } from "next";

import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

export const metadata: Metadata = { title: "Подорожі" };

export default function Page() {
  return <SectionPlaceholder href="/travel" />;
}
