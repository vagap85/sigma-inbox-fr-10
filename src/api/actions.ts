export interface MarkNotificationReadAction {
  type: "mark-read";
  id: string;
}

export type NotificationAction = MarkNotificationReadAction;
