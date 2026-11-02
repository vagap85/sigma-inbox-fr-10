import type { ReactNode } from "react";
import type { SlotComponentProps } from "@core/hive";
import { NotificationsSection } from "../organisms";
import { Container } from "../atoms";
import { PageTitle, Tab } from "../molecules";
import styles from "./NotificationFeedPage.module.css";
import NotificationsRoot from "../organisms/NotificationsRoot/NotificationsRoot";

export interface NotificationFeedPageProps extends Partial<SlotComponentProps> {
  /** Optional custom content rendered before the default page title. */
  header?: ReactNode;
}

export default function NotificationFeedPage({
  header,
  slot,
  variant,
}: NotificationFeedPageProps) {
  return (
    <div className={styles.page} data-slot={slot} data-variant={variant}>
      {header}
      <Container>
        <PageTitle />
        <NotificationsRoot>
          <Tab />
          <NotificationsSection />
        </NotificationsRoot>
      </Container>
    </div>
  );
}
