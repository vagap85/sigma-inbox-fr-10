import { BellRingIcon } from "../components/atoms";
import CheckIcon from "../components/atoms/icons/CheckIcon";
import type {
  NotificationPicture,
  NotificationState,
  NotificationsStateProps,
} from "../components/molecules/types";
import type { ComponentType, ReactNode } from "react";

type NotificationStateContent = Omit<NotificationsStateProps, "state"> & {
  icon?: NotificationPicture["icon"];
};

export interface SettingsProps {
  defaultIcon?: ComponentType | ReactNode;
  notificationState?: Record<NotificationState, NotificationStateContent>;
  sidebarBackdrop?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  autoLoadUnread?: boolean;
}

export interface ResolvedSettings {
  defaultIcon: ComponentType | ReactNode;
  notificationState: Record<NotificationState, NotificationStateContent>;
  sidebarBackdrop: boolean;
  pageTitle: string;
  pageSubtitle: string;
  autoLoadUnread: boolean;
}

export type SettingsOverrides = Partial<
  Omit<SettingsProps, "notificationState">
> & {
  notificationState?: Partial<
    Record<NotificationState, Partial<NotificationStateContent>>
  >;
};

export const settings = {
  defaultIcon: <BellRingIcon />,
  notificationState: {
    empty: {
      icon: <BellRingIcon />,
      title: "Пока нет уведомлений",
      description:
        "Здесь появятся объявления компании и&nbsp;сообщения о&nbsp;ваших задачах.",
    },
    error: {
      icon: <BellRingIcon />,
      title: "Не&nbsp;удалось загрузить уведомления",
      description: "Проверьте соединение и&nbsp;повторите. Ничего не&nbsp;потеряется.",
      btn: {
        title: "Повторить"
      }
    },
    allRead: {
      icon: <CheckIcon />,
      title: "Все уведомления прочитаны",
      description: "Прочитанные уведомления&nbsp;&mdash; на&nbsp;вкладке &laquo;Все&raquo;.",
    },
    noUnreadLoaded: {
      icon: <BellRingIcon />,
      title: "Непрочитанных нет",
      description: "На&nbsp;загруженных страницах нет непрочитанных уведомлений.",
      btn: {
        title: "Показать больше",
      },
    },
  },
  sidebarBackdrop: true,
  pageTitle: "Уведомления",
  pageSubtitle:
    "Объявления компании и&nbsp;сообщения о&nbsp;ваших задачах, отпусках и&nbsp;опросах",
  autoLoadUnread: true,
} satisfies ResolvedSettings;

export function resolveSettings(
  overrides: SettingsOverrides = {},
): ResolvedSettings {
  return {
    ...settings,
    ...overrides,
    defaultIcon: overrides.defaultIcon ?? settings.defaultIcon,
    sidebarBackdrop: overrides.sidebarBackdrop ?? settings.sidebarBackdrop,
    autoLoadUnread: overrides.autoLoadUnread ?? settings.autoLoadUnread,
    notificationState: {
      empty: {
        ...settings.notificationState.empty,
        ...overrides.notificationState?.empty,
      },
      error: {
        ...settings.notificationState.error,
        ...overrides.notificationState?.error,
      },
      allRead: {
        ...settings.notificationState.allRead,
        ...overrides.notificationState?.allRead,
      },
      noUnreadLoaded: {
        ...settings.notificationState.noUnreadLoaded,
        ...overrides.notificationState?.noUnreadLoaded,
      },
    },
  };
}
