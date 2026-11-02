import { Button, NotificationIcon, Text } from "../../atoms";
import { classNames } from "../../../helpers/classNames";
import styles from "./NotificationsState.module.css";
import { NotificationsStateProps } from "../types";
import { useNotificationSettings } from "../../../config/SettingsContext";
import { decode } from "../../../helpers/decoder";

export default function NotificationsState({
  state,
  title,
  description,
  btn,
  className,
}: NotificationsStateProps) {
  const { notificationState } = useNotificationSettings();
  const content = notificationState[state];
  const btnTitle = btn?.title ?? content.btn?.title;
  const btnOnClick = btn?.onClick ?? content.btn?.onClick;

  return (
    <div
      className={classNames(
        styles.state,
        state === "error" && styles.error,
        className,
      )}
    >
      <NotificationIcon picture={{ icon: content.icon }} />
      <div className={styles.content}>
        <Text
          className={styles.title}
          size="lg"
          weight="medium"
        >
          {decode(title ?? content.title)}
        </Text>
        <Text
          className={styles.subtitle}
          variant="secondary"
        >
          {decode(description ?? content.description)}
        </Text>
      </div>
      {btnTitle && btnOnClick && (
        <Button className={styles.button} onClick={btnOnClick}>
          <Text size="sm" variant="paper">
            {btnTitle}
          </Text>
        </Button>
      )}
    </div>
  );
}
