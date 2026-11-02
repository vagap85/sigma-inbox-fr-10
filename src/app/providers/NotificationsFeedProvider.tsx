import { callProvider } from "@core/data";
import { createElement, useMemo, type ReactNode } from "react";
import type { NotificationCountsResponse } from "../../api/notificationCounts";
import type { NotificationDetailsResponse } from "../../api/notificationDetails";
import { NOTIFICATION_PROVIDERS } from "../../api/requests";
import { toDetails } from "../../api/notificationMapper";
import type { NotificationsResponse } from "../../api/notifications";
import type { LoadNotificationDetails } from "../../components/molecules/types";
import {
  resolveSettings,
  type SettingsOverrides,
} from "../../config/settings.config";
import {
  useNotificationsFeed,
  type GetHasMore,
} from "../../hooks/useNotificationsFeed";
import {
  NotificationsContext,
  type NotificationsContextValue,
} from "../contexts/NotificationsContext";
import { SettingsContext } from "../../config/SettingsContext";

export interface NotificationsFeedProviderProps {
  /** Override pagination when the registered data provider uses a custom scheme. */
  getHasMore?: GetHasMore;
  settings?: SettingsOverrides;
  children: ReactNode;
}

export function NotificationsFeedProvider({
  getHasMore,
  settings,
  children,
}: NotificationsFeedProviderProps) {
  const state = useNotificationsFeed({
    fetchList: (page) =>
      callProvider<NotificationsResponse>(NOTIFICATION_PROVIDERS.list, {
        page,
      }),
    fetchCounts: () =>
      callProvider<NotificationCountsResponse>(
        NOTIFICATION_PROVIDERS.counts,
      ),
    getHasMore,
  });

  const onLoadDetails = useMemo<LoadNotificationDetails>(
    () => async (messageId, signal) =>
      toDetails(
        await callProvider<NotificationDetailsResponse>(
          NOTIFICATION_PROVIDERS.details,
          { messageId, signal },
        ),
        messageId,
      ),
    [],
  );
  const resolvedSettings = useMemo(() => resolveSettings(settings), [settings]);
  const contextValue = useMemo<NotificationsContextValue>(
    () => ({ state, onLoadDetails }),
    [state, onLoadDetails],
  );

  return createElement(
    SettingsContext.Provider,
    { value: resolvedSettings },
    createElement(
      NotificationsContext.Provider,
      { value: contextValue },
      children,
    ),
  );
}
