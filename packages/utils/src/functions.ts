import { isFunction } from "./guard";
import type { MaybeFunction, Nullable, VoidFunction } from "./types";

/**
 * Runs a value if it's a function, otherwise returns the value itself.
 * Handles undefined/null by returning `undefined`.
 *
 * @param v - Value or function to evaluate
 * @param a - Arguments to pass if v is a function
 * @returns Result of function call or the value itself (non-null)
 */
export const runIfFn = <T>(
  v: T | undefined,
  ...a: T extends VoidFunction ? Parameters<T> : never
): T extends VoidFunction ? NonNullable<ReturnType<T>> : NonNullable<T> => {
  const res = typeof v === "function" ? v(...a) : v;
  return res ?? undefined;
};

/**
 * Casts a value to a specified type without runtime checks.
 * Use with caution as it bypasses TypeScript's type safety.
 *
 * @param v - Value to cast
 * @returns The same value with the specified type
 */
export const cast = <T>(v: unknown): T => v as T;

/**
 * Executes a function and returns its result
 * Simple wrapper that can be used with higher-order functions
 *
 * @param v - Function to execute
 * @returns Result of the function call
 */
export const identity = (v: VoidFunction) => v();

/**
 * No-operation function that does nothing
 * Useful as a default callback or placeholder
 */
export const noop = () => {};

/**
 * Creates a function that calls all provided functions with the same arguments.
 * Skips null or undefined functions in the array.
 *
 * @param fns - Array of functions to call
 * @returns Function that calls all provided functions
 */
export const callAll =
  <T extends VoidFunction>(...fns: Nullable<T>[]) =>
  (...a: Parameters<T>) => {
    for (const fn of fns) {
      fn?.(...a);
    }
  };

/**
 * Generates unique incremental IDs with base36 encoding
 * IIFE pattern ensures counter is initialized only once.
 *
 * @returns Function that generates a new unique ID on each call
 */
export const uuid = /*#__PURE__*/ (() => {
  let id = 0;
  return () => {
    id++;
    return id.toString(36);
  };
})();

/**
 * Pattern matching utility similar to switch/case but with objects.
 * Throws an error if no matching key is found.
 *
 * @param key - The key to match against the record
 * @param record - Object with keys matching possible values
 * @param args - Arguments to pass if the matched value is a function
 * @returns The matched value or result of function execution
 */
export function match<V extends string | number = string, R = unknown>(key: V, record: Record<V, MaybeFunction<R>>, ...args: unknown[]): R {
  if (key in record) {
    const fn = record[key];
    return (isFunction(fn) ? fn(...args) : fn) as R;
  }

  const error = new Error(`No matching key: ${JSON.stringify(key)} in ${JSON.stringify(Object.keys(record))}`);
  Error.captureStackTrace?.(error, match);

  throw error;
}

/**
 * Executes a function safely inside a try/catch block.
 * Falls back to alternative function if an error occurs.
 *
 * @param fn - Function to execute
 * @param fallback - Function to call if fn throws an error
 * @returns Result of fn or fallback
 */
export const tryCatch = <R>(fn: () => R, fallback: () => R) => {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      Error.captureStackTrace?.(error, tryCatch);
    }
    return fallback?.();
  }
};

/**
 * Limits a function's execution frequency.
 * Executes immediately if enough time has passed since last call.
 * Otherwise delays execution until the wait time has elapsed.
 *
 * @param fn - Function to throttle
 * @param wait - Minimum time between executions in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends VoidFunction>(fn: T, wait = 0): T {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      fn(...args);
      lastCall = now;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        fn(...args);
        lastCall = Date.now();
        timeout = null;
      }, wait - timeSinceLastCall);
    }
  }) as T;
}

/**
 * Delays function execution until after a timeout.
 * Resets the timeout if called again before execution.
 *
 * @param fn - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends VoidFunction>(fn: T, wait = 0): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  }) as T;
}

// Helper function to add a delay before executing a callback
export function requestAnimationExit(details: {
  node?: HTMLElement | null;
  callbacks: (VoidFunction | undefined)[];
  delayPercent?: number;
}): NodeJS.Timeout | undefined {
  let timeout: NodeJS.Timeout | undefined = undefined;

  const { node, callbacks, delayPercent = 0.9 } = details;
  if (node) {
    const contentAnimationDuration = window.getComputedStyle(node).animationDuration;

    if (contentAnimationDuration) {
      const duration = Number.parseFloat(contentAnimationDuration.replace("s", "")) * 1000;
      timeout = setTimeout(() => {
        callAll(...callbacks)();
      }, duration * delayPercent);
    }
  }

  return timeout;
}

// Helper function to check if element or its children are hovered
export function isElementOrChildrenHovered(element: HTMLElement | null, x: number, y: number) {
  if (!element) {
    return false;
  }

  // Check the element itself
  const rect = element.getBoundingClientRect();

  if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
    return true;
  }

  // Check all children recursively
  for (const child of Array.from(element.children)) {
    if (child instanceof HTMLElement) {
      const childRect = child.getBoundingClientRect();
      const isValidCheck = !(childRect.x > rect.left && childRect.x < rect.right && childRect.y > rect.top && childRect.y < rect.bottom);
      if (isValidCheck && isElementOrChildrenHovered(child, x, y)) {
        return true;
      }
    }
  }

  return false;
}
