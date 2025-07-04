"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { createContext } from "@repo/utils/create-context";
import { requestAnimationExit, uuid } from "@repo/utils/functions";
import type { PropsOf } from "@repo/utils/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { type UixComponent, uix } from "../factory";

type ElementIds = Partial<{
  root: string;
  trigger: string;
  content: string;
  list: string;
  indicator: string;
}>;

type TabsProps = {
  /**
   * The activation mode of the tabs. Can be `manual` or `automatic` - `manual`: Tabs are activated when clicked or press `enter` key. - `automatic`: Tabs are activated when receiving focus.
   * @default "automatic"
   */
  activationMode?: TabsPrimitive.TabsProps["activationMode"];

  /**
   * The orientation of the tabs. Can be `horizontal` or `vertical` - `horizontal`: only left and right arrow key navigation will work. - `vertical`: only up and down arrow key navigation will work.
   * @default "horizontal"
   */
  orientation?: TabsPrimitive.TabsProps["orientation"];

  /**
   * Whether to enable lazy mounting.
   * @default false
   */
  lazyMount?: boolean;

  /**
   * Whether the keyboard navigation will loop from last tab to first, and vice versa.
   * @default true
   */
  loopFocus?: boolean;

  /**
   * Whether to unmount on exit.
   * @default false
   */
  unmountOnExit?: boolean;

  /**
   * The fitted of the component.
   */
  fitted?: boolean;

  /**
   * The selected tab id.
   */
  value?: string | null;

  /**
   * The id of the tabs.
   */
  id?: string;

  /**
   * Weather to force mount the content components.
   * @default false
   */
  forceMount?: boolean;

  /**
   * The initial value of the tabs when it is first rendered. Use when you do not need to control the state of the tabs.
   */
  defaultValue?: string;

  /**
   * The variant of the component.
   * @default line
   */
  variant?: "enclosed" | "line" | "outline" | "plain" | "subtle" | null;

  dir?: TabsPrimitive.TabsProps["dir"];

  /**
   * Callback to be called when the selected/active tab changes.
   */
  onValueChange?: TabsPrimitive.TabsProps["onValueChange"];
};

type TabsContextValue = Pick<TabsProps, "fitted" | "lazyMount" | "forceMount" | "loopFocus" | "unmountOnExit" | "value" | "variant"> & {
  ids: ElementIds;
  listEl: React.RefObject<HTMLButtonElement | null>;
  rootEl: React.RefObject<HTMLDivElement | null>;
  indicatorEl: React.RefObject<HTMLDivElement | null>;
};

/**-----------------------------------------------------------------------------
 * Tabs Context
 * -----------------------------------------------------------------------------
 * Provides state management for tabs components.
 *
 * -----------------------------------------------------------------------------*/
const tabsContext = createContext<TabsContextValue>({
  strict: true,
  hookName: "useTabsContext",
  providerName: "TabsProvider",
  errorMessage: "useTabsContext: `context` is undefined. Seems you forgot to wrap component within `<TabsProvider />`",
  defaultValue: undefined,
  name: "TabsContext",
});

const [TabsProvider, useTabsContext] = tabsContext;

const TABS_SCOPE = "tabs";

/**-----------------------------------------------------------------------------
 * Tabs Component
 * -----------------------------------------------------------------------------
 * Used to display content in a tabbed interface.
 *
 * -----------------------------------------------------------------------------*/
