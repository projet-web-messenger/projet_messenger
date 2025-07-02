import { cn } from "@repo/utils/classes";
import { type UixComponent, uix } from "../factory";

export type HighlightChunk = {
  /**
   * Whether the text is a match
   */
  match: boolean;
  /**
   * The text to highlight
   */
  text: string;
};

export type HighlightSpan = {
  /**
   * The start index of the span
   */
  start: number;
  /**
   * The end index of the span
   */
  end: number;
  /**
   * Whether the span is a match
   */
  match?: boolean;
};
type HighlightProps = {
  /**
   * Whether to ignore case while matching
   */
  ignoreCase?: boolean;
  /**
   * Whether to match multiple instances of the query
   */
  matchAll?: boolean;
  /**
   * The query to highlight in the text
   */
  query: string | string[];
  /**
   * The text to highlight
   */
  text: string;
};

const escapeRegexp = (term: string): string => term.replace(/[|\\{}()[\]^$+*?.-]/g, (char: string) => `\\${char}`);

const buildRegex = (queryProp: string[], flags: string): RegExp => {
  const query = queryProp.filter(Boolean).map((text) => escapeRegexp(text));
  return new RegExp(`(${query.join("|")})`, flags);
};

const getRegexFlags = (ignoreCase: boolean | undefined, matchAll = true): string => `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`;

export const highlight = (props: HighlightProps): HighlightChunk[] => {
  const { text, query, ignoreCase, matchAll } = props;

  if (query.length === 0) {
    return [{ text, match: false }];
  }

  const flags = getRegexFlags(ignoreCase);
  const regex = buildRegex(Array.isArray(query) ? query : [query], flags);

  // Get all matches
  const spans = [...text.matchAll(regex)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
  }));

  // const effectiveSpans = matchAll ? spans : spans.slice(0, 1);

  return normalizeSpan(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match,
  }));
};

export const normalizeSpan = (spans: HighlightSpan[], len: number) => {
  const result: HighlightSpan[] = [];
  const append = (start: number, end: number, match: boolean) => {
    if (end - start > 0) {
      result.push({ start, end, match });
    }
  };

  if (spans.length === 0) {
    append(0, len, false);
  } else {
    let lastIndex = 0;
    for (const chunk of spans) {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    }

    append(lastIndex, len, false);
  }

  return result;
};

/**-----------------------------------------------------------------------------
 * Highlight Component
 * -----------------------------------------------------------------------------
 * Used to highlight substrings of a text.
 *
 * -----------------------------------------------------------------------------*/
export const Highlight: UixComponent<"mark", Omit<HighlightProps, "text">> = (props) => {
  const { children, query, ignoreCase, matchAll: matchAllProp, className, ...remainingProps } = props;

  const matchAll = typeof matchAllProp === "boolean" ? matchAllProp : Array.isArray(query);

  if (typeof children !== "string") {
    throw new Error("Highlight children must be a string");
  }

  if (!matchAll && Array.isArray(query)) {
    throw new Error("matchAll must be true when using multiple queries");
  }
  const chunks = highlight({ ignoreCase, matchAll, query, text: children as string });

  return (
    <>
      {chunks.map((chunk, index) => {
        const key = index;
        if (!chunk.match) {
          return chunk.text;
        }
        return (
          <uix.mark key={key} className={cn("whitespace-nowrap bg-[unset] text-[var(--bg-contrast,currentColor)]", className)} {...remainingProps}>
            {chunk.text}
          </uix.mark>
        );
      })}
    </>
  );
};
Highlight.displayName = "Highlight";
