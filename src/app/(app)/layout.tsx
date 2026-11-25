import { AppSidebar } from "@/shared/ui/app-sidebar";
import { BottomNav } from "@/shared/ui/bottom-nav";

/** Оболонка застосунку: бічна панель (≥ 768 px) або нижня панель (< 768 px), DESIGN.md §5. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh md:pl-[72px] lg:pl-[248px]">
      <AppSidebar />
      {/* Нижній відступ, щоб контент прокручувався з-під плаваючої нижньої панелі. */}
      <main className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