export const Tabs: UixComponent<"div", TabsProps> = (props) => {
  const {
    ref,
    asChild,
    className,
    children,
    defaultValue,
    fitted,
    lazyMount = false,
    loopFocus = true,
    forceMount = false,
    onValueChange: onValueChangeProp,
    unmountOnExit = false,
    value: valueProp,
    variant = "line",
    activationMode = "automatic",
    id: idProp,
    orientation = "horizontal",
    ...remainingProps
  } = props;

  const [id, setId] = useState(idProp);
  const [activeValue, setActiveValue] = useState(defaultValue);
  const [valueState, setValue] = useState(defaultValue);

  const listEl = useRef<HTMLButtonElement>(null);
  const rootEl = useRef<HTMLDivElement>(null);
  const activeContentEl = useRef<HTMLElement>(null);
  const indicatorEl = useRef<HTMLDivElement>(null);

  const onValueChange = useCallbackRef(onValueChangeProp);

  const rootRef = useMemo(() => composeRefs(rootEl, ref), [ref]);

  const ids = useMemo<ElementIds>(() => {
    if (id) {
      return {
        root: `${TABS_SCOPE}::${id}::root`,
        trigger: `${TABS_SCOPE}::${id}::trigger`,
        content: `${TABS_SCOPE}::${id}::content`,
        list: `${TABS_SCOPE}::${id}::list`,
        indicator: `${TABS_SCOPE}::${id}::indicator`,
      };
    }
    return {};
  }, [id]);

  const value = useMemo(() => valueProp ?? activeValue, [valueProp, activeValue]);

  const OnValueChangeCallback = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  const handleOnValueChange = useCallback(() => {
    if (valueState !== undefined) {
      if (valueProp === undefined) {
        setActiveValue(valueState);
      }
      onValueChange(valueState);
    }
    activeContentEl.current?.setAttribute("data-state", "active");
  }, [valueProp, onValueChange, valueState]);

  const tabsContextValue: TabsContextValue = {
    fitted,
    lazyMount,
    loopFocus,
    unmountOnExit,
    value,
    variant,
    ids,
    listEl,
    rootEl,
    indicatorEl,
    forceMount,
  };

  useEffect(() => {
    let timeoutAnimationExit: NodeJS.Timeout | undefined = undefined;

    if (valueState !== value) {
      activeContentEl.current = rootEl.current?.querySelector(`[data-scope=${TABS_SCOPE}][data-part=content][data-state=active]`) as HTMLElement | null;

      activeContentEl.current?.setAttribute("data-state", "inactive");

      timeoutAnimationExit = requestAnimationExit({
        node: activeContentEl.current,
        callbacks: [handleOnValueChange],
      });
    }
    return () => {
      clearTimeout(timeoutAnimationExit);
    };
  }, [valueState, handleOnValueChange, value]);

  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  return (
    <TabsPrimitive.Root
      asChild
      ref={rootRef}
      onValueChange={OnValueChangeCallback}
      value={value}
      activationMode={activationMode}
      orientation={orientation}
      {...remainingProps}
    >
      <uix.div asChild={asChild} className={cn("relative data-[orientation=horizontal]:block", className)} data-part="root" data-scope="tabs" id={ids.root}>
        <TabsProvider value={tabsContextValue}>{children}</TabsProvider>
      </uix.div>
    </TabsPrimitive.Root>
  );
};
Tabs.displayName = TabsPrimitive.Root.displayName;

/**-----------------------------------------------------------------------------
 * TabsList Component
 * -----------------------------------------------------------------------------
 * Wrapper for the Tab components.
 *
 * -----------------------------------------------------------------------------*/
export const TabsList: UixComponent<"div", Omit<PropsOf<typeof TabsPrimitive.List>, "loop">> = (props) => {
  const { asChild, children, className, ref, style, ...remainingProps } = props;

  const { ids, fitted, loopFocus, variant = "outline" } = useTabsContext();

  const updateIndicatorPosition = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }

    const trigger = node.querySelector("[data-scope=tabs][data-part=trigger][aria-selected=true]");
    const indicator = node.querySelector("[data-scope=tabs][data-part=indicator]");

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const parentRect = node.getBoundingClientRect();

    if (indicator) {
      indicator.setAttribute(
        "style",
        `--left: ${rect.left - parentRect.left}px; --top: ${rect.top - parentRect.top}px; --width: ${rect.width}px; --height: ${rect.height}px; --transition-property: left, right, top, bottom, width, height;`,
      );

      indicator.setAttribute("data-orientation", node.getAttribute("data-orientation") ?? "");
    }
  }, []);

  const tabsListRef = useMemo(() => composeRefs(updateIndicatorPosition, ref), [updateIndicatorPosition, ref]);

  return (
    <TabsPrimitive.List asChild ref={tabsListRef} style={{ outline: undefined }} loop={loopFocus} {...remainingProps}>
      <uix.div
        asChild={asChild}
        className={cn(
          "relative isolate flex min-h-10",
          variant === "enclosed" && "inline-flex rounded-md bg-[var(--color-subtle)] p-1",
          variant === "enclosed" && fitted && "flex",
          variant === "outline" && "shadow-[inset_0_-2px_0px_-1px_var(--color-border)]",
          className,
        )}
        data-part="list"
        data-scope="tabs"
        id={ids.list}
      >
        {children}
      </uix.div>
    </TabsPrimitive.List>
  );
};
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsIndicator = {
  /**
   * The variant of the component.
   * @default line
   */
  variant?: "enclosed" | "line" | "outline" | "plain" | "subtle" | null;
};

