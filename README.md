# LifeHub

> Your Life. Your Money. One Place.

Персональний вебзастосунок для фінансів, бюджетів, цілей, покупок, планування меню, запасів продуктів і подорожей.

- Продукт і правила — [docs/PRODUCT.md](docs/PRODUCT.md), межі MVP — [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)
- Архітектура — [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md), дизайн — [docs/DESIGN.md](docs/DESIGN.md)
- План розробки — [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)
- Правила для AI-агентів — [AGENTS.md](AGENTS.md)

## Вимоги

- Node.js 22.12 або новіший (потрібно для Vitest 5; перевірено на Node 24)
- npm
- База даних PostgreSQL — проєкт [Neon](https://neon.tech) з гілками `dev` і `test` ([ADR 0002](docs/decisions/0002-neon-dev-database.md)); підійде й будь-який інший PostgreSQL

## Початок роботи

1. Скопіюйте `.env.example` у `.env` і заповніть:
   - `DATABASE_URL` — рядок підключення гілки Neon `dev`;
   - `TEST_DATABASE_URL` — рядок гілки `test` (для integration-тестів).

   У Neon: **Connect** → виберіть гілку → вимкніть **Connection pooling** (у хості не має бути `-pooler`) → скопіюйте рядок і замініть у ньому `sslmode=require` на `sslmode=verify-full`. Рядки підключення — секрет: лише в `.env`, ніколи в коді чи комітах.

2. Встановіть залежності (Prisma Client згенерується автоматично) і застосуйте міграції:

   ```bash
   npm ci
   npm run db:deploy
   ```

3. Запустіть сервер розробки:

   ```bash
   npm run dev
   ```

Застосунок відкривається на http://localhost:3000.

## Команди

| Команда | Що робить |
|---|---|
| `npm run dev` | Сервер розробки |
| `npm run build` | Продакшн-збірка |
| `npm run start` | Запуск продакшн-збірки |
| `npm run lint` | ESLint |
| `npm run typecheck` | Генерація типів маршрутів Next.js і перевірка TypeScript |
| `npm run format` | Форматування коду Prettier |
| `npm run format:check` | Перевірка форматування без змін |
| `npm run db:generate` | Згенерувати Prisma Client у `src/generated/prisma` (також виконується після `npm ci`) |
| `npm run db:migrate -- --name <назва>` | Створити й застосувати нову міграцію після зміни `prisma/schema.prisma` |
| `npm run db:deploy` | Застосувати наявні міграції (без створення нових) |
| `npm run db:status` | Стан міграцій у базі |
| `npm run db:reset` | **Стерти всі дані** і застосувати міграції з нуля — лише для гілок `dev`/`test` |
| `npm run db:studio` | Prisma Studio — перегляд даних у браузері |

Команди `db:*` працюють з базою з `DATABASE_URL` (гілка `dev`); `TEST_DATABASE_URL` використовують лише integration-тести (з дня 4). Схема змінюється лише новою міграцією; застосовані міграції не редагуються.

Тести (`test`, `test:e2e`) з'являться на днях 4–6 roadmap.
