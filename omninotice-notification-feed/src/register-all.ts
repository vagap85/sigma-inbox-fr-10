import { createElement } from "react";
import type { SlotComponentProps } from "@core/hive";
import { registerSlotComponent } from "@core/hive/react";
import NotificationFeedPage from "./components/pages/NotificationFeedPage";
import { NotificationsFeedProvider } from "./app/providers/NotificationsFeedProvider";
import type { SettingsOverrides } from "./config/settings.config";

function NotificationFeedSlot(props: SlotComponentProps) {
  const settings = getSettingsOverrides(props.settings);

  return createElement(
    NotificationsFeedProvider,
    {
      settings,
      children: createElement(NotificationFeedPage, props),
    },
  );
}

function getSettingsOverrides(
  settings: Record<string, unknown> | undefined,
): SettingsOverrides {
  if (!settings) return {};

  return {
    ...(typeof settings.sidebarBackdrop === "boolean" && {
      sidebarBackdrop: settings.sidebarBackdrop,
    }),
    ...(typeof settings.autoLoadUnread === "boolean" && {
      autoLoadUnread: settings.autoLoadUnread,
    }),
    ...(typeof settings.pageTitle === "string" && {
      pageTitle: settings.pageTitle,
    }),
    ...(typeof settings.pageSubtitle === "string" && {
      pageSubtitle: settings.pageSubtitle,
    }),
  };
}

registerSlotComponent("notifications", NotificationFeedSlot);
