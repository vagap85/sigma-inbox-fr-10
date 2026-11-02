# omninotice-notification-feed

Совместимость с Apiary: `^1.3.0`. Требуется React `>=18.2`.

**Карта:** [Подключение](#быстрое-подключение) · [Apiary-слот](#apiary-слот) ·
[Запросы](#запросы) · [Настройки](#настройки) · [API](#api-пакета) ·
[CSS-токены](#css-токены) · [Локальный просмотр](#локальный-просмотр)

## Быстрое подключение

```tsx
import {
  NotificationFeedPage,
  NotificationsFeedProvider,
} from "omninotice-notification-feed";
import "omninotice-notification-feed/style.css";

export function Notifications() {
  return (
    <NotificationsFeedProvider>
      <NotificationFeedPage />
    </NotificationsFeedProvider>
  );
}
```

До рендера зарегистрируйте в `@core/data` три провайдера из раздела
[Запросы](#запросы), а в `@core/actions` — действие `mark-read`.

### Apiary-слот

В точке входа приложения импортируйте регистрацию и стили:

```ts
import "omninotice-notification-feed/register-all";
import "omninotice-notification-feed/style.css";
```

Добавьте компонент в конфигурацию слота:

```ts
{ name: "sidebar", components: [{ id: "notifications", order: 2 }] }
```

Обёртка `NotificationsFeedProvider` и регистрация компонента выполняются пакетом.
Хост должен предоставлять `@core/hive`, `@core/data` и `@core/actions`.

## Запросы

Пакет вызывает провайдеры через `callProvider`. Зарегистрируйте обработчики в
`@core/data` под этими именами:

| Провайдер | Параметры | Результат |
| --- | --- | --- |
| `notifications.doocot.list` | `{ page: number }` | Ответ списка |
| `notifications.doocot.counts` | нет | Ответ счётчиков |
| `notifications.doocot.details` | `{ messageId: string, signal?: AbortSignal }` | Ответ деталей |

Пример обработчиков для хоста (замените URL на адреса своего API), которые
затем нужно зарегистрировать в `@core/data`:

```ts
import { NOTIFICATION_PROVIDERS } from "omninotice-notification-feed";

async function getJson(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export const notificationProviders = {
  [NOTIFICATION_PROVIDERS.list]: ({ page }: { page: number }) =>
    getJson(`/my/chits?page=${page}`),
  [NOTIFICATION_PROVIDERS.counts]: () =>
    getJson("/my/chits/status"),
  [NOTIFICATION_PROVIDERS.details]: ({
    messageId,
    signal,
  }: {
    messageId: string;
    signal?: AbortSignal;
  }) =>
    getJson(
      `/my/chit/${encodeURIComponent(messageId)}`,
      signal,
    ),
};
```

Каждый обработчик должен вернуть JSON-ответ в формате ниже. Если в приложении
уже есть API-клиент, используйте его вместо `fetch`.

Провайдер деталей должен передавать `signal` в сетевой запрос, например
`fetch(url, { signal })`: при закрытии панели запрос отменяется.

Все ответы имеют вид `{ detail, data, info }`. `data` — массив:

- список: элементы с `status`, `created_date`, `modified_date`, `is_read` и
  `chit` (`message_id`, `message_type`, `title`, `description`, `picture`,
  `action`);
- счётчики: первый элемент — `{ total_count, unread_count }`;
- детали: элемент списка с дополнительными `chit.text`, `chit.action` и
  `chit.extra`.

`info` содержит `api_version`, `count`, `total`, `page`, `page_size`.
Пустая страница завершает загрузку. Если стандартная пагинация по
`total_count` не подходит, передайте `getHasMore(info, loadedCount)` в
`NotificationsFeedProvider`.

После успешной загрузки деталей непрочитанного уведомления и при нажатии на
действие карточки пакет вызывает `runAction({ type: "mark-read", id })`, где
`id` — `messageId`. Зарегистрируйте обработчик этого действия в `@core/actions`:

```ts
async function markRead({ id }: { id: string }) {
  const response = await fetch(
    `/my/${encodeURIComponent(id)}/read`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chit_id: id }),
    },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
```

`id` передаётся как `chit_id` в URL и JSON-теле запроса. Подключите функцию к
действию `mark-read` в конфигурации `@core/actions`. При ошибке пакет показывает
сообщение, а локально отмечает уведомление прочитанным только после успеха.

## Настройки

Передайте настройки в `NotificationsFeedProvider`:

```tsx
<NotificationsFeedProvider
  settings={{
    pageTitle: "Уведомления",
    pageSubtitle: "Новости и задачи",
    autoLoadUnread: true,
    sidebarBackdrop: true,
  }}
>
  <NotificationFeedPage header={<MyHeader />} />
</NotificationsFeedProvider>
```

| Настройка | По умолчанию | Назначение |
| --- | --- | --- |
| `pageTitle` | `Уведомления` | Заголовок |
| `pageSubtitle` | описание ленты | Подзаголовок |
| `autoLoadUnread` | `true` | Загружать страницы, пока не найдутся непрочитанные |
| `sidebarBackdrop` | `true` | Затемнение за панелью деталей |
| `defaultIcon` | иконка уведомления | Иконка без изображения |
| `notificationState` | тексты пакета | Содержимое состояний `empty`, `error`, `allRead`, `noUnreadLoaded` |

Для `notificationState` можно переопределить `title`, `description`, `btn`
(`title`, `onClick`), `className` и `icon`. Настройки объединяются с
значениями по умолчанию. `defaultIcon` и `notificationState` доступны при
прямом использовании `NotificationsFeedProvider`; в `SlotComponentProps.settings`
поддерживаются только первые четыре настройки таблицы.

`NotificationFeedPage` принимает необязательный `header` — React-узел перед
заголовком страницы.

## API пакета

Из корневого импорта экспортируются `NotificationsFeedProvider`,
`NotificationFeedPage`, `SettingsOverrides`, `GetHasMore`, `NOTIFICATION_PROVIDERS`,
типы ответов и уведомлений (`NotificationsResponse`, `Notification`,
`NotificationCountsResponse`, `NotificationDetailsResponse`) и соответствующие
схемы (`NotificationsResponseSchema`, `NotificationCountsResponseSchema`,
`NotificationDetailsResponseSchema` и схемы элементов). Детали показывают
`chit.text`, а при его отсутствии — `chit.description`; `chit.action`
отображается как ссылка.

## CSS-токены

Токены пакета из `NotificationFeedPage.module.css`:

```css
--omni-main-bg: var(--color-surface, #f5f6f9); /* фон страницы */
--omni-primary: var(--color-primary, #487bfe); /* основной цвет */
--omni-primary-hover: var(
    --color-primary-hover,
    hsl(from var(--omni-primary) h s calc(l - 10))
); /* цвет при наведении */
--omni-primary-text: var(--color-text-primary, #0c151d); /* основной текст */
--omni-secondary-text: var(--color-text-secondary, #767a7f); /* вторичный текст */
--omni-breadcumbs-icon-color: var(--color-icon, #4a5665); /* цвет иконки */
--omni-sidebar-box-shadow: var(
    --color-shadow,
    0px 0px 1px 0px #00000066,
    -8px 8px 24px -8px #00000029
); /* тень панели */
--omni-state-box-shadow: var(--color-shadow, 0px 0px 1px #0000004D); /* тень состояния */
--omni-nf-bg: var(--color-surface, #ffffff); /* фон карточки */
--omni-nf-bg-hover: var(
    --color-bg-hover,
    color-mix(in srgb, var(--omni-primary) 12%, white)
); /* фон при наведении */
--omni-nf-icon: var(--omni-primary); /* цвет иконки уведомления */
--omni-nf-icon-error: var(--color-danger, #e65443); /* цвет иконки ошибки */
--omni-nf-icon-bg: var(
    --color-primary-soft,
    color-mix(in srgb, var(--omni-nf-icon) 25%, white)
); /* фон иконки уведомления */
--omni-nf-icon-bg-error: var(
    --color-danger-soft,
    color-mix(in srgb, var(--omni-nf-icon-error) 25%, white)
); /* фон иконки ошибки */
--omni-border-color: var(--color-border, #eceef4); /* цвет границы */
--omni-border-hover: var(--color-text-primary, #0c151d); /* граница при наведении */
--omni-radius: var(--radius-md, 8px); /* радиус скругления */
--omni-container-padding-inline: 24px 20px; /* отступы контейнера */
--omni-nf-icon-container-size: 56px; /* размер контейнера иконки */
--omni-nf-icon-chevron-size: 24px; /* размер шеврона */
--omni-tabs-margin-block: 32px; /* отступ вкладок */
--omni-transition: 0.15s ease-in; /* скорость перехода */
```

В состоянии ошибки `NotificationsState.module.css` переопределяет:

```css
--omni-nf-icon: var(--omni-nf-icon-error); /* цвет иконки ошибки */
--omni-nf-icon-bg: var(--omni-nf-icon-bg-error); /* фон иконки ошибки */
```

Стили компонентов изолированы CSS Modules.

## Локальный просмотр

`npm run dev` запускает превью с моками из `public/mock`. Создайте их командой
`npm run generate:mock`; после клонирования её нужно выполнить один раз.
