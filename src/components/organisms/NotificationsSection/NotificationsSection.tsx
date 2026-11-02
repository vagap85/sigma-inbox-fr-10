import { runAction } from "@core/actions";
import styles from "./NotificationsSection.module.css";
import { NotificationList } from "../../molecules";
import { Button, SpinnerLoader, Text } from "../../atoms";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toCardProps } from "../../../api/notificationMapper";
import type { NotificationAction } from "../../../api/actions";
import { useTab } from "../../../hooks/useTab";
import NotificationsState from "../../molecules/NotificationsState/NotificationsState";
import { useNotificationsContext } from "../../../app/contexts/NotificationsContext";
import { useNotificationSettings } from "../../../config/SettingsContext";

export default function NotificationsSection() {
  const { state } = useNotificationsContext();
  const {
    items,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    markRead,
    loadMore,
    retry,
  } = state;
  const { tab, unreadCount } = useTab();
  const { autoLoadUnread } = useNotificationSettings();
  const pendingActionIdsRef = useRef(new Set<string>());
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [actionError, setActionError] = useState<string | null>(null);
  const cards = useMemo(() => items.map(toCardProps), [items]);
  const visibleCards = useMemo(
    () => (tab === "unread" ? cards.filter((card) => !card.isRead) : cards),
    [cards, tab],
  );

  const needsMoreUnread =
    tab === "unread" &&
    !isLoading &&
    !isLoadingMore &&
    !error &&
    visibleCards.length === 0 &&
    unreadCount > 0 &&
    hasMore;

  const isEmpty = !isLoading && !error && items.length === 0;

  // Непрочитанных на вкладке нет, но в ленте уведомления есть
  const isUnreadTabEmpty =
    tab === "unread" &&
    !isLoading &&
    !error &&
    items.length > 0 &&
    visibleCards.length === 0;

  useEffect(() => {
    if (needsMoreUnread && autoLoadUnread) loadMore();
  }, [needsMoreUnread, autoLoadUnread, loadMore]);

  const handleAction = useCallback(
    async (action: NotificationAction) => {
      if (pendingActionIdsRef.current.has(action.id)) return false;
      pendingActionIdsRef.current.add(action.id);
      setActionError(null);
      try {
        const notification = itemsRef.current.find(
          (item) => item.chit.message_id === action.id,
        );
        if (!notification || notification.is_read) return false;

        await runAction({ type: "mark-read", id: action.id });
        const wasMarkedRead = markRead(action.id);
        return wasMarkedRead;
      } catch (cause) {
        setActionError(
          cause instanceof Error
            ? cause.message
            : "Не удалось выполнить действие",
        );
        return false;
      } finally {
        pendingActionIdsRef.current.delete(action.id);
      }
    },
    [markRead],
  );

  return (
    <section className={styles.section}>
      {isEmpty && <NotificationsState state="empty" />}
      {error && (
        <NotificationsState
          state="error"
          description={error.message}
          btn={{ onClick: retry }}
        />
      )}
      {actionError && <p role="alert">{actionError}</p>}
      {isUnreadTabEmpty &&
        (unreadCount === 0 || !hasMore ? (
          <NotificationsState state="allRead" />
        ) : autoLoadUnread ? null : (
          <NotificationsState
            state="noUnreadLoaded"
            btn={{ onClick: loadMore }}
          />
        ))}
      <NotificationList notifications={visibleCards} onAction={handleAction} />

      {hasMore && !(tab === "unread" && unreadCount === 0) && (
        <div className={styles.action}>
          <Button variant="link" onClick={loadMore} disabled={isLoadingMore}>
            {isLoadingMore ? "Загрузка..." : "Показать больше"}
          </Button>
        </div>
      )}
    </section>
  );
}
