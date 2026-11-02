import { apiFetch } from "../api/apiFetch";
import { NotificationCountsResponseSchema } from "../api/notificationCounts";
import { NotificationDetailsResponseSchema } from "../api/notificationDetails";
import { NotificationsResponseSchema } from "../api/notifications";

const auth = { token: "mock", projectId: "mock" };
let failNext = true;

Object.assign(window, {
  failNext: () => {
    failNext = true;
  },
});

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Запрос отменён", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Запрос отменён", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });

function getParams(params: unknown): Record<string, unknown> {
  if (typeof params !== "object" || params === null || Array.isArray(params)) {
    throw new Error("Параметры провайдера должны быть объектом");
  }
  return params as Record<string, unknown>;
}

export async function callProvider<TResult>(
  name: string,
  params?: unknown,
): Promise<TResult> {
  if (name === "notifications.doocot.list") {
    const page = getParams(params).page;
    if (typeof page !== "number" || !Number.isInteger(page) || page < 1) {
      throw new Error("Для списка требуется положительный номер страницы");
    }

    await delay(400);
    if (failNext) {
      failNext = false;
      throw new Error("Тестовая ошибка загрузки");
    }

    return (await apiFetch(
      `/mock/notifications-${page}.json`,
      NotificationsResponseSchema,
      auth,
    )) as TResult;
  }

  if (name === "notifications.doocot.counts") {
    return (await apiFetch(
      "/mock/notification-counts.json",
      NotificationCountsResponseSchema,
      auth,
    )) as TResult;
  }

  if (name === "notifications.doocot.details") {
    const messageId = getParams(params).messageId;
    const signal = getParams(params).signal;
    if (typeof messageId !== "string" || !messageId) {
      throw new Error("Для деталей требуется messageId");
    }
    if (signal !== undefined && !(signal instanceof AbortSignal)) {
      throw new Error("signal должен быть экземпляром AbortSignal");
    }
    await delay(3000, signal);
    return (await apiFetch(
      `/mock/notification-details-${messageId}.json`,
      NotificationDetailsResponseSchema,
      { ...auth, signal },
    )) as TResult;
  }

  throw new Error(`Неизвестный провайдер: ${name}`);
}
