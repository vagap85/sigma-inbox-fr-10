import { envelope } from "./envelope";
import { t, type Infer } from "./schema";

export const NotificationCountsSchema = t.object({
  total_count: t.number,
  unread_count: t.number,
});

export const NotificationCountsResponseSchema = envelope(
  NotificationCountsSchema,
);

export type NotificationCounts = Infer<typeof NotificationCountsSchema>;
export type NotificationCountsResponse = Infer<
  typeof NotificationCountsResponseSchema
>;
