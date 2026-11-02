import NotificationCard from "../NotificationCard/NotificationCard";
import { NotificationCardProps } from "../types";
import type { NotificationDetails } from "../types";
import type { NotificationAction } from "../../../api/actions";
import { memo, useCallback } from "react";
import styles from "./NotificationList.module.css";
import NotificationDetailsSidebar from "../../organisms/NotificationDetailsSidebar/NotificationDetailsSidebar";
import { useNotificationDetails } from "../../../hooks/useNotificationDetails";
import { useNotificationsContext } from "../../../app/contexts/NotificationsContext";

type DayGroup = "today" | "yesterday" | "earlier";

const dayLabels: Record<DayGroup, string> = {
  today: "Сегодня",
  yesterday: "Вчера",
  earlier: "Ранее",
};

function getDayGroup(createdAt?: string): DayGroup {
  if (!createdAt) return "earlier";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "earlier";

  const today = new Date();
  const todaySerial = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const notificationDaySerial = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const daysAgo = (todaySerial - notificationDaySerial) / 86_400_000;

  if (daysAgo === 0) return "today";
  if (daysAgo === 1) return "yesterday";
  return "earlier";
}

export default function NotificationList({
  notifications,
  onAction,
}: {
  notifications: NotificationCardProps[];
  onAction?: (action: NotificationAction) => void | Promise<unknown>;
}) {
  const { onLoadDetails } = useNotificationsContext();
  const handleDetailsReady = useCallback(
    (details: NotificationDetails) => {
      if (details.messageId) {
        return onAction?.({ type: "mark-read", id: details.messageId });
      }
    },
    [onAction],
  );
  const { view, open, retry, close } = useNotificationDetails(
    onLoadDetails,
    handleDetailsReady,
  );

  return (
    <>
      <NotificationListContent
        notifications={notifications}
        onSelect={open}
      />
      <NotificationDetailsSidebar
        view={view}
        onClose={close}
        onRetry={retry}
      />
    </>
  );
}

const NotificationListContent = memo(function NotificationListContent({
  notifications,
  onSelect,
}: {
  notifications: NotificationCardProps[];
  onSelect: (notification: NotificationDetails) => void;
}) {
  const groupedNotifications = notifications.reduce<
    Record<DayGroup, NotificationCardProps[]>
  >(
    (groups, notification) => {
      groups[getDayGroup(notification.createdAt)].push(notification);
      return groups;
    },
    { today: [], yesterday: [], earlier: [] },
  );

  return (
    <div className={styles.groups}>
      {(Object.keys(dayLabels) as DayGroup[]).map((group) => {
        const groupNotifications = groupedNotifications[group];
        if (groupNotifications.length === 0) return null;

        return (
          <section
            className={styles.group}
            key={group}
            aria-label={dayLabels[group]}
          >
            <h2 className={styles.groupTitle}>
              {dayLabels[group]}
            </h2>
            <ul className={styles.list}>
              {groupNotifications.map((card) => (
                <li
                  key={card.messageId ?? card.title}
                >
                  <NotificationListItem
                    card={card}
                    onSelect={onSelect}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
});

const NotificationListItem = memo(function NotificationListItem({
  card,
  onSelect,
}: NotificationListItemProps) {
  return (
    <NotificationCard
      {...card}
      onSelect={onSelect}
    />
  );
}, areNotificationCardPropsEqual);

function areNotificationCardPropsEqual(
  previous: NotificationListItemProps,
  next: NotificationListItemProps,
): boolean {
  const previousPicture = previous.card.picture;
  const nextPicture = next.card.picture;
  const previousAction = previous.card.action;
  const nextAction = next.card.action;

  return (
    previous.onSelect === next.onSelect &&
    previous.card.messageId === next.card.messageId &&
    previous.card.status === next.card.status &&
    previous.card.createdAt === next.card.createdAt &&
    previous.card.time === next.card.time &&
    previous.card.title === next.card.title &&
    previous.card.description === next.card.description &&
    previous.card.isRead === next.card.isRead &&
    previousPicture.image === nextPicture.image &&
    previousPicture.icon === nextPicture.icon &&
    previousPicture.emoji === nextPicture.emoji &&
    previousAction?.url === nextAction?.url &&
    previousAction?.title === nextAction?.title
  );
}

type NotificationListItemProps = {
  card: NotificationCardProps;
  onSelect: (notification: NotificationDetails) => void;
};
