import {
  ChevronIcon,
  NotificationIcon,
  Text,
} from "../../atoms";
import { classNames } from "../../../helpers/classNames";
import type { NotificationCardProps, NotificationDetails } from "../types";
import styles from "./NotificationCard.module.css";

export default function NotificationCard({
  messageId,
  status,
  isRead,
  picture,
  title,
  description,
  action,
  time,
  onSelect,
}: NotificationCardProps) {
  const details: NotificationDetails = {
    title,
    description,
    action,
    messageId
  };

  return (
    <button
      className={classNames(styles.card, !isRead && styles.unread)}
      data-status={status}
      data-is-read={isRead}
      onClick={() => onSelect?.(details)}
    >
      <div className={styles.left}>
        <NotificationIcon
          picture={picture}
          alt={`Картинка уведомления с названием ${title}`}
        />
        <div className={styles.content}>
          <Text className={styles.title} size="lg" weight="medium">
            {title}
          </Text>
          <Text
            className={styles.description}
            variant="secondary"
          >
            {description}
          </Text>
        </div>
      </div>
      <div className={styles.right}>
        <Text
          className={styles.time}
          as="time"
          variant="secondary"
        >
          {time}
        </Text>
        <div className={styles.chevron}>
          <ChevronIcon />
        </div>
      </div>
    </button>
  );
}
