// Єдиний Prisma Client застосунку (TECHNICAL_PLAN §6). Лише для серверного коду:
// репозиторії модулів імпортують `db` звідси, а не створюють власних клієнтів.
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type Prisma } from "@/generated/prisma/client";

/** Клієнт транзакції: сервіси приймають необов'язковий `tx` для багатокрокових операцій (§3.3, §9.4). */
export type Tx = Prisma.TransactionClient;

/** `db` або `tx` — те, з чим працюють репозиторії. */
export type DbClient = PrismaClient | Tx;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL не задано. Див. .env.example і README.");
  }
  // enableChannelBinding: node-postgres ігнорує `channel_binding=require` у рядку підключення.
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString, enableChannelBinding: true }),
  });
}

// У dev-режимі Next перезавантажує модулі (HMR); кешуємо клієнт на globalThis,
// щоб не відкривати новий пул з'єднань після кожної зміни коду.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Prisma Client, що створюється ліниво — під час першого звернення, а не під час імпорту.
 * Тож імпорт модуля (unit-тести, `next build`) не потребує DATABASE_URL; помилка про
 * відсутній DATABASE_URL виникає лише під час реального запиту до БД.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value: unknown = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
