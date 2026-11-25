import {
  BookOpen,
  CalendarDays,
  ChartPie,
  Ellipsis,
  House,
  Package,
  PiggyBank,
  Plane,
  ShoppingCart,
  Sparkles,
  Target,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Вкладка нижньої панелі (телефон), до якої належить розділ. */
export type MobileTab = "home" | "finance" | "shopping" | "food" | "more";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Вкладка нижньої панелі, яка підсвічується на сторінках цього розділу. */
  tab: MobileTab;
  /** Коли розділ з'явиться за roadmap — для заглушки. */
  availability: string;
  /** Пріоритет 1.0 (P1), а не MVP. */
  p1?: boolean;
};

/** Розділи застосунку в порядку бічної панелі (DESIGN.md §5). Єдине джерело пунктів навігації. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Головна", icon: House, tab: "home", availability: "на тижні 4" },
  {
    href: "/finance",
    label: "Фінанси",
    icon: Wallet,
    tab: "finance",
    availability: "на тижнях 2–3",
  },
  {
    href: "/finance/budgets",
    label: "Бюджети",
    icon: PiggyBank,
    tab: "more",
    availability: "на тижні 5",
  },
  {
    href: "/finance/analytics",
    label: "Аналітика",
    icon: ChartPie,
    tab: "more",
    availability: "на тижні 6",
  },
  { href: "/goals", label: "Цілі", icon: Target, tab: "more", availability: "на тижні 7" },
  {
    href: "/shopping",
    label: "Покупки",
    icon: ShoppingCart,
    tab: "shopping",
    availability: "на тижні 8",
  },
  {
    href: "/food/menu",
    label: "Меню",
    icon: CalendarDays,
    tab: "food",
    availability: "на тижні 10",
  },
  {
    href: "/food/recipes",
    label: "Рецепти",
    icon: BookOpen,
    tab: "food",
    availability: "на тижні 9",
  },
  {
    href: "/pantry",
    label: "Запаси",
    icon: Package,
    tab: "more",
    availability: "на тижні 13",
    p1: true,
  },
  {
    href: "/travel",
    label: "Подорожі",
    icon: Plane,
    tab: "more",
    availability: "на тижні 11",
    p1: true,
  },
  {
    href: "/assistant",
    label: "AI-помічник",
    icon: Sparkles,
    tab: "more",
    availability: "на тижні 16",
    p1: true,
  },
];

export type MobileTabItem = {
  tab: MobileTab;
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Вкладки нижньої панелі: Головна · Фінанси · [+] · Покупки · Їжа · Ще (DESIGN.md §5). */
export const MOBILE_TABS_LEFT: readonly MobileTabItem[] = [
  { tab: "home", href: "/", label: "Головна", icon: House },
  { tab: "finance", href: "/finance", label: "Фінанси", icon: Wallet },
];

export const MOBILE_TABS_RIGHT: readonly MobileTabItem[] = [
  { tab: "shopping", href: "/shopping", label: "Покупки", icon: ShoppingCart },
  { tab: "food", href: "/food/menu", label: "Їжа", icon: UtensilsCrossed },
  { tab: "more", href: "/more", label: "Ще", icon: Ellipsis },
];

/** Розділи, що на телефоні доступні через «Ще», у порядку DESIGN.md §5. */
const MORE_ORDER = [
  "/goals",
  "/finance/budgets",
  "/finance/analytics",
  "/travel",
  "/pantry",
  "/assistant",
] as const;

export const MORE_ITEMS: readonly NavItem[] = MORE_ORDER.map((href) => findItemByHref(href));

/** Підрозділи вкладки «Їжа»: на телефоні перемикаються вкладками під заголовком (DESIGN.md §5). */
const FOOD_ORDER = ["/food/menu", "/food/recipes"] as const;

export const FOOD_ITEMS: readonly NavItem[] = FOOD_ORDER.map((href) => findItemByHref(href));

function matches(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Розділ, до якого належить сторінка: найдовший збіг префікса (щоб /finance/budgets ≠ /finance). */
export function findActiveItem(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const item of NAV_ITEMS) {
    if (matches(pathname, item.href) && (!best || item.href.length > best.href.length)) {
      best = item;
    }
  }
  return best;
}

export function findItemByHref(href: string): NavItem {
  const item = NAV_ITEMS.find((candidate) => candidate.href === href);
  if (!item) throw new Error(`Невідомий розділ навігації: ${href}`);
  return item;
}

/** Активна вкладка нижньої панелі для поточної сторінки. */
export function findActiveTab(pathname: string): MobileTab | undefined {
  if (matches(pathname, "/more")) return "more";
  return findActiveItem(pathname)?.tab;
}
