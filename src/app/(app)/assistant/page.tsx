import type { Metadata } from "next";

import { SectionPlaceholder } from "@/shared/ui/section-placeholder";

export const metadata: Metadata = { title: "AI-помічник" };

export default function Page() {
  return <SectionPlaceholder href="/assistant" />;
}
