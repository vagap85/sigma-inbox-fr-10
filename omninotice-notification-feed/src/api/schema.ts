export type Schema<T> = (
  value: unknown,
  path: string,
  issues: string[],
) => value is T;

export type Infer<S> = S extends (
  value: unknown,
  path: string,
  issues: string[],
) => value is infer T
  ? T
  : never;

type Shape<S extends Record<string, Schema<any>>> = {
  [K in keyof S]: Infer<S[K]>;
};

const describe = (v: unknown): string =>
  v === null ? "null" : Array.isArray(v) ? "array" : typeof v;

function primitive<T>(name: string, test: (v: unknown) => boolean): Schema<T> {
  return (value, path, issues): value is T => {
    if (test(value)) return true;
    issues.push(`${path}: ожидался ${name}, получено ${describe(value)}`);
    return false;
  };
}

export const t = {
  string: primitive<string>("string", (v) => typeof v === "string"),
  number: primitive<number>(
    "number",
    (v) => typeof v === "number" && !Number.isNaN(v),
  ),
  boolean: primitive<boolean>("boolean", (v) => typeof v === "boolean"),
  unknown: ((): boolean => true) as unknown as Schema<unknown>,

  object<S extends Record<string, Schema<any>>>(shape: S): Schema<Shape<S>> {
    return (value, path, issues): value is Shape<S> => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        issues.push(`${path}: ожидался object, получено ${describe(value)}`);
        return false;
      }
      const record = value as Record<string, unknown>;
      let ok = true;
      for (const key of Object.keys(shape)) {
        if (!shape[key](record[key], `${path}.${key}`, issues)) ok = false;
      }
      return ok;
    };
  },

  array<T>(item: Schema<T>): Schema<T[]> {
    return (value, path, issues): value is T[] => {
      if (!Array.isArray(value)) {
        issues.push(`${path}: ожидался array, получено ${describe(value)}`);
        return false;
      }
      let ok = true;
      value.forEach((el, i) => {
        if (!item(el, `${path}[${i}]`, issues)) ok = false;
      });
      return ok;
    };
  },

  optional<T>(item: Schema<T>): Schema<T | undefined> {
    return (value, path, issues): value is T | undefined =>
      value === undefined || item(value, path, issues);
  },

  nullable<T>(item: Schema<T>): Schema<T | null> {
    return (value, path, issues): value is T | null =>
      value === null || item(value, path, issues);
  },

  oneOf<V extends string | number | boolean>(...values: V[]): Schema<V> {
    return (value, path, issues): value is V => {
      if (values.includes(value as V)) return true;
      issues.push(
        `${path}: ожидалось одно из [${values.join(", ")}], получено ${JSON.stringify(value)}`,
      );
      return false;
    };
  },
};
