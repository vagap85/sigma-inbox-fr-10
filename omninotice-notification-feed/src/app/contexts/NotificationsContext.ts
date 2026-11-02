import type { LoadNotificationDetails } from "../../components/molecules/types";
import type { NotificationsState } from "../../hooks/useNotificationsFeed";
import { createContext, useContext } from "react";

export interface NotificationsContextValue {
  state: NotificationsState;
  /** Loads additional details from the registered data provider. */
  onLoadDetails: LoadNotificationDetails;
}

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function useNotificationsContext(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "NotificationFeedPage must be rendered inside NotificationsFeedProvider",
    );
  }
  return context;
}
