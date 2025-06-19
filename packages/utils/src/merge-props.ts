import { cn } from "./classes";
import { callAll } from "./functions";
import { isString } from "./guard";
import type { Props, TupleTypes, UnionToIntersection } from "./types";

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;

const serialize = (style: string): Record<string, string> => {
  const res: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while (true) {
    match = CSS_REGEX.exec(style);
    if (!match) {
      break;
    }
    if (match[1] && match[2]) {
      res[match[1]] = match[2];
    }
  }
  return res;
};

const css = (a: Record<string, string> | string | undefined, b: Record<string, string> | string | undefined): Record<string, string> | string => {
  let serializedA = a;
  let serializedB = b;

  if (isString(a)) {
    if (isString(b)) {
      return `${a};${b}`;
    }
    serializedA = serialize(a);
  } else if (isString(b)) {
    serializedB = serialize(b);
  }
  return Object.assign({}, serializedA ?? {}, serializedB ?? {});
};

export function mergeProps<T extends Props>(...args: T[]): UnionToIntersection<TupleTypes<T[]>> {
  const result: Props = {};

  for (const props of args) {
    for (const key in result) {
      if (key.startsWith("on") && typeof result[key] === "function" && typeof props[key] === "function") {
        result[key] = callAll(props[key], result[key]);
        continue;
      }

      if (key === "className" || key === "class") {
        result[key] = cn(result[key], props[key]);
        continue;
      }

      if (key === "style") {
        result[key] = css(result[key], props[key]);
        continue;
      }

      result[key] = props[key] !== undefined ? props[key] : result[key];
    }

    // Add props from b that are not in a
    for (const key in props) {
      if (result[key] === undefined) {
        result[key] = props[key];
      }
    }
  }

  return result as UnionToIntersection<TupleTypes<T[]>>;
}
