import { describe, expect, it } from "vitest";

import { formatUah, MAX_AMOUNT_KOPECKS, parseUah, toKopecks, type Kopecks } from "@/shared/money";

const NBSP = " ";
const k = toKopecks;

describe("formatUah", () => {
  it.each([
    [0, `0,00${NBSP}₴`],
    [1, `0,01${NBSP}₴`],
    [5, `0,05${NBSP}₴`],
    [50, `0,50${NBSP}₴`],
    [100, `1,00${NBSP}₴`],
    [99999, `999,99${NBSP}₴`],
    [123456, `1${NBSP}234,56${NBSP}₴`],
    [12345678, `123${NBSP}456,78${NBSP}₴`],
    [1_000_000_000, `10${NBSP}000${NBSP}000,00${NBSP}₴`],
    [123456789012, `1${NBSP}234${NBSP}567${NBSP}890,12${NBSP}₴`],
  ])("%i коп. → %j", (value, expected) => {
    expect(formatUah(k(value))).toBe(expected);
  });

  it("від'ємні — з типографським мінусом U+2212", () => {
    expect(formatUah(k(-123456))).toBe(`−1${NBSP}234,56${NBSP}₴`);
    expect(formatUah(k(-1))).toBe(`−0,01${NBSP}₴`);
  });

  it("-0 форматується як 0 без мінуса", () => {
    expect(formatUah(-0 as Kopecks)).toBe(`0,00${NBSP}₴`);
  });

  it("найбільше безпечне ціле форматується точно", () => {
    expect(formatUah(k(Number.MAX_SAFE_INTEGER))).toBe(
      `90${NBSP}071${NBSP}992${NBSP}547${NBSP}409,91${NBSP}₴`,
    );
  });

  it("не приймає дробові копійки", () => {
    expect(() => formatUah(1.5 as Kopecks)).toThrow(RangeError);
    expect(() => formatUah(Number.NaN as Kopecks)).toThrow(RangeError);
  });

  it.each([0, 1, 99, 100, 123456, -123456, MAX_AMOUNT_KOPECKS, -MAX_AMOUNT_KOPECKS])(
    "parseUah(formatUah(%i)) повертає те саме значення",
    (value) => {
      expect(parseUah(formatUah(k(value)), { allowNegative: true })).toEqual({
        ok: true,
        value,
      });
    },
  );
});
