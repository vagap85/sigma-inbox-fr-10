import { TabContext } from "../app/contexts/TabContext";
import { useContext } from "react";

export function useTab() {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error("useTab must be used within TabProvider");
  }

  return context;
}