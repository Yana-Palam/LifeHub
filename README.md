# LifeHub

> Your Life. Your Money. One Place.

Персональний вебзастосунок для фінансів, бюджетів, цілей, покупок, планування меню, запасів продуктів і подорожей.

- Продукт і правила — [docs/PRODUCT.md](docs/PRODUCT.md), межі MVP — [docs/MVP_SCOPE.md](docs/MVP_SCOPE.md)
- Архітектура — [docs/TECHNICAL_PLAN.md](docs/TECHNICAL_PLAN.md), дизайн — [docs/DESIGN.md](docs/DESIGN.md)
- План розробки — [docs/DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md)
- Правила для AI-агентів — [AGENTS.md](AGENTS.md)

## Вимоги

- Node.js 20.9 або новіший (перевірено на Node 24)
- npm

## Початок роботи

```bash
npm ci
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

Тести (`test`, `test:e2e`) і база даних з'являться на днях 3–6 roadmap.
