# Sigma Inbox (FR-10) — Веб-версия: тесты и проверка контракта

Репозиторий с тестами для проверки соответствия **веб-версии** компонента `omninotice-notification-feed` контракту Apiary (CONTRACT.md и приложения А–Г) в рамках задачи **«Лента уведомлений (Inbox) в Sigma — веб и моб. версия (FR-10)»**.

> ⚠️ **Границы проверки:** проверена **только веб-версия**. Мобильная версия (React Native / WebView) в этом репозитории **не покрыта** — для неё требуется отдельное окружение (`@testing-library/react-native` + Jest) и отдельные тесты.

## 📊 Статус

- **Всего тестов:** 32
- **Пройдено:** 32 ✅
- **Провалено:** 0
- **Файлов с тестами:** 11
- **Найдено замечаний:** 6 (см. [BUG_REPORTS.md](./tests/BUG_REPORTS.md))
- **Покрытие:** веб-версия FR-10

## 🚀 Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/vagap85/sigma-inbox-fr-10-web.git
cd sigma-inbox-fr-10-web
2. Установка зависимостей
bash
npm install
3. Генерация моков
Перед запуском тестов нужно сгенерировать моки из репозитория компонента:

bash
npm run generate:mock https://github.com/OrdynsDav/omninotice-notification-feed
4. Запуск тестов
bash
npm run test
Или в watch-режиме:

bash
npm run test:watch
С покрытием:

bash
npm run test:coverage
📁 Структура
text
tests/
├── setup.ts                       # настройка Testing Library, cleanup, сброс failNext
├── mocks/
│   ├── core-hive.ts               # типы SlotComponentProps
│   └── core-hive-react.ts         # мок registerSlotComponent
├── BUG_REPORTS.md                 # баг-репорты по найденным замечаниям
├── contract.test.ts               # 10 тестов — §3, §5 (запреты, обязательные требования)
├── registration.test.ts           # 1 тест — §3.2 регистрация
├── providers.test.tsx             # 1 тест — §3.4 провайдеры данных
├── actions.test.tsx               # 1 тест — §3.6 mark-read
├── render.test.tsx                # 3 теста — A.5 loading/error/empty
├── settings.test.tsx              # 2 теста — §3.1 настройки
├── pagination.test.tsx            # 1 тест — пагинация
├── a11y.test.tsx                  # 2 теста — A.3 доступность
├── a6-cancellation.test.tsx       # 2 теста — A.6 отмена запросов
├── a7-caching.test.tsx            # 2 теста — A.7 TTL (фиксирует замечание)
└── a12-documentation.test.ts      # 7 тестов — A.12/A.15 документация
🧪 Что проверяется
Файл	Кол-во	Что проверяет
contract.test.ts	10	§3 (обязательные требования), §5 (запреты)
registration.test.ts	1	§3.2 registerSlotComponent('notifications')
providers.test.tsx	1	§3.4 вызовы callProvider для list и counts
actions.test.tsx	1	§3.6 runAction({ type: 'mark-read', id })
render.test.tsx	3	A.5 loading / error / empty
settings.test.tsx	2	§3.1 pageTitle/pageSubtitle, sidebarBackdrop
pagination.test.tsx	1	Пагинация (page: 2 при loadMore)
a11y.test.tsx	2	A.3 заголовок, aria-pressed у вкладок
a6-cancellation.test.tsx	2	A.6 AbortSignal для деталей, отмена при закрытии
a7-caching.test.tsx	2	A.7 TTL (фиксирует замечание BUG-005)
a12-documentation.test.ts	7	A.12/A.15 README, CHANGELOG, package.json
🚫 Что НЕ проверяется (границы)
Мобильная версия (React Native / WebView) — требуется @testing-library/react-native + Jest, отдельные тесты.

Интеграция с реальным бэкендом — используется dev-мок (src/mock/data.ts).

Кросс-браузерность — тесты в jsdom, не в реальных браузерах.

📋 Баг-репорты
Все найденные замечания оформлены в BUG_REPORTS.md:

ID	Серьёзность	Пункт	Кратко
BUG-001	🟡 Средняя	§3.7, A.8	Хардкод текстов, не через t()
BUG-002	🟢 Низкая	§5.1	fetch в apiFetch.ts (dev-only)
BUG-003	🟡 Средняя	A.3	Спиннер без role="status"
BUG-004	🟡 Средняя	A.3	Карточки без role="listitem"
BUG-005	🟢 Низкая	A.7	TTL не передаётся в callProvider
BUG-006	🟢 Низкая	A.15	Нет CHANGELOG.md
🛠 Технологии
Тест-раннер: Vitest

DOM-окружение: jsdom

Рендер-тесты: @testing-library/react

Пользовательские события: @testing-library/user-event

Проверки DOM: @testing-library/jest-dom

🔗 Ссылки
Контракт: CONTRACT.md, CONTRACT-APPENDIX-1..4

Компонент (веб): omninotice-notification-feed

Задача: FR-10 — Лента уведомлений (Inbox) в Sigma — веб и моб. версия

📝 Лицензия
MIT
