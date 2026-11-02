import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Notification, NotificationsInfo } from "../api/notifications";
import { toCounts, type FeedCounts } from "../api/notificationMapper";
import type { NotificationCountsResponse } from "../api/notificationCounts";
import type { NotificationsResponse } from "../api/notifications";

/** Есть ли ещё страницы. `loadedCount` — сколько уведомлений уже в ленте (без дублей) */
export type GetHasMore = (
  info: NotificationsInfo,
  loadedCount: number,
) => boolean;

export interface NotificationsFeedRequests {
  fetchList: (page: number) => Promise<NotificationsResponse>;
  fetchCounts: () => Promise<NotificationCountsResponse>;
  /** Необязательно: своя логика «есть ещё страницы». Без неё считаем по counts */
  getHasMore?: GetHasMore;
}

export interface NotificationsState {
  items: Notification[];
  counts: FeedCounts;
  error: Error | null;
  /** Грузится первая страница */
  isLoading: boolean;
  /** Грузится следующая страница */
  isLoadingMore: boolean;
  isCountsLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  /** Повторить запрос, который упал */
  retry: () => void;
  /** Только локальное состояние: пометить прочитанным уже после успешного запроса */
  markRead: (messageId: string) => boolean;
}

const NO_COUNTS: FeedCounts = { all: 0, unread: 0 };

function merge(prev: Notification[], next: Notification[]): Notification[] {
  const map = new Map<string, Notification>();
  for (const item of prev) map.set(item.chit.message_id, item);
  for (const item of next) map.set(item.chit.message_id, item);
  return Array.from(map.values());
}

/**
 * Внутреннее состояние ленты. Потребитель пакета его не видит:
 * он передаёт только функции запросов, а загрузкой, ошибками, пагинацией
 * и прочитанностью занимаемся мы.
 */
export function useNotificationsFeed(
  requests: NotificationsFeedRequests,
): NotificationsState {
  const [items, setItems] = useState<Notification[]>([]);
  const [info, setInfo] = useState<NotificationsInfo | null>(null);
  const [page, setPage] = useState(0);
  const [counts, setCounts] = useState<FeedCounts>(NO_COUNTS);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCountsLoading, setIsCountsLoading] = useState(true);
  // Пустая страница = конец, что бы ни говорили счётчики
  const [isExhausted, setIsExhausted] = useState(false);

  // Потребитель может передать новые функции на каждом рендере:
  // держим актуальные в ref, чтобы не перезапускать загрузку.
  const requestsRef = useRef(requests);
  requestsRef.current = requests;

  // Решает getHasMore потребителя; без него сравниваем загруженное с total_count
  const hasMore = (() => {
    if (info === null || isExhausted) return false;
    return requests.getHasMore
      ? requests.getHasMore(info, items.length)
      : items.length < counts.all;
  })();

  const latestRef = useRef({ items, page, hasMore, isLoading, isLoadingMore });
  latestRef.current = { items, page, hasMore, isLoading, isLoadingMore };

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (pageNumber: number) => {
    const isFirst = pageNumber === 1;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setError(null);
    if (isFirst) {
      setItems([]);
      setInfo(null);
      setPage(0);
      setCounts(NO_COUNTS);
      setIsExhausted(false);
      setIsLoading(true);
      setIsCountsLoading(true);
      setIsLoadingMore(false);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { fetchList, fetchCounts } = requestsRef.current;
      const [list, countsResponse] = await Promise.all([
        fetchList(pageNumber),
        isFirst ? fetchCounts() : undefined,
      ]);
      if (signal.aborted) return;

      // сначала всё разбираем, потом меняем состояние: при ошибке не будет половины данных
      const nextCounts = countsResponse ? toCounts(countsResponse) : null;

      setItems((current) =>
        isFirst ? list.data : merge(current, list.data),
      );
      setInfo(list.info);
      setPage(pageNumber);
      setIsExhausted(list.data.length === 0);
      if (nextCounts) setCounts(nextCounts);
    } catch (cause) {
      if (signal.aborted) return;
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsCountsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load(1);
    return () => abortRef.current?.abort();
  }, [load]);

  const loadMore = useCallback(() => {
    const latest = latestRef.current;
    if (!latest.hasMore || latest.isLoading || latest.isLoadingMore) return;
    void load(latest.page + 1);
  }, [load]);

  // Страница растёт только после успеха, поэтому повтор = та же страница, что упала
  const retry = useCallback(() => {
    void load(latestRef.current.page + 1);
  }, [load]);

  const markRead = useCallback((messageId: string) => {
    const item = latestRef.current.items.find(
      (notification) => notification.chit.message_id === messageId,
    );
    if (!item || item.is_read) return false;

    setItems((current) =>
      current.map((notification) =>
        notification.chit.message_id === messageId
          ? { ...notification, is_read: true }
          : notification,
      ),
    );
    setCounts((current) => ({
      ...current,
      unread: Math.max(0, current.unread - 1),
    }));
    return true;
  }, []);

  return useMemo(
    () => ({
      items,
      counts,
      error,
      isLoading,
      isLoadingMore,
      isCountsLoading,
      hasMore,
      loadMore,
      retry,
      markRead,
    }),
    [
      items,
      counts,
      error,
      isLoading,
      isLoadingMore,
      isCountsLoading,
      hasMore,
      loadMore,
      retry,
      markRead,
    ],
  );
}
