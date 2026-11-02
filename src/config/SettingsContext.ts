import { createContext, useContext } from "react";
import { settings, type ResolvedSettings } from "./settings.config";

export const SettingsContext = createContext<ResolvedSettings>(settings);

export function useNotificationSettings(): ResolvedSettings {
  return useContext(SettingsContext);
}
