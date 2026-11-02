import type { SettingsOverrides } from "../config/settings.config";
import NotificationFeedPage from "../components/pages/NotificationFeedPage";
import { NotificationsFeedProvider } from "./providers/NotificationsFeedProvider";
import "./App.css";

const settings: SettingsOverrides = {
  sidebarBackdrop: false,
  autoLoadUnread: false,
};

function App() {
  return (
    <div className="app">
      <img src="/src/assets/menu.png" />
      <NotificationsFeedProvider settings={settings}>
        <NotificationFeedPage />
      </NotificationsFeedProvider>
    </div>
  );
}

export default App;
