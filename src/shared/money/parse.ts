import { MAX_AMOUNT_KOPECKS, toKopecks, type Kopecks } from "./kopecks";

export type ParseUahErrorCode =
  "empty" | "invalid" | "too_many_decimals" | "negative" | "out_of_range";

export type ParseUahResult =
  { ok: true; value: Kopecks } | { ok: false; code: ParseUahErrorCode; message: string };

export interface ParseUahOptions {
  /**
   * Дозволити від'ємну суму. За замовчуванням — ні: суми транзакцій, бюджетів і цілей
   * додатні (BR-12). Вмикати лише там, де мінус законний (початковий баланс рахунку).
   */
  allowNegative?: boolean;
}

export const PARSE_UAH_MESSAGES: Readonly<Record<ParseUahErrorCode, string>> = {
  empty: "Введіть суму",
  invalid: "Некоректна сума. Приклад: 1 234,56",
  too_many_decimals: "Не більше 2 знаків після коми",
  negative: "Сума не може бути від'ємною",
  out_of_range: "Сума не може перевищувати 10 000 000 ₴",
};

const MINUS_SIGNS = new Set(["-", "−"]);
/** Ціла частина (може бути порожньою: ",5") і необов'язкова дробова після коми чи крапки. */
const AMOUNT_PATTERN = /^([0-9]*)(?:[.,]([0-9]*))?$/;
/** Найбільша ціла частина в гривнях має 8 цифр (10 000 000). */
const MAX_HRYVNIA_DIGITS = 8;

function fail(code: ParseUahErrorCode): ParseUahResult {
  return { ok: false, code, message: PARSE_UAH_MESSAGES[code] };
}

/** Рядок ASCII-цифр → ціле, цифра за цифрою (без parseFloat/Number). Довжину перевіряє виклик. */
function digitsToInteger(digits: string): number {
  let result = 0;
  for (let index = 0; index < digits.length; index += 1) {
    result = result * 10 + (digits.charCodeAt(index) - 48);
  }
  return result;
}

/**
 * Розбирає введену користувачем суму в гривнях у копійки:
 * `"1 234,56"` → `123456`, `"0.5"` → `50`, `"−1 234,56 ₴"` (з `allowNegative`) → `-123456`.
 *
 * - Будь-які пробіли (звичайні, нерозривні U+00A0/U+202F, тонкі) ігноруються.
 * - Необов'язковий знак `₴` у кінці.
 * - Десятковий роздільник — кома або крапка, один; після нього 0–2 цифри.
 * - Роздільники тисяч крапкою чи комою («1.234,56») не приймаються.
 * - Мінус `-` або `−` на початку — лише з `allowNegative`.
 * - Модуль суми не більший за 10 000 000 ₴ (`MAX_AMOUNT_KOPECKS`).
 * - Нуль приймається; правило «сума > 0» перевіряють схеми модулів.
 */
export function parseUah(input: string, options: ParseUahOptions = {}): ParseUahResult {
  let text = input.replace(/\s+/g, "");
  if (text === "") {
    return fail("empty");
  }

  if (text.endsWith("₴")) {
    text = text.slice(0, -1);
  }

  let negative = false;
  if (MINUS_SIGNS.has(text.charAt(0))) {
    negative = true;
    text = text.slice(1);
  }

  const match = AMOUNT_PATTERN.exec(text);
  if (!match) {
    return fail("invalid");
  }
  const integerDigits = match[1];
  const fractionDigits = match[2] ?? "";
  if (integerDigits === "" && fractionDigits === "") {
    return fail("invalid");
  }
  if (fractionDigits.length > 2) {
    return fail("too_many_decimals");
  }

  const significantDigits = integerDigits.replace(/^0+/, "");
  // Знак перевіряємо раніше за межу: для «-99 999 999» без allowNegative головне — мінус.
  const isZero = significantDigits === "" && !/[1-9]/.test(fractionDigits);
  if (negative && !isZero && !options.allowNegative) {
    return fail("negative");
  }
  if (significantDigits.length > MAX_HRYVNIA_DIGITS) {
    return fail("out_of_range");
  }

  const hryvnias = digitsToInteger(significantDigits);
  const kopecksPart = digitsToInteger(fractionDigits.padEnd(2, "0"));
  const magnitude = hryvnias * 100 + kopecksPart;

  if (magnitude > MAX_AMOUNT_KOPECKS) {
    return fail("out_of_range");
  }

  return { ok: true, value: toKopecks(negative ? -magnitude : magnitude) };
}
