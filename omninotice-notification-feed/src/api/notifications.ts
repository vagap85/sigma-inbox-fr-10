import { envelope, type ApiInfo } from "./envelope";
import { t, type Infer } from "./schema";

export const maybeString = t.optional(t.nullable(t.string));

export const PictureSchema = t.object({
  main: maybeString,
  preview: maybeString,
  cover: maybeString,
  icon: maybeString,
  emoji: maybeString,
});

export const ActionSchema = t.object({
  url: t.string,
  title: t.string,
  type: maybeString,
});

/** Поля chit, общие для списка и деталей */
export const chitShape = {
  status: t.string,
  created_date: t.string,
  modified_date: t.string,
  message_type: t.string,
  title: t.string,
  description: maybeString,
  picture: t.optional(t.nullable(PictureSchema)),
  message_id: t.string,
};

export const NotificationSchema = t.object({
  status: t.string,
  created_date: t.string,
  modified_date: t.string,
  chit: t.object({
    ...chitShape,
    action: t.optional(t.nullable(ActionSchema)),
  }),
  is_read: t.boolean,
});

export const NotificationsResponseSchema = envelope(NotificationSchema);

export type Notification = Infer<typeof NotificationSchema>;
export type NotificationsResponse = Infer<typeof NotificationsResponseSchema>;
export type NotificationsInfo = ApiInfo;
