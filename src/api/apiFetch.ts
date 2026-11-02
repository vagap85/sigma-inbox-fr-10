import type { Schema } from "./schema";

const DEFAULT_TIMEOUT_MS = 15_000;

export type ApiErrorKind =
  | "http" // ответ с кодом не 2xx
  | "network" // нет соединения, CORS и т.п.
  | "timeout" // сработал таймаут
  | "aborted" // отменено внешним signal
  | "parse" // ответ не JSON
  | "validation"; // JSON не соответствует схеме

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  body?: unknown;
  issues?: string[];
  cause?: unknown;

  constructor(
    kind: ApiErrorKind,
    message: string,
    extra: {
      status?: number;
      body?: unknown;
      issues?: string[];
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = extra.status;
    this.body = extra.body;
    this.issues = extra.issues;
    this.cause = extra.cause;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export interface ApiFetchOptions extends Omit<
  RequestInit,
  "body" | "headers" | "signal"
> {
  token: string;
  projectId: string;
  /** Объекты и массивы сериализуются в JSON автоматически */
  body?: unknown;
  headers?: HeadersInit;
  /** По умолчанию 15000 мс */
  timeoutMs?: number;
  /** Внешняя отмена (например, при размонтировании компонента) */
  signal?: AbortSignal;
}

function extractMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null) {
    const r = data as Record<string, unknown>;
    if (typeof r.message === 'string') return r.message;
    if (typeof r.error === 'string') return r.error;
    if (typeof r.detail === 'object' && r.detail !== null) {
      const d = r.detail as Record<string, unknown>;
      if (typeof d.message === 'string') return d.message;
    }
  }
  return undefined;
}

function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

export async function apiFetch<T>(
  url: string,
  schema: Schema<T>,
  options: ApiFetchOptions,
): Promise<T> {
  const {
    token,
    projectId,
    body,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    ...init
  } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  finalHeaders.set("Authorization", `Bearer ${token}`);
  finalHeaders.set("Project-ID", projectId);

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (isRawBody(body)) {
      payload = body;
    } else {
      payload = JSON.stringify(body);
      if (!finalHeaders.has("Content-Type")) {
        finalHeaders.set("Content-Type", "application/json");
      }
    }
  }

  // Таймаут + внешняя отмена через один AbortController
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  let res: Response;
  let text: string;
  try {
    res = await fetch(url, {
      ...init,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
    });
    // чтение тела тоже под таймаутом
    text = await res.text();
  } catch (e) {
    if (timedOut) {
      throw new ApiError(
        "timeout",
        `Превышено время ожидания (${timeoutMs} мс)`,
        {
          cause: e,
        },
      );
    }
    if (controller.signal.aborted) {
      throw new ApiError("aborted", "Запрос отменён", { cause: e });
    }
    throw new ApiError("network", "Не удалось связаться с сервером", {
      cause: e,
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }

  let data: unknown;
  let parseFailed = false;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      parseFailed = true;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      "http",
      extractMessage(data) ?? `${res.status} ${res.statusText}`.trim(),
      { status: res.status, body: parseFailed ? text : data },
    );
  }

  if (parseFailed) {
    throw new ApiError("parse", "Сервер вернул не JSON", {
      status: res.status,
      body: text,
    });
  }

  const issues: string[] = [];
  if (!schema(data, "$", issues)) {
    throw new ApiError(
      "validation",
      `Ответ не соответствует схеме:\n${issues.join("\n")}`,
      {
        status: res.status,
        body: data,
        issues,
      },
    );
  }

  return data;
}
