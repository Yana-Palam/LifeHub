import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Гроші — лише цілі копійки через shared/money (TECHNICAL_PLAN §9.1, §11, §17).
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "parseFloat", message: "Для сум — parseUah із @/shared/money." },
      ],
      "no-restricted-properties": [
        "error",
        ...["Number", "globalThis", "window", "self"].map((object) => ({
          object,
          property: "parseFloat",
          message: "Для сум — parseUah із @/shared/money.",
        })),
      ],
    },
  },
  {
    files: ["src/shared/money/**/*.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.type='Identifier'][callee.name='Number']",
          message: "Number() для сум заборонено: лише цілочисельний розбір і toKopecks.",
        },
        {
          selector: "NewExpression[callee.type='Identifier'][callee.name='Number']",
          message: "Number() для сум заборонено: лише цілочисельний розбір і toKopecks.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Згенерований Prisma Client
    "src/generated/**",
  ]),
]);

export default eslintConfig;
