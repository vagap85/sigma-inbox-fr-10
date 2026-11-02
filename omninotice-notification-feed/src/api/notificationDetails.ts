import { envelope } from "./envelope";
import { ActionSchema, chitShape, maybeString } from "./notifications";
import { t, type Infer } from "./schema";

export const NotificationDetailsItemSchema = t.object({
  status: t.string,
  created_date: t.string,
  modified_date: t.string,
  chit: t.object({
    ...chitShape,
    text: maybeString,
    action: t.optional(t.nullable(ActionSchema)),
    extra: t.optional(t.nullable(t.unknown)),
  }),
  is_read: t.boolean,
});

export const NotificationDetailsResponseSchema = envelope(
  NotificationDetailsItemSchema,
);

export type NotificationDetailsItem = Infer<
  typeof NotificationDetailsItemSchema
>;
export type NotificationDetailsResponse = Infer<
  typeof NotificationDetailsResponseSchema
>;
