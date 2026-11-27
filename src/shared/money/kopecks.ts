// Тип грошей у коді — `Kopecks`: ціле число копійок (TECHNICAL_PLAN §9.1, BR-8).

declare const kopecksBrand: unique symbol;

/**
 * Сума в копійках: безпечне ціле `number` з «брендом», щоб звичайне число
 * (відсоток, кількість, гривні) не можна було випадково передати як гроші.
 */
export type Kopecks = number & { readonly [kopecksBrand]: true };

/** Межа однієї введеної суми: 10 000 000 ₴ (TECHNICAL_PLAN §6). На агрегати не поширюється. */
export const MAX_AMOUNT_KOPECKS = 1_000_000_000 as Kopecks;

/** Нуль копійок. */
export const ZERO_KOPECKS = 0 as Kopecks;

/** Чи є значення допустимою сумою в копійках (безпечне ціле). */
export function isKopecks(value: unknown): value is Kopecks {
  return typeof value === "number" && Number.isSafeInteger(value);
}

/**
 * Перетворює ціле число копійок на `Kopecks`. Дробове, `NaN`, `Infinity` чи значення
 * поза безпечним діапазоном цілих — помилка програміста, тому `RangeError`.
 * `-0` нормалізується до `0`.
 */
export function toKopecks(value: number): Kopecks {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Сума в копійках має бути безпечним цілим числом, отримано: ${value}`);
  }
  return (value === 0 ? 0 : value) as Kopecks;
}
