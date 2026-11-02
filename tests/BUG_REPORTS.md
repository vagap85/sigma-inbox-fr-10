# Баг-репорты по проверке контракта omninotice-notification-feed


Дата проверки: 2026-11-02
Проверяемая версия: 0.1.0
Совместимость с Apiary: ^1.3.0
Всего тестов: 32 (все пройдены)
Найдено замечаний: 6 (не блокируют встраивание)


---


## BUG-001: Тексты захардкожены на русском, не используются через @core/i18n


Серьёзность: 🟡 Средняя
Пункт контракта: §3.7 (i18n), A.8 (локализация)
Файл: src/config/settings.config.tsx
Тест: tests/contract.test.ts, tests/a12-documentation.test.ts


Описание:
Тексты по умолчанию (pageTitle, pageSubtitle, notificationState.empty/error/allRead/noUnreadLoaded) захардкожены на русском языке и не используют t() из @core/i18n.


Шаги воспроизведения:
1. Открыть src/config/settings.config.tsx.
2. Проверить значения settings.pageTitle, settings.pageSubtitle, settings.notificationState.*.title/description.


Ожидаемое поведение:
Тексты должны быть получены через t() из @core/i18n или вынесены в отдельный файл локализации.


Фактическое поведение:
Тексты заданы строками на русском:
pageTitle: "Уведомления",
pageSubtitle: "Объявления компании и сообщения о ваших задачах, отпусках и опросах",
notificationState: { empty: { title: "Пока нет уведомлений", ... }, ... }


Смягчающие обстоятельства:
Все тексты переопределяемы через settings / NotificationsFeedProvider, поэтому потребитель может передать свои тексты (в т.ч. через t()). Формально нарушение §3.7, но не блокирует интеграцию.


Рекомендация:
Добавить поддержку t() из @core/i18n для текстов по умолчанию, либо явно задокументировать, что тексты переопределяемы.


---












## BUG-002: src/api/apiFetch.ts использует fetch напрямую


Серьёзность: 🟢 Низкая (dev-only)
Пункт контракта: §5.1 (хранилища и сеть)
Файл: src/api/apiFetch.ts
Тест: tests/contract.test.ts


Описание:
src/api/apiFetch.ts использует fetch напрямую, что формально нарушает §5.1 («Всё — через @core/data»).


Шаги воспроизведения:
1. Открыть src/api/apiFetch.ts.
2. Найти вызов fetch(url, { ... }).


Ожидаемое поведение:
Данные — только через callProvider / apiService из @core/data.


Фактическое поведение:
apiFetch использует fetch. Однако он импортируется только из src/mock/data.ts (dev-мок), который в прод-сборке не участвует.


Смягчающие обстоятельства:
В прод-бандле apiFetch не участвует. Пакет вызывает callProvider, который хост реализует сам.




Рекомендация:
Убедиться, что apiFetch не попадёт в прод-бандл (сейчас ок). Опционально — перенести apiFetch в src/mock/ для явного разделения dev/prod.


---


## BUG-003: Спиннер загрузки без role="status" / aria-live


Серьёзность: 🟡 Средняя (a11y)
Пункт контракта: A.3 (доступность)
Файл: src/components/atoms/Loaders/SpinnerLoader/SpinnerLoader.tsx
Тест: tests/render.test.tsx, tests/a11y.test.tsx


Описание:
Спиннер загрузки — это div с классом _spinner_* без role="status" и aria-live="polite". Скринридер не сообщает пользователю о процессе загрузки.


Шаги воспроизведения:
1. Открыть src/components/atoms/Loaders/SpinnerLoader/SpinnerLoader.tsx.
2. Проверить разметку — div без role/aria-live.


Ожидаемое поведение:
Разметка должна содержать role="status" и aria-live="polite" (или aria-busy).




Фактическое поведение:
Разметка — div без ролей.


Смягчающие обстоятельства:
Нет. Нарушает WCAG 2.1 (SC 4.1.3 Status Messages).


Рекомендация:
Добавить role="status" и aria-live="polite" (или aria-busy) в SpinnerLoader.


---


## BUG-004: Карточки уведомлений без role="listitem", контейнер без role="list"


Серьёзность: 🟡 Средняя (a11y)
Пункт контракта: A.3 (доступность)
Файлы: src/components/molecules/NotificationList/NotificationList.tsx, src/components/molecules/NotificationCard/NotificationCard.tsx
Тест: tests/pagination.test.tsx, tests/actions.test.tsx


Описание:
Список уведомлений и карточки не имеют семантических ролей list и listitem. Скринридер не воспринимает их как список и не сообщает количество элементов.






