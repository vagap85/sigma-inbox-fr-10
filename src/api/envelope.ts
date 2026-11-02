import { t, type Infer, type Schema } from "./schema";

/** Общая обёртка ответа бэка: { detail, data, info } */
const DetailSchema = t.object({
  code: t.string,
  message: t.string,
});

const InfoSchema = t.object({
  api_version: t.string,
  count: t.number,
  total: t.number,
  page: t.number,
  page_size: t.number,
});

export type ApiInfo = Infer<typeof InfoSchema>;

export function envelope<T>(item: Schema<T>) {
  return t.object({
    detail: t.optional(t.nullable(DetailSchema)),
    data: t.array(item),
    info: InfoSchema,
  });
}
