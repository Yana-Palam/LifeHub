import { toKopecks, type Kopecks } from "./kopecks";

/** Групування тисяч за українською локаллю; форматуємо лише цілі гривні, без дробів. */
const hryvniaFormatter = new Intl.NumberFormat("uk-UA", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

const NBSP = " ";
/** Типографський мінус, як у DESIGN.md («−350 ₴»). */
const MINUS = "−";

/**
 * Форматує копійки як `"1 234,56 ₴"`: пробіли між тисячами й перед ₴ — нерозривні,
 * завжди 2 знаки копійок, від'ємні — з типографським мінусом `−`.
 * Обчислення лише цілочисельні; знак «+» і колір — справа компонента відображення.
 */
export function formatUah(value: Kopecks): string {
  const amount = toKopecks(value);
  const magnitude = Math.abs(amount);
  const kopecksPart = magnitude % 100;
  const hryvnias = (magnitude - kopecksPart) / 100;

  // Роздільник груп залежить від ICU; приводимо будь-який пробіл до нерозривного.
  const grouped = hryvniaFormatter.format(hryvnias).replace(/\s/g, NBSP);
  const sign = amount < 0 ? MINUS : "";

  return `${sign}${grouped},${String(kopecksPart).padStart(2, "0")}${NBSP}₴`;
}
