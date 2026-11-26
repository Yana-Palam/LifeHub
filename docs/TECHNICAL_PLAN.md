# LifeHub — Technical Plan

Статус: Documentation First, версія 1.0 від 2026-11-23.
Продуктові вимоги й бізнес-правила (BR-…) — у [PRODUCT.md](PRODUCT.md). Межі MVP — у [MVP_SCOPE.md](MVP_SCOPE.md).

Цей документ — технічний план, а не код. Повна Prisma-схема й реалізація створюються під час розробки за [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md).

---

## 1. Technology Stack

| Сфера | Технологія | Примітка |
|---|---|---|
| Framework | Next.js (App Router) + React | Актуальна стабільна версія на момент Project Setup |
| Мова | TypeScript, `strict: true` | Без `any` у доменній логіці |
| Стилі | Tailwind CSS | |
| UI-компоненти | shadcn/ui (Radix) | Компоненти копіюються в `src/shared/ui` |
| Backend | Server Actions (мутації) + Route Handlers (експорт CSV, завантаження файлів, AI-стрімінг) | Окремого бекенду немає |
| БД | PostgreSQL | Розробка й тести — гілки Neon `dev`/`test` (ADR 0002) |
| ORM | Prisma 7 | Міграції через `prisma migrate`; конфігурація CLI — `prisma.config.ts`; підключення через `@prisma/adapter-pg` |
| Валідація | Zod | Спільні схеми для клієнта й сервера |
| Форми | React Hook Form + `@hookform/resolvers/zod` | |
| Графіки | Recharts | Тільки клієнтські компоненти |
| Дати | date-fns + підтримка часових поясів (`@date-fns/tz`) | Пояс `Europe/Kyiv` |
| Decimal | `Prisma.Decimal` (decimal.js) | Тільки для кількостей інгредієнтів, не для грошей |
| Drag & drop меню | dnd-kit | Лише desktop; на телефоні — дія «Перенести» |
| Тести | Vitest (unit, integration), Playwright (e2e) | |
| Автентифікація | Auth.js (Credentials, один користувач) | Див. §8, відкрите рішення TD-1 |
| PWA | Web App Manifest + Service Worker (Serwist або власний SW) | P1, тиждень 16 |
| AI | Claude API (офіційний TypeScript SDK `@anthropic-ai/sdk`) | Опційно, P1 |
| Якість коду | ESLint, Prettier, `tsc --noEmit` | |

Явно **не** використовуємо: окремий NestJS/Express-бекенд, мікросервіси, Redis, черги, GraphQL, state-менеджери на кшталт Redux (достатньо серверних компонентів і локального стану), агентні фреймворки.

## 2. Architecture Overview

LifeHub — **modular monolith**: один Next.js-застосунок, одна БД, код поділений на функціональні модулі з чіткими межами.

```
Браузер (React, RSC + клієнтські компоненти)
        │  Server Actions / Route Handlers
        ▼
┌──────────────────────── Next.js server ────────────────────────┐
│  app/ (маршрути, сторінки)  →  modules/<module>/actions         │
│                                   │                             │
│                                   ▼                             │
│                     modules/<module>/services  (use cases)      │
│                         │                   │                   │
│                         ▼                   ▼                   │
│            modules/<module>/domain   modules/<module>/repository │
│            (чиста логіка, тести)     (Prisma, лише свій модуль)  │
└────────────────────────────────────────┬───────────────────────┘
                                          ▼
                                     PostgreSQL
```

Шари всередині модуля:

| Шар | Відповідальність | Залежить від |
|---|---|---|
| `components/` | UI модуля (RSC і клієнтські) | `actions`, `schemas`, `shared/ui` |
| `actions/` | Server Actions: перевірка сесії, парсинг Zod, виклик сервісу, мапінг помилок у `ActionResult` | `services`, `schemas` |
| `schemas/` | Zod-схеми вводу | `shared` |
| `services/` | Use cases, транзакції БД, координація модулів | `domain`, `repository`, публічні API інших модулів |
| `domain/` | Чисті функції й типи: розрахунки, правила, без I/O | `shared/money`, `shared/units` |
| `repository/` | Доступ до даних через Prisma для таблиць свого модуля | `shared/db` |
| `index.ts` | Публічний API модуля для інших модулів | — |

## 3. Modular Monolith Structure

### 3.1. Запропонована структура папок

