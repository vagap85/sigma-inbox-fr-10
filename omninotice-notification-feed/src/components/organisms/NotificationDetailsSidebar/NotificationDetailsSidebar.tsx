import { useEffect, useRef } from "react";
import { Button, SpinnerLoader, Text } from "../../atoms";
import CloseIcon from "../../atoms/icons/CloseIcon";
import NotificationsState from "../../molecules/NotificationsState/NotificationsState";
import type { NotificationDetailsView } from "../../molecules/types";
import { useNotificationSettings } from "../../../config/SettingsContext";
import { classNames } from "../../../helpers/classNames";
import styles from "./NotificationDetailsSidebar.module.css";

interface NotificationDetailsSidebarProps {
  view: NotificationDetailsView;
  onClose: () => void;
  onRetry: () => void;
}

export default function NotificationDetailsSidebar({
  view,
  onClose,
  onRetry,
}: NotificationDetailsSidebarProps) {
  const { sidebarBackdrop } = useNotificationSettings();
  const isOpen = view.status !== "closed";
  
  // чтобы при анимации закрытия содержимое не пропадало
  const lastViewRef = useRef(view);
  if (isOpen) lastViewRef.current = view;
  const shown = lastViewRef.current;


  const details =
    shown.status === "ready"
      ? shown.details
      : shown.status === "closed"
        ? null
        : shown.preview;

  const body =
    shown.status === "ready"
      ? shown.details.text || shown.details.description
      : null;

  const action =
    shown.status === "ready" &&
    shown.details.action?.url &&
    shown.details.action.title
      ? shown.details.action
      : null;

  return (
    <div
      className={classNames(
        styles.backdrop,
        sidebarBackdrop && styles.filled,
        isOpen && styles.open,
      )}
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className={classNames(styles.sidebar, isOpen && styles.open)}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-labelledby={isOpen ? "notification-details-title" : undefined}
        aria-hidden={!isOpen}
      >
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <Text
              as="h2"
              id="notification-details-title"
              size="md"
              weight="semibold"
            >
              {details?.title}
            </Text>
            <Button
              variant="icon"
              aria-label="Закрыть уведомление"
              tabIndex={isOpen ? undefined : -1}
              onClick={onClose}
            >
              <CloseIcon width={9} height={9} />
            </Button>
          </div>

          <div className={styles.content}>
            {shown.status === "loading" && (
              <div className={styles.loader}>
                <SpinnerLoader variant="primary" size="lg" />
              </div>
            )}
            {shown.status === "error" && (
              <NotificationsState
                className={styles.error}
                state="error"
                btn={{ onClick: onRetry }}
              />
            )}
            {body && <Text variant="secondary">{body}</Text>}
          </div>

          <div className={styles.actions}>
            {action && (
              <Button
                className={styles.actionButton}
                as="a"
                href={action.url}
              >
                {action.title}
              </Button>
            )}
            <Button
              className={styles.closeButton}
              variant="secondary"
              onClick={onClose}
            >
              Закрыть
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
