import { createContext } from "react";

export type TabType = "all" | "unread";

export interface TabContextValue {
  tab: TabType;
  setTab: (tab: TabType) => void;
  allCount: number;
  unreadCount: number;
  isLoading: boolean;
}

export const TabContext = createContext<TabContextValue | null>(null);