Шаги воспроизведения:
1. Открыть NotificationList.tsx — контейнер div без role="list".
2. Открыть NotificationCard.tsx — карточка div без role="listitem".


Ожидаемое поведение:
Контейнер должен иметь role="list", карточки — role="listitem" (или использоваться ul/li).


Фактическое поведение:
div без ролей.


Смягчающие обстоятельства:
Нет. Нарушает WCAG 2.1 (SC 1.3.1 Info and Relationships).


Рекомендация:
Добавить role="list" на контейнер и role="listitem" на карточку (или перейти на ul/li).


---


## BUG-005: TTL не передаётся в callProvider для counts и list


Серьёзность: 🟢 Низкая (производительность)
Пункт контракта: A.7 (кэширование)
Файл: src/hooks/useNotificationsFeed.ts, src/app/providers/NotificationsFeedProvider.tsx
Тест: tests/a7-caching.test.tsx


Описание:
callProvider вызывается без TTL для всех провайдеров, включая notifications.doocot.counts, который меняется редко. Это увеличивает нагрузку на сервис.


Шаги воспроизведения:
1. Открыть NotificationsFeedProvider.tsx.
2. Проверить вызовы callProvider — четвёртый аргумент (ttl) не передаётся.


Ожидаемое поведение:
callProvider('notifications.doocot.counts', undefined, undefined, 30_000);


Фактическое поведение:
callProvider('notifications.doocot.counts');
TTL не передаётся (тест a7-caching.test.tsx фиксирует ttl === undefined).


Смягчающие обстоятельства:
Не критично, но улучшает производительность.


Рекомендация:
Передать TTL (например, 30_000 мс) для counts. После этого обновить тест: заменить expect(ttl).toBeUndefined() на expect(ttl).toBeGreaterThan(0).


---




## BUG-006: Отсутствует CHANGELOG.md


Серьёзность: 🟢 Низкая (поставка)
Пункт контракта: A.15 (changelog), A.13 (semver), A.14 (обратная совместимость)
Файл: корень проекта
Тест: tests/a12-documentation.test.ts


Описание:
В корне проекта отсутствует CHANGELOG.md. Контракт A.15 рекомендует вести changelog по формату «Keep a Changelog» (Added, Changed, Deprecated, Removed, Fixed, Security).


Шаги воспроизведения:
1. Проверить корень проекта — CHANGELOG.md отсутствует.


Ожидаемое поведение:
Файл CHANGELOG.md в корне с секциями (Unreleased, версии).


Фактическое поведение:
Файл отсутствует.


Смягчающие обстоятельства:
Нет. Формально нарушает A.15.






Рекомендация:
Создать CHANGELOG.md по формату «Keep a Changelog». После этого тест a12-documentation.test.ts можно ужесточить: expect(content.length).toBeGreaterThan(100) без console.warn.


---


## Сводная таблица


ID | Серьёзность | Пункт | Кратко | Блокирует?
---|---|---|---|---
BUG-001 | 🟡 Средняя | §3.7, A.8 | Хардкод текстов, не через t() | Нет (переопределяемо)
BUG-002 | 🟢 Низкая | §5.1 | fetch в apiFetch.ts (dev-only) | Нет (не в прод-бандле)
BUG-003 | 🟡 Средняя | A.3 | Спиннер без role="status" | Нет (a11y)
BUG-004 | 🟡 Средняя | A.3 | Карточки без role="listitem" | Нет (a11y)
BUG-005 | 🟢 Низкая | A.7 | TTL не передаётся в callProvider | Нет (производительность)
BUG-006 | 🟢 Низкая | A.15 | Нет CHANGELOG.md | Нет (поставка)


Итог: ни один баг не блокирует встраивание компонента в Apiary. Все замечания — улучшения, которые можно внести итеративно.


---

## Как воспроизвести проверку


npm install
npm run generate:mock https://github.com/OrdynsDav/omninotice-notification-feed
npm run test


Ожидаемый результат: 32/32 тестов пройдено, 11 файлов зелёные.


---


## Покрытие тестами


Файл | Кол-во тестов | Что проверяет
---|---|---
contract.test.ts | 10 | §3, §5
registration.test.ts | 1 | §3.2
providers.test.tsx | 1 | §3.4
actions.test.tsx | 1 | §3.6
render.test.tsx | 3 | A.5
settings.test.tsx | 2 | §3.1
pagination.test.tsx | 1 | Пагинация
a11y.test.tsx | 2 | A.3
a6-cancellation.test.tsx | 2 | A.6
a7-caching.test.tsx | 2 | A.7
a12-documentation.test.ts | 7 | A.12/A.15
Итого | 32 |



