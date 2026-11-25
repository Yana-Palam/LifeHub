import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { ThemeProvider } from "@/shared/ui/theme-provider";
import { TooltipProvider } from "@/shared/ui/tooltip";

import "./globals.css";

// Шрифт за DESIGN.md §3: Manrope, кирилиця, ваги 400–800 (змінний шрифт).
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "LifeHub", template: "%s · LifeHub" },
  description: "Your Life. Your Money. One Place.",
};

// Колір рядка стану — синхронно з --background у globals.css. Відоме обмеження:
// слідує системній темі, а не ручному вибору в перемикачі.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a110f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes ставить клас теми на <html> до гідратації.
    <html lang="uk" className={`${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
