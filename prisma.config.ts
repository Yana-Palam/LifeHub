// Конфігурація Prisma CLI (migrate, generate, studio).
// Prisma 7 не читає .env сам, тому завантажуємо його явно.
import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env, а не env(): `prisma generate` (postinstall, CI) має працювати без бази.
    // Команди migrate без DATABASE_URL завершаться зрозумілою помилкою Prisma.
    url: process.env.DATABASE_URL,
  },
});
