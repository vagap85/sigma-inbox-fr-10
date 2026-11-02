import { Text } from "../../atoms";
import styles from "./PageTitle.module.css";
import { useNotificationSettings } from "../../../config/SettingsContext";
import { decode } from "../../../helpers/decoder";

export default function PageTitle() {
  const { pageTitle, pageSubtitle } = useNotificationSettings();

  return (
    <div className={styles.pageTitle}>
      <Text as="h1" size="xxl" weight="semibold">
        {pageTitle}
      </Text>
      <Text variant="secondary">
        {decode(pageSubtitle) ??
          "Объявления компании и&nbsp;сообщения о&nbsp;ваших задачах, отпусках и&nbsp;опросах"}
      </Text>
    </div>
  );
}