```
LifeHub/
├─ AGENTS.md                    # правила для AI-агентів (джерело правди)
├─ CLAUDE.md                    # лише підключає AGENTS.md
├─ docs/                         # документація (цей набір) + docs/decisions/
├─ prisma.config.ts             # конфігурація Prisma CLI (схема, міграції, DATABASE_URL)
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts                    # категорії, одиниці, користувач
├─ public/                       # іконки, manifest (PWA)
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/
│  │  ├─ (app)/                  # захищена частина, спільний layout з навігацією
│  │  │  ├─ page.tsx             # Dashboard
│  │  │  ├─ finance/  (transactions, accounts, categories, budgets, analytics, recurring)
│  │  │  ├─ goals/
│  │  │  ├─ shopping/ (lists, planned, purchases)
│  │  │  ├─ food/     (recipes, menu)
│  │  │  ├─ pantry/
│  │  │  ├─ travel/
│  │  │  └─ assistant/
│  │  └─ api/                    # route handlers: export, uploads, ai, auth
│  ├─ generated/prisma/          # згенерований Prisma Client (не комітиться)
│  ├─ modules/
│  │  ├─ finance/   { domain, repository, services, actions, schemas, components, index.ts }
│  │  ├─ goals/
│  │  ├─ shopping/
│  │  ├─ catalog/                # довідник продуктів і категорій продуктів
│  │  ├─ food/                   # рецепти, меню, розрахунок інгредієнтів
│  │  ├─ pantry/
│  │  ├─ travel/
│  │  ├─ dashboard/              # лише читання з інших модулів
│  │  └─ ai/
│  ├─ shared/
│  │  ├─ money/                  # парсинг, форматування, арифметика в копійках
│  │  ├─ units/                  # одиниці, розмірності, конвертація
│  │  ├─ dates/                  # Europe/Kyiv, межі місяців і тижнів
│  │  ├─ db/                     # Prisma client (`db`), типи `Tx`/`DbClient` для транзакцій
│  │  ├─ auth/                   # отримання сесії, guard для actions
│  │  ├─ result/                 # ActionResult, типи помилок
│  │  ├─ lib/                    # дрібні утиліти без бізнес-логіки (cn для класів Tailwind)
│  │  └─ ui/                     # shadcn/ui і спільні компоненти (MoneyInput, DatePicker…)
│  └─ middleware.ts              # редірект на /login без сесії
├─ tests/
│  ├─ integration/               # сервіси з тестовою БД
│  └─ e2e/                       # Playwright
└─ .env.example                  # шаблон змінних середовища (DATABASE_URL, TEST_DATABASE_URL…)
```

Unit-тести лежать поруч із кодом (`*.test.ts`).

### 3.2. Відповідальність модулів

| Модуль | Відповідає за | Не робить |
|---|---|---|
| `finance` | Рахунки, категорії, Transactions (єдиний реєстр), бюджети, аналітика, регулярні платежі, CSV | Не знає про списки покупок, рецепти чи подорожі, окрім необов'язкових ID-посилань |
| `goals` | Цілі, поповнення/зняття, прогрес, прогноз | Не створює транзакцій |
| `catalog` | Продукти, категорії продуктів, остання відома ціна | — |
| `shopping` | Списки, позиції, покупки (Purchase), великі покупки | Не рахує фінанси; транзакцію створює через `finance` |
| `food` | Рецепти, інгредієнти, заплановані страви, розрахунок потреби в інгредієнтах | Не пише в таблиці `shopping` напряму, а викликає `shopping` |
| `pantry` | Запаси, коригування, терміни | Не створює транзакцій |
| `travel` | Подорожі, бюджет подорожі, дні, документи, речі | Не зберігає власних витрат: факт — запит до `finance` за `tripId` |
| `dashboard` | Збирання віджетів | Нічого не записує |
| `ai` | Збирання контексту, виклик Claude API, валідація пропозицій | Не пише в БД напряму; застосування — через сервіси модулів після підтвердження |

### 3.3. Правила взаємодії модулів

1. Модуль імпортує інший модуль **лише через його `index.ts`** (публічні сервіси й типи). Імпорт чужого `repository/` або `domain/` заборонено — перевіряється ESLint-правилом (`no-restricted-imports` / `eslint-plugin-boundaries`).
2. Кожен модуль пише лише у свої таблиці. Міжмодульний запис — через публічний сервіс власника таблиці.
3. Операції, що зачіпають кілька модулів, виконуються в одній транзакції БД: сервіси приймають необов'язковий параметр `tx` (Prisma transaction client).
4. Залежності між модулями односпрямовані, без циклів:

```
shared ◄── finance ◄── goals
            ▲   ▲
            │   └──── travel
            │
catalog ◄── shopping ◄── food
   ▲           ▲         │
   └──── pantry ◄────────┘
dashboard, ai ──► (читають публічні сервіси всіх модулів)
```

Приклади:
- `shopping.checkout()` → `finance.createExpense({ ..., purchaseId }, tx)` + (P1) `pantry.addItems(..., tx)`.
- `food.buildShoppingNeeds()` → (P1) `pantry.getAvailable()` → `shopping.addItemsFromMealPlan(..., tx)`.
- `travel.getTripActuals(tripId)` → `finance.sumExpensesByTrip(tripId)`.

## 4. Frontend Architecture

