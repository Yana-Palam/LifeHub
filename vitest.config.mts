import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Unit-тести лежать поруч із кодом (`*.test.ts`), TECHNICAL_PLAN §3.1, §11.
export default defineConfig({
  resolve: {
    // Той самий alias, що й `paths` у tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
