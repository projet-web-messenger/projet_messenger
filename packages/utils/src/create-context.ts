import { createElement, createContext as createReactContext, useEffect, useRef, useState } from "react";
import { useCallback, useInsertionEffect } from "react";
import { uuid } from "./functions";
import { isEqual } from "./guard";

interface CreateContextOptions<T> {
  strict?: boolean;
  hookName?: string;
  providerName?: string;
  errorMessage?: string;
  name?: string;
  defaultValue?: T;
}

type Listener<T> = (value: T) => void;
type Selector<T, S> = (state: T) => S;
type Unsubscribe = () => void;

class Store<T> {
  private value: T | undefined;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialValue?: T) {
    this.value = initialValue;
  }

  getValue(): T | undefined {
    return this.value;
  }

  setValue(newValue: T): void {
    this.value = newValue;
    this.notify();
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.value as T);
    }
  }
}

type CreateContextReturn<T> = [React.Provider<T>, <S = T>(selector?: (state: T) => S, deps?: React.DependencyList) => S, React.Context<T>];

function useCallbackRef<Args extends unknown[], Return>(callback: ((...args: Args) => Return) | undefined, deps: React.DependencyList = []) {
  const callbackRef = useRef(callback);

  useInsertionEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Args) => callbackRef.current?.(...args), deps);
}

function getErrorMessage(hook: string, provider: string) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`;
}

export function createContext<T>(options: CreateContextOptions<T> = {}) {
  const { name, strict = true, hookName = "useContext", providerName = "Provider", errorMessage, defaultValue } = options;

  // Map to store unique store instances per provider
  const storeMap = new Map<string, Store<T>>();

  // Create a React context just to detect provider presence
  const Context = createReactContext<T | undefined>(undefined);
  Context.displayName = name;

  // Custom provider that updates both React context and our store
  function Provider({ children, value }: { children: React.ReactNode; value: T }) {
    const [_, forceUpdate] = useState(false);

    const clearTimeoutRef = useRef<(() => void) | null>(null);
    const isMounted = useRef(false);
    const id = useRef<string>(uuid());

    // Create store on first render if it doesn't exist
    if (!storeMap.has(id.current)) {
      storeMap.set(id.current, new Store<T>(defaultValue));
    }

    // First render: set initial value and mark as mounted
    useEffect(() => {
      // Get this provider's store and update it
      const providerStore = storeMap.get(id.current);
      providerStore?.setValue(value);

      // Force a re-render after mounted to ensure all subscribers get latest value
      if (!isMounted.current) {
        isMounted.current = true;
        forceUpdate((prev) => !prev);
      }
    }, [value]);

    useEffect(() => {
      // Cleanup function to remove the store when the component unmounts
      clearTimeoutRef.current?.();
      // Return a single cleanup function
      return () => {
        // Use setTimeout to delay the cleanup in development mode
        const timeoutId = setTimeout(() => {
          // Only delete if not re-mounted
          storeMap.delete(id.current);
        }, 50);

        // Store the cleanup function for clearing the timeout if needed
        clearTimeoutRef.current = () => clearTimeout(timeoutId);
      };
    }, []);

    // Only render children after the initial store setup is complete
    return createElement(Context.Provider, { value: { ...value, _contextStoreId: id.current } }, isMounted.current ? children : null);
  }

  // Selector hook that only re-renders when selected value changes
  function useContextSelector<S = T>(selector?: Selector<T, S>, deps: React.DependencyList = []): S {
    // Get wrapped context value
    const contextWrapper = "_currentValue" in Context ? (Context._currentValue as Record<string, string> | undefined) : undefined;

    // Extract store ID and actual data
    const providerId = contextWrapper?._contextStoreId;

    // Get the appropriate store using the provider ID
    const store = providerId ? storeMap.get(providerId) : undefined;

    if (store && !store.getValue() && strict) {
      const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName));
      error.name = "ContextError";
      Error.captureStackTrace?.(error, useContextSelector);
      throw error;
    }

    // If no selector is provided, use an identity function to return the whole context
    const actualSelector = selector || ((state: T) => state as unknown as S);

    // Stabilize the selector
    const stableSelector = useCallbackRef(actualSelector, deps);

    // State to trigger re-renders
    const [selected, setSelected] = useState<S>(() => {
      const value = store?.getValue() || {};
      return stableSelector(value as T) as S;
    });

    // Previous value ref for comparison
    const prevSelectedRef = useRef<S>(selected);

    useEffect(() => {
      if (!store) {
        return;
      }

      // Function to check for changes and update if needed
      const checkForUpdates = () => {
        const newSelected = stableSelector(store.getValue() as T);

        if (!isEqual(prevSelectedRef.current, newSelected)) {
          if (newSelected !== undefined) {
            prevSelectedRef.current = newSelected;
            setSelected(newSelected);
          }
        }
      };

      // Initial check
      checkForUpdates();

      // Subscribe to store updates
      const unsubscribe = store.subscribe(checkForUpdates);

      return () => {
        unsubscribe();
      };
    }, [store, stableSelector]);

    return selected;
  }

  return [Provider, useContextSelector, Context] as CreateContextReturn<T>;
}