/**-----------------------------------------------------------------------------
 * TabsIndicator Component
 * -----------------------------------------------------------------------------
 * The indicator that moves to the active tab.
 *
 * -----------------------------------------------------------------------------*/
export const TabsIndicator: UixComponent<"div", TabsIndicator> = (props) => {
  const { ref, className, variant: variantProp, ...remainingProps } = props;

  const { fitted, variant: variantContext, indicatorEl } = useTabsContext();

  const indicatorRef = useMemo(() => composeRefs(indicatorEl, ref), [indicatorEl, ref]);

  const variant = useMemo(() => variantProp ?? variantContext, [variantProp, variantContext]);

  return (
    <uix.div
      ref={indicatorRef}
      data-part="indicator"
      data-scope="tabs"
      className={cn(
        "-z-10 absolute top-[var(--top)] left-[var(--left)] h-[var(--height)] w-[var(--width)] transition-[var(--transition-property)] duration-300 will-change-[var(--transition-property)]",
        fitted && "flex-1",
        variant === "enclosed" && "rounded-sm bg-[var(--color-bg)] shadow-xs",
        variant === "line" && "border-current border-b-2",
        variant === "outline" && "!border-b-0 border [background-color:var(--bg-currentcolor)] data-[orientation=horizontal]:rounded-t-sm",
        variant === "subtle" && "rounded-sm bg-[var(--color-subtle)]",
        className,
      )}
      {...remainingProps}
    />
  );
};
TabsIndicator.displayName = "TabsIndicator";

/**-----------------------------------------------------------------------------
 * TabsTrigger Component
 * -----------------------------------------------------------------------------
 * Element that triggers the tab.
 *
 * -----------------------------------------------------------------------------*/
export const TabsTrigger: UixComponent<"button", PropsOf<typeof TabsPrimitive.Trigger>> = (props) => {
  const { asChild, children, className, value, ...remainingProps } = props;

  const { ids, fitted } = useTabsContext();

  return (
    <TabsPrimitive.Trigger asChild value={value} {...remainingProps}>
      <uix.button
        asChild={asChild}
        className={cn("opacity-70 [outline:0] aria-[selected=true]:relative aria-[selected=true]:opacity-100", fitted && "flex-1", className)}
        data-part="trigger"
        data-scope="tabs"
        data-value={value}
        id={ids.trigger}
      >
        {children}
      </uix.button>
    </TabsPrimitive.Trigger>
  );
};
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

type TabsContentProps = Pick<TabsProps, "forceMount"> & {
  /**
   * The value of the tab.
   */
  value: string;
};
/**-----------------------------------------------------------------------------
 * TabsContent Component
 * -----------------------------------------------------------------------------
 * Element that contains the content associated with a tab.
 *
 * -----------------------------------------------------------------------------*/
export const TabsContent: UixComponent<"div", TabsContentProps> = (props) => {
  const { asChild, children, className, value, forceMount: forceMountProp, ...remainingProps } = props;

  const { ids, lazyMount, value: activeValue, unmountOnExit, forceMount: forceMountContext } = useTabsContext();

  const isActive = value === activeValue;

  const [isMounted, setMounted] = useState(false);

  const initialRender = useRef(true);

  const forceMount = useMemo(() => {
    if (forceMountProp) {
      return forceMountProp;
    }
    if (forceMountContext) {
      return forceMountContext;
    }
    return isMounted ? true : undefined;
  }, [forceMountContext, forceMountProp, isMounted]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (unmountOnExit && isMounted && !isActive) {
      setMounted(false);
    }

    if (lazyMount && !isMounted && isActive) {
      setMounted(true);
    }
  }, [isActive, isMounted, lazyMount, unmountOnExit]);

  return (
    <TabsPrimitive.Content asChild forceMount={forceMount} value={value} {...remainingProps}>
      <uix.div
        asChild={asChild}
        className={cn("data-[state=active]:animate-in data-[state=inactive]:animate-out", className)}
        data-part="content"
        data-scope="tabs"
        data-value={value}
        id={ids.content}
        role="tabpanel"
        hidden={!isActive}
      >
        {children}
      </uix.div>
    </TabsPrimitive.Content>
  );
};
TabsContent.displayName = TabsPrimitive.Content.displayName;
