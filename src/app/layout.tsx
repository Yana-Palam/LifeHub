import type { Metadata } from "next";
import "./globals.css";

// Шрифт Manrope і токени теми з docs/DESIGN.md підключаються на дні 2 roadmap.
export const metadata: Metadata = {
  title: "LifeHub",
  description: "Your Life. Your Money. One Place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
