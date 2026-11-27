import { describe, expect, it } from "vitest";

import {
  add,
  allocate,
  isKopecks,
  MAX_AMOUNT_KOPECKS,
  negate,
  percentOf,
  subtract,
  sum,
  toKopecks,
  ZERO_KOPECKS,
  type Kopecks,
} from "@/shared/money";

const k = toKopecks;
const MAX_SAFE = k(Number.MAX_SAFE_INTEGER);

describe("toKopecks / isKopecks", () => {
  it("приймає безпечні цілі", () => {
    expect(toKopecks(0)).toBe(0);
    expect(toKopecks(-150)).toBe(-150);
    expect(toKopecks(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
    expect(isKopecks(42)).toBe(true);
  });

  it.each([0.1, 1.5, Number.NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "відхиляє %d",
    (value) => {
      expect(() => toKopecks(value)).toThrow(RangeError);
      expect(isKopecks(value)).toBe(false);
    },
  );

  it("isKopecks відхиляє не-числа", () => {
    expect(isKopecks("100")).toBe(false);
    expect(isKopecks(BigInt(100))).toBe(false);
    expect(isKopecks(null)).toBe(false);
  });

  it("нормалізує -0", () => {
    expect(Object.is(toKopecks(-0), 0)).toBe(true);
  });

  it("межа однієї суми — 1 000 000 000 коп.", () => {
    expect(MAX_AMOUNT_KOPECKS).toBe(1_000_000_000);
  });
});

describe("add / subtract / negate / sum", () => {
  it("класичний float-приклад 0,10 + 0,20 дає рівно 0,30", () => {
    expect(add(k(10), k(20))).toBe(30);
  });

  it("додає й віднімає, зокрема з переходом через нуль", () => {
    expect(add(k(123456), k(-456))).toBe(123000);
    expect(subtract(k(100), k(250))).toBe(-150);
    expect(subtract(k(5), k(5))).toBe(0);
  });

  it("negate", () => {
    expect(negate(k(150))).toBe(-150);
    expect(negate(k(-150))).toBe(150);
    expect(Object.is(negate(ZERO_KOPECKS), 0)).toBe(true);
  });

  it("sum: порожній список — 0; агрегати можуть перевищувати межу однієї суми", () => {
    expect(sum([])).toBe(0);
    expect(sum([k(1), k(2), k(3)])).toBe(6);
    expect(sum([MAX_AMOUNT_KOPECKS, MAX_AMOUNT_KOPECKS, k(-1)])).toBe(1_999_999_999);
  });

  it("сума 0,01 × 1000 точна", () => {
    expect(sum(Array.from({ length: 1000 }, () => k(1)))).toBe(1000);
  });

  it("переповнення безпечного діапазону — RangeError, а не втрата точності", () => {
    expect(() => add(MAX_SAFE, k(1))).toThrow(RangeError);
    expect(() => subtract(negate(MAX_SAFE), k(1))).toThrow(RangeError);
    expect(() => sum([MAX_SAFE, k(1)])).toThrow(RangeError);
  });

  it("дробові операнди відхиляються, навіть якщо результат цілий", () => {
    expect(() => add(0.5 as Kopecks, 0.5 as Kopecks)).toThrow(RangeError);
    expect(() => subtract(1.5 as Kopecks, 0.5 as Kopecks)).toThrow(RangeError);
    expect(() => negate(Number.NaN as Kopecks)).toThrow(RangeError);
    expect(() => sum([0.5 as Kopecks, 0.5 as Kopecks])).toThrow(RangeError);
  });
});

describe("percentOf", () => {
  it("повертає відсоток як звичайне число (не гроші)", () => {
    expect(percentOf(k(2500), k(10000))).toBe(25);
    expect(percentOf(k(0), k(10000))).toBe(0);
    expect(percentOf(k(10000), k(10000))).toBe(100);
  });

  it("може бути дробовим, > 100 або від'ємним — обмеження робить домен", () => {
    expect(percentOf(k(1), k(3))).toBeCloseTo(33.3333, 4);
    expect(percentOf(k(15000), k(10000))).toBe(150);
    expect(percentOf(k(-500), k(10000))).toBe(-5);
    expect(percentOf(k(7), k(100))).toBe(7);
  });

  it.each([0, -100])("база %i → RangeError", (whole) => {
    expect(() => percentOf(k(100), k(whole))).toThrow(RangeError);
  });

  it("недопустимі операнди (NaN, дробові) → RangeError", () => {
    expect(() => percentOf(k(1), Number.NaN as Kopecks)).toThrow(RangeError);
    expect(() => percentOf(0.5 as Kopecks, k(100))).toThrow(RangeError);
  });
});

describe("allocate", () => {
  it.each<[number, number[], number[]]>([
    [100, [1, 1, 1], [34, 33, 33]],
    [101, [1, 1], [51, 50]],
    [1000, [1, 2, 7], [100, 200, 700]],
    [5, [3, 7], [2, 3]],
    [0, [1, 1], [0, 0]],
    [10, [0, 1], [0, 10]],
    [-100, [1, 1, 1], [-34, -33, -33]],
    [2, [1, 1, 1], [1, 1, 0]],
    [1_000_000_000, [1, 1, 1], [333_333_334, 333_333_333, 333_333_333]],
  ])("allocate(%i, %j) → %j", (total, ratios, expected) => {
    const parts = allocate(k(total), ratios);
    expect(parts).toEqual(expected);
    expect(sum(parts)).toBe(total);
  });

  it("зайва копійка йде частці з найбільшим залишком", () => {
    // 10 × [1, 2] / 3 = [3,33…; 6,66…] → залишок більший у другої частки
    expect(allocate(k(10), [1, 2])).toEqual([3, 7]);
  });

  it("частини — цілі копійки, без -0", () => {
    const parts = allocate(k(-1), [1, 1]);
    expect(parts).toEqual([-1, 0]);
    expect(Object.is(parts[1], 0)).toBe(true);
  });

  it.each<[string, number[]]>([
    ["порожні частки", []],
    ["усі нулі", [0, 0]],
    ["від'ємна частка", [1, -1]],
    ["дробова частка", [0.5, 1]],
    ["NaN", [Number.NaN]],
  ])("%s → RangeError", (_name, ratios) => {
    expect(() => allocate(k(100), ratios)).toThrow(RangeError);
  });

  it("завеликі значення для точного розподілу → RangeError", () => {
    // MAX_SAFE × 2 виходить за безпечний діапазон проміжного добутку
    expect(() => allocate(MAX_SAFE, [1, 2])).toThrow(RangeError);
    // а з одиничними вагами проміжні значення безпечні
    expect(sum(allocate(MAX_SAFE, [1, 1]))).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("не приймає дробову суму", () => {
    expect(() => allocate(1.5 as Kopecks, [1])).toThrow(RangeError);
  });
});
