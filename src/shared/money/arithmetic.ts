// Арифметика грошей — лише цілочисельні операції над копійками (TECHNICAL_PLAN §9.1, BR-8).
// Вихід за безпечний діапазон цілих — `RangeError` (через `toKopecks`), а не тиха втрата точності.
import { toKopecks, ZERO_KOPECKS, type Kopecks } from "./kopecks";

// Операнди теж перевіряються: `as Kopecks` на дробовому числі не має пройти непомітно.
export function add(a: Kopecks, b: Kopecks): Kopecks {
  return toKopecks(toKopecks(a) + toKopecks(b));
}

export function subtract(a: Kopecks, b: Kopecks): Kopecks {
  return toKopecks(toKopecks(a) - toKopecks(b));
}

export function negate(value: Kopecks): Kopecks {
  return toKopecks(-toKopecks(value));
}

export function sum(values: readonly Kopecks[]): Kopecks {
  let total = ZERO_KOPECKS;
  for (const value of values) {
    total = add(total, value);
  }
  return total;
}

/**
 * Скільки відсотків `part` становить від `whole` (прогрес цілі, виконання бюджету).
 * Результат — звичайне `number`, а **не** гроші: може бути дробовим, від'ємним чи > 100.
 * Обмеження до 0–100 % — справа доменного коду (наприклад, `goals/domain`).
 */
export function percentOf(part: Kopecks, whole: Kopecks): number {
  const base = toKopecks(whole);
  if (base <= 0) {
    throw new RangeError(`База відсотка має бути додатною, отримано: ${whole}`);
  }
  return (toKopecks(part) * 100) / base;
}

/**
 * Ділить суму на частини пропорційно цілим невід'ємним вагам методом найбільшого залишку:
 * `allocate(100, [1, 1, 1])` → `[34, 33, 33]`. Сума частин завжди дорівнює `total`;
 * за рівних залишків зайву копійку отримує частина з меншим індексом.
 */
export function allocate(total: Kopecks, ratios: readonly number[]): Kopecks[] {
  if (ratios.length === 0) {
    throw new RangeError("Потрібна хоча б одна частка");
  }
  let ratioSum = 0;
  for (const ratio of ratios) {
    if (!Number.isSafeInteger(ratio) || ratio < 0) {
      throw new RangeError(`Частка має бути цілим невід'ємним числом, отримано: ${ratio}`);
    }
    ratioSum += ratio;
  }
  if (ratioSum === 0 || !Number.isSafeInteger(ratioSum)) {
    throw new RangeError("Сума часток має бути додатним безпечним цілим числом");
  }

  const amount = toKopecks(total);
  const magnitude = Math.abs(amount);
  const shares: number[] = [];
  const remainders: number[] = [];
  let distributed = 0;

  for (const ratio of ratios) {
    const numerator = magnitude * ratio;
    if (!Number.isSafeInteger(numerator)) {
      throw new RangeError("Сума або частки завеликі для точного розподілу");
    }
    const remainder = numerator % ratioSum;
    const share = (numerator - remainder) / ratioSum;
    shares.push(share);
    remainders.push(remainder);
    distributed += share;
  }

  const order = ratios
    .map((_, index) => index)
    .sort((left, right) => remainders[right] - remainders[left] || left - right);
  for (let leftover = magnitude - distributed, i = 0; leftover > 0; leftover -= 1, i += 1) {
    shares[order[i]] += 1;
  }

  return shares.map((share) => toKopecks(amount < 0 ? -share : share));
}
