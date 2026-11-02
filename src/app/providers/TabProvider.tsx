import { useMemo, useState, type ReactNode } from "react";
import { TabContext, type TabType } from "../contexts/TabContext";

interface TabProviderProps {
  defaultTab?: TabType;
  allCount: number;
  unreadCount: number;
  isLoading?: boolean;
  children: ReactNode;
}

export default function TabProvider({
  defaultTab = "all",
  allCount,
  unreadCount,
  isLoading = false,
  children,
}: TabProviderProps) {
  const [tab, setTab] = useState<TabType>(defaultTab);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      allCount,
      unreadCount,
      isLoading,
    }),
    [tab, allCount, unreadCount, isLoading],
  );

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}