- **Server Components за замовчуванням** для читання даних (списки, Dashboard, звіти). Дані беруться з сервісів модулів напряму на сервері.
- **Рендеринг (TD-9, [ADR 0001](decisions/0001-disable-cache-components.md)):** `cacheComponents` і `partialPrefetching` вимкнені. Сторінки, що читають сесію або БД, рендеряться динамічно на кожен запит; `"use cache"` не використовуємо. `<Suspense>`/`loading.tsx` — для UX, не обов'язкові. Сторінка, що читає БД без сесії, викликає `await connection()`, щоб не пререндеритися під час збірки.
- **Client Components** лише там, де потрібна інтерактивність: форми, графіки, drag & drop, перемикачі.
- **Форми:** React Hook Form + Zod-схема модуля; той самий `schema` перевіряється на сервері в action. Поле суми — спільний компонент `MoneyInput` (рядок → копійки).
- **Мутації:** Server Actions; після успіху — `revalidatePath` потрібних сторінок (класична модель, ADR 0001; `revalidateTag(tag, "max")` — лише якщо з'явиться кеш із тегами, §15); повідомлення через toast.
- **Оптимістичні оновлення** — лише для дешевих дій (позначити позицію купленою), з відкатом при помилці.
- **Навігація:** desktop — бічна панель; mobile (< 768 px) — нижня панель із 5 пунктами (Головна, Фінанси, Покупки, Їжа, Ще) і плаваюча кнопка «+ Операція».
- **Локалізація:** тексти українською прямо в компонентах (одна мова, i18n-бібліотека не потрібна); форматування через `Intl` з `uk-UA`.
- **Доступність:** компоненти Radix, мітки полів, фокус, контраст.

## 5. Backend Architecture

- **Server Actions** для всіх мутацій зі сторінок. Кожна action: (1) перевіряє сесію, (2) парсить ввід Zod, (3) викликає сервіс, (4) повертає `ActionResult<T>`:
  `{ ok: true, data } | { ok: false, error: { code, message, fieldErrors? } }`.
- **Route Handlers** для: експорту CSV (стрім файлу), завантаження фото/документів, AI (стрімінг відповіді), Auth.js.
- **Сервіси** містять use cases і відкривають транзакції БД (`db.$transaction`, клієнт транзакції — тип `Tx` із `shared/db`) для багатокрокових операцій.
- **Доменні помилки** — типізовані (`ValidationError`, `NotFoundError`, `ConflictError`, `BusinessRuleError` з кодом правила, наприклад `BR-14`). Action перетворює їх на зрозумілі повідомлення українською.
- **Ідемпотентність створення:** форми надсилають `clientRequestId` (UUID, генерується при відкритті форми). Для Transaction, Purchase, передачі меню в список він зберігається з унікальним індексом; повтор повертає вже створений запис.

## 6. Data Layer

- Prisma Client — один екземпляр `db` (`shared/db`), без глобальних побічних ефектів у тестах. Генератор `prisma-client` (Prisma 7) пише клієнт у `src/generated/prisma`; підключення — driver adapter `@prisma/adapter-pg` з `DATABASE_URL`. Клієнт створюється ліниво (під час першого запиту, не під час імпорту — тож unit-тести й `build` не потребують `DATABASE_URL`) і кешується на `globalThis`, щоб HMR не відкривав нові пули з'єднань.
- Репозиторії модулів — тонкі функції над Prisma з явними `select`, щоб не тягнути зайві поля.
- **Агрегації в БД:** суми, групування за категоріями й місяцями виконуються в SQL (`groupBy`, `aggregate` або `$queryRaw` з параметрами), а не в JavaScript по всіх рядках.
- **Похідні показники не зберігаються** (баланси, факти бюджетів, прогрес цілей, факт подорожі): вони обчислюються із джерельних даних. Кешування — лише за доведеної потреби (див. §15).
- **Гроші:** колонки `Int` у копійках (PostgreSQL `integer`). Межа значення однієї суми — 10 000 000 ₴ (1 000 000 000 коп.) на рівні валідації; агрегати SQL повертають `bigint`, сервіс перетворює їх у `number` (безпечно до 2^53).
- **Кількості інгредієнтів і запасів:** `Decimal(12,3)` + одиниця. Арифметика — через `Prisma.Decimal`.
- **Дати подій** (транзакція, страва, поповнення): тип `DATE` (`@db.Date`), у коді — рядок `YYYY-MM-DD` в поясі `Europe/Kyiv`. Технічні мітки (`createdAt`, `updatedAt`) — `timestamptz`.

## 7. Database Strategy

### 7.1. Концептуальна модель

Назви — робочі; остаточна схема створюється в Prisma під час розробки.

| Сутність | Ключові поля | Модуль |
|---|---|---|
| User | email, passwordHash | auth |
| Account | name, kind (`cash`/`bank`/`savings`), openingBalance (коп.), openingDate, archivedAt | finance |
| Category | name, kind (`income`/`expense`), parentId?, archivedAt | finance |
| **Transaction** | type (`income`/`expense`/`transfer`), amount (коп., > 0), date, accountId, toAccountId? (лише transfer), categoryId? (не для transfer), description, tripId?, purchaseId? (unique), recurringPaymentId?, occurrenceDate?, clientRequestId (unique) | finance |
| MonthlyBudget | month (`YYYY-MM`, unique) | finance |
| BudgetLine | budgetId, categoryId, planned (коп.); unique(budgetId, categoryId) | finance |
| RecurringPayment (P1) | name, type, amount, accountId, categoryId, frequency, interval, startDate, endDate?, archivedAt | finance |
| SavingsGoal | name, target (коп.), targetDate?, accountId? (P1), status, archivedAt | goals |
| GoalContribution | goalId, kind (`deposit`/`withdrawal`), amount (коп., > 0), date, note | goals |
| ProductCategory | name (Овочі, Молочне…) | catalog |
| Product | name (unique, нормалізована), productCategoryId, defaultDimension (`mass`/`volume`/`count`), lastPrice? (коп. за базову одиницю) | catalog |
| ShoppingList | name, archivedAt | shopping |
| ShoppingListItem | listId, productId?, name, productCategoryId? (категорія позиції), quantity?, unit?, isBought, boughtAt?, estimatedPrice?, purchaseId?, source (`manual`/`meal_plan`), position | shopping |
| Purchase | date, total (коп.), listId?, note, clientRequestId (unique) | shopping |
| PlannedPurchase | name, estimatedCost (коп.), targetDate?, priority, status (`planned`/`bought`/`cancelled`), goalId?, purchaseId? | shopping |
| Recipe | name, description, photoKey?, prepTimeMinutes?, servings (> 0), instructions, archivedAt | food |
| RecipeCategory + RecipeToCategory | M:N | food |
| RecipeIngredient | recipeId, productId, quantity? (null для «за смаком»), unit, note, position | food |
| MealPlanEntry | date, mealType (`breakfast`/`lunch`/`dinner`/`snack`), recipeId, servings (≥ 1), position, note | food |
| PantryItem (P1) | productId, quantity (≥ 0), unit, purchasedAt, expiresAt?, note | pantry |
| Trip (P1) | name, destination, startDate, endDate, status, notes | travel |
| TripBudgetLine (P1) | tripId, categoryId (категорія витрат finance), planned (коп.) | travel |
| TripDay (P1) | tripId, date, plan, places | travel |
| TripDocument (P1) | tripId, kind (`booking`/`document`/`link`), title, reference, url?, fileKey?, date? | travel |
| TripPackingItem (P1) | tripId, name, isPacked, position | travel |

**Уточнення концептуальних зв'язків із завдання:**
- `MealPlan → MealSlots → Recipes`: окрема таблиця «меню» не потрібна. Слот = пара (дата, прийом їжі), а «меню тижня» — діапазон дат. Таблиця `MealPlanEntry` зберігає страву в слоті. Це простіше, ніж MealPlan + MealSlot, і повністю покриває вимоги; якщо знадобляться назви/шаблони меню — додамо `MealPlanTemplate` (P2).
- `Pantry → Products`: Pantry — це набір `PantryItem`, кожен посилається на `Product`.
- `Transaction → Purchase`: покупка має щонайбільше одну транзакцію (`Transaction.purchaseId` unique); покупка може не мати транзакції («відмітити без транзакції»).
- `Trip → Actual Transactions`: факт подорожі — це запит до Transactions за `tripId`, а не окрема таблиця.

### 7.2. Зв'язки

```
Account 1─* Transaction *─1 Category (self 1─* підкатегорії)
Account 1─* Transaction (toAccount, лише transfer)
Transaction *─0..1 Trip ; Transaction 0..1─0..1 Purchase ; Transaction *─0..1 RecurringPayment
MonthlyBudget 1─* BudgetLine *─1 Category
SavingsGoal 1─* GoalContribution ; SavingsGoal *─0..1 Account
ShoppingList 1─* ShoppingListItem *─0..1 Product ; ShoppingListItem *─0..1 Purchase
PlannedPurchase *─0..1 SavingsGoal ; PlannedPurchase 0..1─0..1 Purchase
Recipe 1─* RecipeIngredient *─1 Product ; Recipe *─* RecipeCategory
Recipe 1─* MealPlanEntry
Product 1─* PantryItem ; Product *─1 ProductCategory
Trip 1─* TripBudgetLine *─1 Category ; Trip 1─* TripDay ; Trip 1─* TripDocument ; Trip 1─* TripPackingItem
```

### 7.3. Цілісність на рівні БД

Prisma не описує CHECK-обмеження, тому вони додаються сирим SQL у міграціях:
- `Transaction.amount > 0`; `GoalContribution.amount > 0`; `BudgetLine.planned >= 0`.
- `type = 'transfer'` ⇒ `toAccountId IS NOT NULL AND categoryId IS NULL AND toAccountId <> accountId`.
- `type IN ('income','expense')` ⇒ `categoryId IS NOT NULL AND toAccountId IS NULL`.
- `Recipe.servings > 0`; `MealPlanEntry.servings >= 1`; `PantryItem.quantity >= 0`.

Політики видалення:
- `Account`, `Category`, `Product` з посиланнями — `RESTRICT` (лише архівування, BR-15).
- `Trip` → `Transaction.tripId` — `SET NULL` (після підтвердження в UI).
- `Transaction.purchaseId` → `Purchase` — `RESTRICT`: видалення транзакції не зачіпає покупку (вона лишається «без транзакції»), а покупку з транзакцією видалити не можна, доки транзакцію не видалено.
- `Recipe` з `MealPlanEntry` — `RESTRICT` (лише архівування); `RecipeIngredient` — `CASCADE` з рецептом.
- `ShoppingList` → `ShoppingListItem` — `CASCADE`; `SavingsGoal` → `GoalContribution` — `CASCADE` після підтвердження.

Індекси: `Transaction(date)`, `Transaction(accountId, date)`, `Transaction(toAccountId, date)`, `Transaction(categoryId, date)`, `Transaction(tripId)`, `MealPlanEntry(date)`, `ShoppingListItem(listId)`, `PantryItem(productId)`, `GoalContribution(goalId)`.

### 7.4. Міграції та сид

- Кожна зміна схеми — окрема міграція з осмисленою назвою; міграції не редагуються після застосування.
- `seed.ts` (ідемпотентний): користувач (пароль з env), стартові категорії доходів і витрат українською, категорії продуктів, категорії рецептів.
- Тестова БД — окрема гілка Neon `test` (`TEST_DATABASE_URL`, ADR 0002), очищається перед кожним integration-тестовим файлом. Налаштування Vitest (день 4) підставляє `process.env.DATABASE_URL = process.env.TEST_DATABASE_URL` до першого звернення до `db` і застосовує міграції до гілки `test` (`migrate deploy` з тим самим підставленим URL).
- Команди: `db:migrate` (`migrate dev` — нова міграція), `db:deploy` (`migrate deploy`), `db:reset` (`migrate reset` — лише dev/test), `db:status`, `db:generate`, `db:studio`. Prisma 7 не генерує клієнт автоматично — це робить `postinstall`/`db:generate`.

## 8. Authentication and Data Security

- **Один користувач.** Auth.js з Credentials-провайдером; хеш пароля (argon2id або bcrypt) у таблиці `User`; початковий користувач — з сиду за змінними середовища. Реєстрації немає.
- **Сесія:** httpOnly, Secure, SameSite=Lax cookie.
- **Захист:** `middleware.ts` перенаправляє на `/login`; **кожна Server Action і Route Handler додатково перевіряє сесію** (middleware не єдиний бар'єр).
- **Обмеження спроб входу:** затримка/блокування після 5 невдалих спроб за 15 хв (лічильник у БД).
- **Секрети** (`DATABASE_URL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`, ключі сховища) — тільки в змінних середовища на сервері; `.env*` у `.gitignore`; `.env.example` без значень.
- **Ввід:** усе через Zod; SQL — лише через Prisma або параметризований `$queryRaw`.
- **Файли:** перевірка MIME і розміру (фото ≤ 5 МБ, документи ≤ 10 МБ); випадкові ключі файлів; доступ до файлів подорожей — лише після автентифікації.
- **HTTPS** у продакшні; заголовки безпеки (CSP, `X-Content-Type-Options`, `Referrer-Policy`).
- **Приватність AI:** у Claude API передаються лише дані, потрібні для вибраного сценарію, і лише після підтвердження користувача (див. §14).

## 9. Financial Data Handling

### 9.1. Гроші
- Тип у коді — `Kopecks` (branded `number`, ціле). Модуль `shared/money`:
  - `parseUah("1 234,56") → 123456` — розбір рядка без `parseFloat`: ціла й дробова частини окремо, максимум 2 знаки.
  - `formatUah(123456) → "1 234,56 ₴"` через `Intl.NumberFormat('uk-UA')`.
  - `add`, `subtract`, `sum`, `percentOf` (для прогресу; результат відсотка може бути дробовим, але це не гроші), `allocate`/округлення — лише цілочисельні операції.
- Заборонено: `parseFloat`/`Number()` для сум, множення гривень на 100 у float, зберігання сум як `Float`/`Decimal` у грошових колонках.

### 9.2. Реєстр транзакцій
- Єдина таблиця `Transaction` для всіх модулів (BR-1). Інші модулі посилаються на неї через необов'язкові FK (`tripId`, `purchaseId`, `recurringPaymentId`).
- Функції `finance` для інших модулів: `createExpense`, `sumExpensesByTrip`, `getMonthSummary`, `getSpendingByCategory` — усі приймають `tx?`.

### 9.3. Розрахунки (у `finance/domain` + SQL-агрегації)
- **Баланс рахунку:** `openingBalance + Σincome − Σexpense + Σtransfer_in − Σtransfer_out` до дати (PRODUCT.md §10.2).
- **Доходи / витрати періоду:** лише `income` / `expense`; `transfer` виключено (BR-2).
- **Факт бюджету категорії:** Σ`expense` категорії та її підкатегорій за місяць у поясі `Europe/Kyiv`.
- **Залишок бюджету:** план − факт (може бути від'ємним).
- **Ціль:** Σ deposit − Σ withdrawal; прогрес і прогноз — у `goals/domain`.
- **Факт подорожі:** Σ`expense` з `tripId`.
- Кожна формула має unit-тести з крайовими випадками (порожні дані, перекази, підкатегорії, межі місяця о 00:00 за Києвом, архівні категорії).

### 9.4. Багатокрокові операції (одна транзакція БД)
- Оформлення покупки: Purchase + Transaction + оновлення позицій (+ PantryItem у P1).
- Передача інгредієнтів у список покупок: створення/оновлення кількох позицій.
- Збереження рецепта з інгредієнтами.
- Підтвердження регулярного платежу: Transaction з unique(`recurringPaymentId`, `occurrenceDate`).
- Збереження бюджету з рядками; копіювання бюджету.
- Застосування AI-пропозиції меню.

## 10. Validation and Error Handling

- **Zod-схеми** в `modules/<m>/schemas` — одне джерело правил для форми й сервера. Повідомлення українською.
- Рівні валідації: (1) форма (миттєвий відгук), (2) action (Zod — довіряємо лише цьому), (3) сервіс/домен (бізнес-правила BR-…), (4) БД (CHECK, FK, unique) — остання лінія захисту.
- Типові помилки та реакція:

| Ситуація | Реакція |
|---|---|
| Некоректна сума (0, від'ємна, > 2 знаків, > ліміту) | Помилка поля |
| Відсутня/архівна категорія або рахунок | Помилка поля «Оберіть категорію» |
| Некоректна дата (неіснуюча, порожня; для подорожі кінець < початок) | Помилка поля |
| Дубль надсилання (той самий `clientRequestId`) | Повертається існуючий запис, без помилки |
| Видалення пов'язаної сутності | `ConflictError` з поясненням і пропозицією архівувати |
| Збій посеред багатокрокової операції | Відкат транзакції БД, повідомлення «Не вдалося зберегти, дані не змінено» |
| Несумісні одиниці під час об'єднання | Окремі рядки з позначкою, без помилки |
| Рецепт змінено/архівовано, але він у меню | Страва лишається, показується позначка; розрахунок бере актуальні інгредієнти |
| Неочікувана помилка | Error boundary сторінки, лог на сервері, загальне повідомлення без технічних деталей |

- Логування: структуровані логи на сервері (`console` + рівні на старті; зовнішній сервіс — відкрите рішення TD-6). Суми та описи транзакцій не логуються повністю.

## 11. Testing Strategy

| Рівень | Інструмент | Що покриваємо | Мета |
|---|---|---|---|
| Unit | Vitest | `shared/money`, `shared/units`, `shared/dates`, усі `domain/` (баланси, бюджети, цілі, розрахунок і об'єднання інгредієнтів, нестача з урахуванням Pantry, розклад регулярних платежів) | ≥ 90 % рядків доменного коду |
| Integration | Vitest + тестова PostgreSQL | Сервіси з БД: атомарність покупки, ідемпотентність, CHECK-обмеження, видалення пов'язаних сутностей, BR-2…BR-11 | Кожне BR має хоча б один тест |
| E2E | Playwright | Ключові сценарії з USER_FLOWS: вхід, дохід/витрата/переказ → баланс, бюджет, ціль, список покупок → транзакція, рецепт → меню → список → покупка, подорож (P1), Pantry (P1) | Desktop + мобільний viewport (375 px) |
| Статичні | ESLint, `tsc`, межі модулів | Імпорти між модулями, заборона `parseFloat` у грошових модулях | 0 помилок |

Правила:
- Нова бізнес-логіка без unit-тесту не вважається готовою.
- Баг у розрахунках спочатку відтворюється тестом, потім виправляється.
- Команди (визначаються в Project Setup): `lint`, `typecheck`, `test`, `test:e2e`.

## 12. Deployment Strategy

- **Середовища:** local (застосунок локально + гілка Neon `dev`; тести — гілка `test`, ADR 0002), production (гілка Neon `production`). Staging — за потреби (відкрите рішення).
- **Рекомендація за замовчуванням (TD-2):** Vercel (застосунок) + керований PostgreSQL (Neon, регіон EU). Альтернатива — Docker-образ на VPS з Postgres.
- **Міграції** в продакшні — `prisma migrate deploy` перед стартом нової версії.
- **Конфігурація** — лише змінні середовища; `.env.example` описує всі змінні.
- **CI** (коли з'явиться віддалений репозиторій): lint → typecheck → unit/integration → e2e на кожен push у головну гілку й PR.
- Реліз 1.0 — тиждень 16.

## 13. PWA Strategy (P1, тиждень 16)

- `manifest.webmanifest`: назва «LifeHub», українська, `display: standalone`, іконки 192/512 і maskable, кольори теми.
- Service Worker (Serwist або власний, рішення TD-4):
  - precache статичних ресурсів і оболонки застосунку;
  - network-first для сторінок із даними, з fallback-сторінкою «Немає з'єднання»;
  - без офлайн-мутацій і фонової синхронізації в 1.0.
- Встановлення на телефон (Android/iOS «На початковий екран»), перевірка Lighthouse PWA.
- Сесія та дані користувача не кешуються в SW надовго; після виходу кеш сторінок очищується.

## 14. AI Integration Strategy (P1, тиждень 16)

- **Опційність:** якщо `ANTHROPIC_API_KEY` не задано, розділ AI показує, що функція вимкнена; решта застосунку працює.
- **Лише за запитом:** немає фонових чи автоматичних викликів.
- **Серверний виклик:** Route Handler `api/ai/*` з перевіркою сесії; клієнт ніколи не бачить ключ. Модель задається змінною `AI_MODEL` (за замовчуванням — актуальна модель Claude Sonnet, наприклад `claude-sonnet-5-5`).
- **Контекст із системи, а не з пам'яті моделі:** сервер готує дані через публічні сервіси модулів (агрегати витрат за категоріями й місяцями, бюджети, цілі, список рецептів). Можливий варіант — tool use з набором **лише читаючих** інструментів (`get_month_summary`, `get_spending_by_category`, `list_recipes`…). Системна інструкція забороняє вигадувати цифри.
- **Мінімізація даних:** передаються агрегати й потрібні поля; без паролів, файлів і зайвих описів. Перед запитом користувач бачить, які дані підуть.
- **Пропозиції, що змінюють дані** (меню): модель повертає структурований JSON → Zod-валідація → перевірка, що рецепти існують → попередній перегляд → застосування лише після «Застосувати» через сервіси `food`.
- **Обмеження:** таймаут, ліміт запитів на день, ліміт токенів відповіді; зрозумілі повідомлення про помилки.
- Журнал AI-запитів (сценарій, час, токени, статус) — без вмісту даних.

## 15. Performance Considerations

- Агрегації в SQL з індексами (§7.3); жодних обчислень по всій таблиці транзакцій у JS.
- Пагінація історії транзакцій курсором (дата + id), 50 записів на сторінку.
- Dashboard: віджети — окремі серверні компоненти з `Suspense`, паралельні запити.
- Уникати N+1: `include`/`select` у репозиторіях.
- Графіки й drag & drop — динамічний імпорт клієнтських компонентів.
- Фото рецептів — стиснення під час завантаження (максимум 1600 px), `next/image`.
- Кешування похідних показників не плануємо; якщо Dashboard стане повільнішим за 1 с на 20 000 транзакцій — спершу індекси й запити, потім кеш із тегами `revalidateTag`.

## 16. Backup and Data Export

- **Бекап БД:** щоденний автоматичний (засоби керованого Postgres або `pg_dump` за розкладом), зберігання ≥ 14 днів; щомісячна перевірка відновлення.
- **Експорт CSV (P1):** транзакції за період — UTF-8 з BOM, роздільник `;`, дати `ДД.ММ.РРРР`, суми `1234,56` (сумісно з Excel в українській локалі).
- **Повний експорт даних** (JSON усіх таблиць користувача) — тиждень 15, як захист від «замкнення» в продукті.
- **Файли** (фото, документи) — бекап зберігається разом зі сховищем (версії/копії на рівні провайдера).

## 17. Technical Risks

| Ризик | Наслідок | Запобігання |
|---|---|---|
| Помилки float у грошах | Неправильні баланси | `shared/money`, заборона `parseFloat` лінтером, тести |
| Межі місяця/тижня й часові пояси | Операція потрапляє не в той місяць | Тип DATE, `shared/dates` з `Europe/Kyiv`, тести опівночі |
| Подвійний облік (покупка, подорож, Pantry, цілі) | Завищені витрати | Єдиний реєстр, unique FK, integration-тести BR-2…BR-11 |
| Розмивання меж модулів | Складність змін | Публічні `index.ts`, ESLint-правила, рев'ю на тижневих перевірках |
| Складність одиниць вимірювання | Неправильні списки покупок | Обмежений набір одиниць, конвертація лише в межах розмірності, тести |
| Прив'язаність до Vercel/Neon | Міграція хостингу | Стандартні Postgres і Next.js, без вендорних API в домені |
| Розростання обсягу | Зрив 16 тижнів | Чіткі P0/P1/P2, нове — лише через оновлення MVP_SCOPE |
| AI вигадує цифри, вартість запитів | Хибні висновки, витрати | Дані з системи, ліміти, лише за запитом |
| Подвійне надсилання форм на повільній мережі | Дублі транзакцій | `clientRequestId` + unique-індекс |
| Server Actions як публічні ендпоінти | Несанкціонований доступ | Перевірка сесії в кожній action |

## 18. Open Technical Decisions

| # | Рішення | За замовчуванням | Коли вирішити |
|---|---|---|---|
| TD-1 | Спосіб входу: Auth.js Credentials, passkey чи magic link | Auth.js Credentials + argon2id | Тиждень 1, день 5 |
| TD-2 | Хостинг: Vercel + Neon чи VPS + Docker | Vercel + Neon (EU) | До тижня 15 |
| TD-3 | Сховище файлів (фото рецептів, документи подорожей) | Vercel Blob або S3-сумісне; локально — диск | Тиждень 9, день 62 |
| TD-4 | Service Worker: Serwist чи власний | Serwist | Тиждень 16 |
| TD-5 | Межі модулів: `eslint-plugin-boundaries` чи `no-restricted-imports` | `no-restricted-imports` (простіше) | Тиждень 4 |
| TD-6 | Моніторинг помилок у продакшні (Sentry тощо) | Без зовнішнього сервісу, лише логи хостингу | Тиждень 16 |
| TD-7 | Формат зберігання інструкції рецепта (простий текст чи список кроків) | Масив кроків (текст) | Тиждень 9 |
| TD-9 | Next.js 16 `cacheComponents` + `partialPrefetching` (увімкнені шаблоном): лишити чи вимкнути | **Вирішено:** вимкнено, класичний динамічний рендеринг — [ADR 0001](decisions/0001-disable-cache-components.md) | ✅ День 3 |
| TD-8 | Staging-середовище | Не потрібне для одного користувача; preview-деплої Vercel | Тиждень 15 |

Рішення фіксуються як ADR у `docs/decisions/NNNN-<назва>.md` (контекст, рішення, наслідки).

---

## Додаток A. Взаємодія Recipe, MealPlan, ShoppingList і Pantry

```
Recipe (servings = Sᵣ)
  └─ RecipeIngredient (product, qty, unit)
        │
MealPlanEntry (date, mealType, recipe, servings = Sₚ)
        │  1. scale: qty × Sₚ / Sᵣ
        ▼
IngredientNeed (product, qty, unit, sources[])
        │  2. normalize → base unit (g / ml / pcs)
        │  3. merge by (product, dimension), sum
        ▼
AggregatedNeed (product, dimension, totalBase)
        │  4. (P1) − Pantry available (same product & dimension, not expired)
        │  5. − «вже є вдома» (manual) ; shortage = max(0, need − available)
        ▼
Preview (редагується користувачем)
        │  6. confirm → shopping.addItemsFromMealPlan(listId, items, tx)
        ▼
ShoppingListItem (source = meal_plan)  ──(покупка)──►  Purchase + Transaction (+ PantryItem, P1)
```

- Кроки 1–5 — чисті функції в `food/domain` (+ `shared/units`), повністю покриті unit-тестами. I/O лише на вході (завантаження записів) і на кроці 6.
- Попередній перегляд нічого не пише в БД.
- Позиції списку — знімок: подальші зміни рецепта чи меню їх не змінюють.
- При додаванні в список: якщо є непридбана позиція з тим самим `productId` і сумісною розмірністю — кількість збільшується (після конвертації в одиницю наявної позиції), інакше — новий рядок.
- Оформлення покупки створює одну транзакцію (BR-6); додавання в Pantry не створює транзакцій (BR-11).

## Додаток B. Логіка об'єднання інгредієнтів

1. **Одиниці** описані в `shared/units` таблицею: `unit → { dimension, toBase }`:
   `g→(mass,1)`, `kg→(mass,1000)`, `ml→(volume,1)`, `l→(volume,1000)`, `tsp→(volume,5)`, `tbsp→(volume,15)`, `cup→(volume,250)`, `pcs→(count,1)`, `to_taste→(none,—)`.
2. **Нормалізація:** `base = qty × toBase` (Decimal).
3. **Ключ об'єднання:** `(productId, dimension)`. Різні розмірності одного продукту — різні рядки.
4. **Сума:** Σ base у межах ключа; `none` — не сумується, а збирає список джерел («за смаком: борщ, салат»).
5. **Показ:** для `mass` ≥ 1000 г → кг; для `volume` ≥ 1000 мл → л; інакше базова одиниця; округлення до 2 знаків для показу, обчислення — без округлення. Для `count` — округлення вгору до цілого для списку покупок (не можна купити 2,5 яйця), з позначкою.
6. **Нестача (P1):** `shortage = max(0, totalBase − pantryBase)`, де `pantryBase` — Σ неспливлих записів Pantry того самого продукту й розмірності.
7. **Крайові випадки:** кількість 0 або null (крім `to_taste`) — помилка валідації рецепта; невідома одиниця — помилка; продукт архівний — показується з позначкою; дуже малі кількості (< 0,01) — показуються як «< 0,01».
