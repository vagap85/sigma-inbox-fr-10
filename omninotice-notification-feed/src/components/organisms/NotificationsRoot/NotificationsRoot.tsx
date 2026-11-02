import { useNotificationsContext } from "../../../app/contexts/NotificationsContext";
import TabProvider from "../../../app/providers/TabProvider";
import type { ReactNode } from "react";

export default function NotificationsRoot({ children }: { children: ReactNode }) {
  const { state } = useNotificationsContext();

  return (
    <TabProvider
      allCount={state.counts.all}
      unreadCount={state.counts.unread}
      isLoading={state.isCountsLoading}
    >
      {children}
    </TabProvider>
  );
}