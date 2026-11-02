import type {
  NotificationCardProps,
  NotificationDetails,
} from "../components/molecules/types";
import type { NotificationCountsResponse } from "./notificationCounts";
import type { NotificationDetailsResponse } from "./notificationDetails";
import type { Notification } from "./notifications";

export interface FeedCounts {
  all: number;
  unread: number;
}

export function toCounts(response: NotificationCountsResponse): FeedCounts {
  const counts = response.data[0];
  if (!counts) throw new Error("Сервер не вернул количество уведомлений");
  return { all: counts.total_count, unread: counts.unread_count };
}

export function toDetails(
  response: NotificationDetailsResponse,
  messageId: string,
): NotificationDetails {
  const item =
    response.data.find((entry) => entry.chit.message_id === messageId) ??
    response.data[0];
  if (!item) throw new Error("Сервер не вернул уведомление");

  const { chit } = item;
  return {
    messageId: chit.message_id,
    title: chit.title,
    description: chit.description ?? "",
    text: chit.text ?? undefined,
    action: chit.action
      ? { url: chit.action.url, title: chit.action.title }
      : undefined,
  };
}

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

export function toCardProps(n: Notification): NotificationCardProps {
  const { chit } = n;
  const createdAt = n.created_date;
  const createdDate = new Date(createdAt);
  return {
    messageId: chit.message_id,
    status: n.status,
    createdAt,
    time: Number.isNaN(createdDate.getTime())
      ? ""
      : timeFormatter.format(createdDate),
    title: chit.title,
    description: chit.description ?? "",
    picture: {
      image: chit.picture?.main ?? chit.picture?.preview ?? chit.picture?.cover ?? undefined,
      icon: chit.picture?.icon ?? undefined,
      emoji: chit.picture?.emoji ?? undefined,
    },
    action: chit.action ?? undefined,
    isRead: n.is_read,
  };
}