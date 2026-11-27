import { describe, expect, it } from "vitest";

import { parseUah, PARSE_UAH_MESSAGES, type ParseUahErrorCode } from "@/shared/money";

function expectValue(input: string, expected: number, allowNegative = false) {
  expect(parseUah(input, { allowNegative })).toEqual({ ok: true, value: expected });
}

function expectError(input: string, code: ParseUahErrorCode, allowNegative = false) {
  expect(parseUah(input, { allowNegative })).toEqual({
    ok: false,
    code,
    message: PARSE_UAH_MESSAGES[code],
  });
}

describe("parseUah", () => {
  describe("десятковий роздільник: кома і крапка", () => {
    it.each([
      ["1234,56", 123456],
      ["1234.56", 123456],
      ["0,01", 1],
      ["0.01", 1],
      ["12,5", 1250],
      ["12.5", 1250],
      ["12,50", 1250],
      ["12", 1200],
      ["12,", 1200],
      ["12.", 1200],
      [",5", 50],
      [".05", 5],
      ["007,10", 710],
    ])("%j → %i коп.", (input, expected) => {
      expectValue(input, expected);
    });

    it.each(["1.234,56", "1,234.56", "1,2,3", "1..2", ",", ".", "1,2.3"])(
      "відхиляє кілька роздільників або без цифр: %j",
      (input) => {
        expectError(input, "invalid");
      },
    );
  });

  describe("пробіли", () => {
    it.each([
      ["1 234,56", 123456],
      ["1 234,56", 123456], // нерозривний
      ["1 234,56", 123456], // вузький нерозривний
      ["1 234,56", 123456], // тонкий
      ["  1 234,56  ", 123456],
      ["\t1234,56\n", 123456],
      ["10 000 000", 1_000_000_000],
      ["1 234 , 56", 123456],
    ])("%j → %i коп.", (input, expected) => {
      expectValue(input, expected);
    });

    it.each(["", "   ", " ", "\t\n"])("порожній ввід %j → empty", (input) => {
      expectError(input, "empty");
    });
  });

  describe("знаки після коми", () => {
    it("рівно 2 знаки приймаються", () => {
      expectValue("99,99", 9999);
      expectValue("0,00", 0);
    });

    it.each(["1,234", "0,001", "1.999", "12,345"])(
      "більше 2 знаків → too_many_decimals: %j",
      (input) => {
        expectError(input, "too_many_decimals");
      },
    );
  });

  describe("символ гривні", () => {
    it("приймає ₴ у кінці (вставлення відформатованої суми)", () => {
      expectValue("1 234,56 ₴", 123456);
      expectValue("1 234,56 ₴", 123456);
      expectValue("5₴", 500);
    });

    it.each(["₴", "₴5", "5 ₴ ₴", "5 грн", "UAH 5"])("відхиляє %j", (input) => {
      expectError(input, "invalid");
    });
  });

  describe("від'ємні значення", () => {
    it.each(["-5", "−5", "-1 234,56", "−1 234,56 ₴"])(
      "за замовчуванням від'ємні заборонені: %j",
      (input) => {
        expectError(input, "negative");
      },
    );

    it.each([
      ["-5", -500],
      ["−5", -500],
      ["-1 234,56", -123456],
      ["−1 234,56 ₴", -123456],
      ["- 0,01", -1],
    ])("з allowNegative: %j → %i коп.", (input, expected) => {
      expectValue(input, expected, true);
    });

    it("мінус нуль — це нуль, без помилки й без -0", () => {
      const result = parseUah("-0,00");
      expect(result).toEqual({ ok: true, value: 0 });
      expect(result.ok && Object.is(result.value, -0)).toBe(false);
    });

    it.each(["--5", "5-", "+5", "-", "-₴", "1-2"])("відхиляє некоректний знак %j", (input) => {
      expectError(input, "invalid", true);
    });
  });

  describe("межі: 10 000 000 ₴ = 1 000 000 000 коп.", () => {
    it("рівно межа приймається", () => {
      expectValue("10 000 000", 1_000_000_000);
      expectValue("10000000,00", 1_000_000_000);
      expectValue("-10 000 000,00", -1_000_000_000, true);
    });

    it.each(["10 000 000,01", "10000001", "99 999 999,99", "100000000", "999999999999999999999"])(
      "понад межу → out_of_range: %j",
      (input) => {
        expectError(input, "out_of_range");
      },
    );

    it("понад межу з мінусом → out_of_range", () => {
      expectError("-10 000 000,01", "out_of_range", true);
    });

    it("без allowNegative мінус повідомляється раніше за межу", () => {
      expectError("-10 000 000,01", "negative");
      expectError("-999999999999", "negative");
    });

    it("провідні нулі не рахуються як розряди", () => {
      expectValue("0000000010000000", 1_000_000_000);
    });

    it("нуль і найменша сума", () => {
      expectValue("0", 0);
      expectValue("0,01", 1);
    });
  });

  describe("сміття", () => {
    it.each(["abc", "12a", "1e3", "0x10", "Infinity", "NaN", "１２", "١٢", "1/2", "(5)"])(
      "відхиляє %j",
      (input) => {
        expectError(input, "invalid");
      },
    );
  });

  it("повідомлення про помилки — українською", () => {
    const result = parseUah("abc");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Некоректна сума. Приклад: 1 234,56");
    }
  });
});
