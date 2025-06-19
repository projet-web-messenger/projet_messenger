"use client";

import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { createContext } from "@repo/utils/create-context";
import { requestAnimationExit, uuid } from "@repo/utils/functions";
import { handleScroll } from "@repo/utils/handleScroll";
import { hideOthers } from "aria-hidden";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { useDisclosure } from "../../hooks/use-disclosure";
import { type UixComponent, uix } from "../factory";

type ElementIds = Partial<{ uid: string; trigger: string; content: string; value: string; arrow: string }>;

type PositioningOptions = Partial<{
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
  offset: number;
}>;

type MenuProps = {
  /**
   * Whether to close the menu when an option is selected.
   * @default true
   */
  closeOnSelect?: boolean;

  /**
   * Whether to enable lazy mounting.
   * @default false
   */
  lazyMount?: boolean;

  /**
   * Whether to loop the keyboard navigation.
   * @default true
   */
  loopFocus?: boolean;

  /**
   * Whether the pressing printable characters should trigger typeahead navigation.
   * @default true
   */
  typeahead?: boolean;

  /**
   * Whether to unmount on exit.
   * @default false
   */
  unmountOnExit?: boolean;

  /**
   * Whether the menu should be modal. When set to `true`: - interaction with outside elements will be disabled - only menu content will be visible to screen readers - scrolling is blocked - focus is trapped within the menu.
   * @default false
   */
  modal?: boolean;

  /**
   * Whether the menu is portalled. This will proxy the tabbing behavior regardless of the DOM position of the menu content.
   * @default false
   */
  portalled?: boolean;

  /**
   * Whether to restore focus to the element that had focus before the menu was opened.
   */
  restoreFocus?: boolean;

  /**
   * Specify a container element to portal the content into.
   */
  container?: MenuPrimitive.DropdownMenuPortalProps["container"];

  /**
   * The accessibility label for the menu.
   */
  "aria-label"?: string;

  /**
   * The initial open state of the menu when it is first rendered. Use when you do not need to control its open state.
   */
  defaultOpen?: boolean;

  /**
   * The value of the highlighted menu item.
   */
  highlightedValue?: string;

  /**
   * The `id` of the menu.
   */
  id?: string;

  /**
   * Function called when the animation ends in the closed state.
   */
  onExitComplete?: () => void;

  /**
   * Function called when the highlighted menu item changes.
   */
  onHighlightChange?: (highlightValue: string) => void;

  /**
   * Function called when the escape key is pressed.
   */
  onEscapeKeyDown?: MenuPrimitive.DropdownMenuContentProps["onEscapeKeyDown"];

  /**
   * Function called when the focus is moved outside the component.
   */
  onFocusOutside?: MenuPrimitive.DropdownMenuContentProps["onFocusOutside"];

  /**
   * Function called when an interaction happens outside the component.
   */
  onInteractOutside?: MenuPrimitive.DropdownMenuContentProps["onInteractOutside"];

  /**
   * Function called when the pointer is pressed down outside the component.
   */
  onPointerDownOutside?: MenuPrimitive.DropdownMenuContentProps["onPointerDownOutside"];

  /**
   * Function called when a menu item is selected..
   */
  onSelect?: MenuPrimitive.DropdownMenuItemProps["onSelect"];

  /**
   * Function called when the menu opens or closes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the menu is open.
   */
  open?: boolean;

  /**
   * The options used to dynamically position the menu.
   */
  positioning?: PositioningOptions;

  children?: React.ReactNode;
};

type MenuContextValue = Pick<
  MenuProps,
  | "closeOnSelect"
  | "portalled"
  | "aria-label"
  | "positioning"
  | "onSelect"
  | "loopFocus"
  | "container"
  | "typeahead"
  | "onFocusOutside"
  | "highlightedValue"
  | "onHighlightChange"
  | "onInteractOutside"
  | "onPointerDownOutside"
  | "onEscapeKeyDown"
> & {
  ids: ElementIds;
  forceMount: true | undefined;
  isFirstOpen: boolean;
  triggerEl: React.RefObject<HTMLButtonElement | null>;
  contentEl: React.RefObject<HTMLDivElement | null>;
  valueEl: React.RefObject<HTMLDivElement | null>;
};

/**-----------------------------------------------------------------------------
 * Menu Context
 * -----------------------------------------------------------------------------
 * Provides state management for menu components.
 *
 * -----------------------------------------------------------------------------*/
const menuContext = createContext<MenuContextValue>({
  strict: true,
  hookName: "useMenuContext",
  providerName: "MenuProvider",
  errorMessage: "useMenuContext: `context` is undefined. Seems you forgot to wrap component within `<MenuProvider />`",
  defaultValue: undefined,
  name: "MenuContext",
});

const [MenuProvider, useMenuContext] = menuContext;

const MENU_SCOPE = "menu";

/**-----------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------
 *
 * -----------------------------------------------------------------------------*/
export const Menu = (props: MenuProps) => {
  const {
    closeOnSelect = true,
    lazyMount = false,
    unmountOnExit = false,
    loopFocus = true,
    typeahead = true,
    modal = false,
    portalled = false,
    container,
    restoreFocus,
    "aria-label": ariaLabel,
    defaultOpen,
    highlightedValue,
    id: idProp,
    onExitComplete,
    onHighlightChange: onHighlightChangeProp,
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    onSelect,
    onOpenChange: onOpenChangeProp,
    open,
    positioning,
    children,
  } = props;

  const [id, setId] = useState<string | undefined>(idProp);

  const { isOpen, onClose, onOpen } = useDisclosure({ defaultOpen, isOpen: open });

  const modalRef = useRef(isOpen ? modal : false);

  const isFirstOpen = useRef(!isOpen);

  const highlightedValueRef = useRef(highlightedValue);

  const triggerEl = useRef<HTMLButtonElement | null>(null);
  const contentEl = useRef<HTMLDivElement | null>(null);
  const valueEl = useRef<HTMLDivElement | null>(null);

  const onOpenChange = useCallbackRef(onOpenChangeProp);
  const onHighlightChange = useCallbackRef(onHighlightChangeProp);

  const ids = useMemo<ElementIds>(() => {
    if (id) {
      return {
        uid: `«${id}»`,
        trigger: `${MENU_SCOPE}«${id}»trigger`,
        content: `${MENU_SCOPE}«${id}»content`,
        arrow: `${MENU_SCOPE}«${id}»arrow`,
        value: `${MENU_SCOPE}«${id}»value`,
        closeTrigger: `${MENU_SCOPE}«${id}»close`,
      };
    }
    return {};
  }, [id]);

  const forceMount = useMemo<true | undefined>(() => {
    return unmountOnExit ? undefined : lazyMount ? true : undefined;
  }, [unmountOnExit, lazyMount]);

  const handleOpenMenu = useCallback(() => {
    if (isFirstOpen.current) {
      isFirstOpen.current = false;
    }

    modalRef.current = modal;
    onOpen();
    onOpenChange(true);
  }, [onOpen, onOpenChange, modal]);

  const handleCloseMenu = useCallback(() => {
    modalRef.current = false;

    onClose();
    onOpenChange(false);
  }, [onClose, onOpenChange]);

  const handleOnOpenLazyMount = useCallback(() => {
    if (forceMount) {
      contentEl.current?.removeAttribute("hidden");
    }
  }, [forceMount]);

  const handleOnCloseLazyMount = useCallback(() => {
    if (forceMount) {
      contentEl.current?.setAttribute("hidden", "");
    }
  }, [forceMount]);

  const handleFinalElementFocus = useCallback(() => {
    let element: HTMLElement | null = null;
    if (restoreFocus) {
      const restoreFocusTarget = document.querySelector(`[data-menu-restore-focus-target="${ids.uid}"]`) as HTMLElement | null;
      if (restoreFocusTarget) {
        restoreFocusTarget.removeAttribute("data-menu-restore-focus-target");
        element = restoreFocusTarget;
      }
    }

    if (!element) {
      element = triggerEl.current;
    }
    element?.focus({ preventScroll: true });
  }, [ids.uid, restoreFocus]);

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        handleOpenMenu();
      } else {
        contentEl.current?.setAttribute("data-state", "closed");
        requestAnimationExit({
          node: contentEl.current,
          callbacks: [handleCloseMenu, onExitComplete],
        });
      }
    },
    [handleOpenMenu, handleCloseMenu, onExitComplete],
  );

  const handleOnHighlightChange = useCallback<typeof onHighlightChange>(
    (highlightValue) => {
      highlightedValueRef.current = highlightValue;

      onHighlightChange(highlightValue);
    },
    [onHighlightChange],
  );

  const contextValue: MenuContextValue = {
    ids,
    forceMount,
    closeOnSelect,
    onEscapeKeyDown,
    "aria-label": ariaLabel,
    onHighlightChange: handleOnHighlightChange,
    onSelect,
    loopFocus,
    typeahead,
    highlightedValue: highlightedValueRef.current,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    portalled,
    positioning,
    triggerEl,
    contentEl,
    valueEl,
    isFirstOpen: isFirstOpen.current,
    container,
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (restoreFocus && ids.uid) {
          document.activeElement?.setAttribute("data-menu-restore-focus-target", ids.uid);
        }

        if (isOpen) {
          handleOnOpenLazyMount();
        } else {
          handleOnCloseLazyMount();
          handleFinalElementFocus();
        }
      }
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen, ids.uid, restoreFocus, handleOnOpenLazyMount, handleOnCloseLazyMount, handleFinalElementFocus]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (isOpen) {
          if (triggerEl.current && contentEl.current) {
            triggerEl.current.setAttribute("aria-controls", contentEl.current.id);
          }
        } else {
          triggerEl.current?.removeAttribute("aria-controls");
        }
      }
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    // Only attach the wheel event handler when the menu is open and modal is true
    if (!isOpen || !modalRef.current) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (!contentEl.current) {
        return;
      }

      // Check if the event target is contentEl or one of its descendants
      const isInsideContent = contentEl.current.contains(event.target as Node);

      if (!isInsideContent) {
        // Prevent scrolling entirely for elements outside menu content
        event.preventDefault();
        return;
      }

      // For elements inside menu content, only prevent overscroll
      const shouldCancelScroll = handleScroll(
        "v", // vertical axis
        contentEl.current, // target element
        event, // the wheel event
        event.deltaY, // scroll delta
        true, // prevent overscroll
      );

      if (shouldCancelScroll) {
        event.preventDefault();
      }
    };

    // Attach wheel handler to document to catch all wheel events
    const timeout = setTimeout(() => {
      document.addEventListener("wheel", handleWheel, { passive: false });
    }, 1);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen]);

  useEffect(() => {
    // Skip if not in modal mode
    if (!modalRef.current) {
      return;
    }

    // Store original pointer-events value to restore later
    const prevPointerEvents = document.body.style.pointerEvents;

    // Add timeout to give DOM time to update
    const timeout = setTimeout(() => {
      if (isOpen) {
        // When menu opens, disable pointer events on body
        document.body.style.setProperty("pointer-events", "none");

        // Apply aria-hiding to all elements except menu content
        if (contentEl.current) {
          hideOthers(contentEl.current);
        }
      }
    }, 1);

    // Cleanup function runs when effect dependencies change or component unmounts
    return () => {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeout);

      // Restore original pointer-events setting
      if (prevPointerEvents) {
        document.body.style.setProperty("pointer-events", prevPointerEvents);
      } else {
        document.body.style.removeProperty("pointer-events");
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  return (
    <MenuProvider value={contextValue}>
      <MenuPrimitive.DropdownMenu modal={false} open={isOpen} onOpenChange={handleOnOpenChange}>
        {children}
      </MenuPrimitive.DropdownMenu>
    </MenuProvider>
  );
};
Menu.displayName = MenuPrimitive.DropdownMenu.displayName;

/**-----------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------
 *
 * -----------------------------------------------------------------------------*/
export const MenuTrigger: UixComponent<"button"> = (props) => {
  const { ref, asChild, children, ...remainingProps } = props;

  const { ids, triggerEl } = useMenuContext((state) => ({
    ids: state.ids,
    triggerEl: state.triggerEl,
  }));

  const triggerRef = useMemo(() => composeRefs(triggerEl, ref), [triggerEl, ref]);

  return (
    <MenuPrimitive.Trigger ref={triggerRef} asChild {...remainingProps}>
      <uix.button asChild={asChild} data-part="trigger" data-scope={MENU_SCOPE} id={ids.trigger} data-uid={ids.uid}>
        {children}
      </uix.button>
    </MenuPrimitive.Trigger>
  );
};
MenuTrigger.displayName = MenuPrimitive.DropdownMenuTrigger.displayName;

type MenuContentProps = {
  /**
   * The options used to dynamically position the menu.
   */
  positioning?: PositioningOptions;

  /**
   * The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object, for example: **{ top: 20, left: 20 }**.
   */
  collisionPadding?: MenuPrimitive.DropdownMenuContentProps["collisionPadding"];
};

/**-----------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------
 *
 * -----------------------------------------------------------------------------*/
export const MenuContent: UixComponent<"div", MenuContentProps> = (props) => {
  const { asChild, ref, children, className, positioning: positioningProp, collisionPadding = 10, ...remainingProps } = props;

  const {
    ids,
    "aria-label": ariaLabel,
    forceMount,
    container,
    portalled,
    loopFocus,
    isFirstOpen,
    contentEl,
    onEscapeKeyDown: onEscapeKeyDownProp,
    onFocusOutside: onFocusOutsideProp,
    onInteractOutside: onInteractOutsideProp,
    onPointerDownOutside: onPointerDownOutsideProp,
    positioning: positioningContext,
  } = useMenuContext((state) => ({
    ids: state.ids,
    "aria-label": state["aria-label"],
    forceMount: state.forceMount,
    container: state.container,
    portalled: state.portalled,
    loopFocus: state.loopFocus,
    isFirstOpen: state.isFirstOpen,
    contentEl: state.contentEl,
    onEscapeKeyDown: state.onEscapeKeyDown,
    onFocusOutside: state.onFocusOutside,
    onInteractOutside: state.onInteractOutside,
    onPointerDownOutside: state.onPointerDownOutside,
    positioning: state.positioning,
  }));

  const contentRef = useMemo(() => composeRefs(contentEl, ref), [contentEl, ref]);

  const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);
  const onFocusOutside = useCallbackRef(onFocusOutsideProp);
  const onInteractOutside = useCallbackRef(onInteractOutsideProp);
  const onPointerDownOutside = useCallbackRef(onPointerDownOutsideProp);

  const handleOnFocusOutside = useCallback<typeof onFocusOutside>(
    (event) => {
      event.preventDefault();
      onFocusOutside(event);
    },
    [onFocusOutside],
  );

  const positioning = useMemo(() => {
    const positioning: PositioningOptions = { ...positioningContext, ...positioningProp };
    if (!positioning.offset) {
      positioning.offset = 8;
    }
    if (!positioning.side) {
      positioning.side = "bottom";
    }
    if (!positioning.align) {
      positioning.align = "center";
    }
    return positioning;
  }, [positioningContext, positioningProp]);

  let content = (
    <MenuPrimitive.Content
      asChild
      ref={contentRef}
      style={{
        pointerEvents: "auto",
      }}
      forceMount={!portalled ? forceMount : undefined}
      loop={loopFocus}
      onEscapeKeyDown={onEscapeKeyDown}
      onFocusOutside={handleOnFocusOutside}
      onInteractOutside={onInteractOutside}
      onPointerDownOutside={onPointerDownOutside}
      collisionPadding={collisionPadding}
      side={positioning.side}
      align={positioning.align}
      sideOffset={positioning.offset}
      {...remainingProps}
    >
      <uix.div
        asChild={asChild}
        className={cn(
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 max-h-[var(--radix-dropdown-menu-content-available-height)] w-[var(--radix-dropdown-menu-trigger-width)] min-w-32 max-w-80 origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-auto rounded-sm bg-[var(--color-bg)] p-1.5 font-medium text-[var(--bg-contrast)] text-sm shadow-md duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",

          "data-[state=open]:data-[side=top]:slide-in-from-bottom-[0.5rem] data-[state=closed]:data-[side=top]:slide-out-to-bottom-[0.5rem] data-[state=open]:data-[side=bottom]:slide-in-from-top-[0.5rem] data-[state=closed]:data-[side=bottom]:slide-out-to-top-[0.5rem] data-[state=open]:data-[side=left]:slide-in-from-right-[0.5rem] data-[state=closed]:data-[side=left]:slide-out-to-right-[0.5rem] data-[state=open]:data-[side=right]:slide-in-from-left-[0.5rem] data-[state=closed]:data-[side=right]:slide-out-to-left-[0.5rem]",
          className,
        )}
        aria-label={ariaLabel}
        data-part="content"
        data-scope={MENU_SCOPE}
        id={ids.content}
        role="menu"
        tabIndex={0}
      >
        {children}
      </uix.div>
    </MenuPrimitive.Content>
  );

  if (portalled) {
    content = (
      <MenuPrimitive.Portal container={container} forceMount={forceMount}>
        {content}
      </MenuPrimitive.Portal>
    );
  }

  return !isFirstOpen ? content : null;
};
MenuContent.displayName = "MenuContent";

type MenuItemProps = Pick<MenuProps, "closeOnSelect" | "onSelect"> & {
  /**
   * The unique value of the menu item option.
   */
  value: string;

  /**
   * The textual value of the option. Used in typeahead navigation of the menu. If not provided, the text content of the menu item will be used.
   */
  valueText?: string;

  /**
   * Whether the menu item is disabled.
   */
  disabled?: boolean;
};
/**-----------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------
 *
 * -----------------------------------------------------------------------------*/
export const MenuItem: UixComponent<"div", MenuItemProps> = (props) => {
  const {
    onSelect: onSelectProp,
    asChild,
    ref,
    children,
    value,
    className,
    closeOnSelect: closeOnSelectProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    id: idProp,
    ...remainingProps
  } = props;

  const menuEl = useRef<HTMLDivElement>(null);

  const {
    ids,
    valueEl,
    contentEl,
    triggerEl,
    closeOnSelect: closeOnSelectContext,
    onSelect: onSelectContext,
    highlightedValue,
    onHighlightChange: onHighlightChangeProp,
  } = useMenuContext((state) => ({
    ids: state.ids,
    valueEl: state.valueEl,
    contentEl: state.contentEl,
    triggerEl: state.triggerEl,
    closeOnSelect: state.closeOnSelect,
    onSelect: state.onSelect,
    highlightedValue: state.highlightedValue,
    onHighlightChange: state.onHighlightChange,
  }));

  const closeOnSelect = useMemo(() => {
    return closeOnSelectProp ?? closeOnSelectContext;
  }, [closeOnSelectProp, closeOnSelectContext]);

  const onBlur = useCallbackRef(onBlurProp);
  const onFocus = useCallbackRef(onFocusProp);
  const onSelectFromRoot = useCallbackRef(onSelectContext);
  const onSelectFromItem = useCallbackRef(onSelectProp);
  const onHighlightChange = useCallbackRef(onHighlightChangeProp);

  const id = useMemo(() => idProp ?? `${ids.uid}${value ? `:${value}` : ""}`, [ids.uid, value, idProp]);

  const menuRef = useMemo(() => composeRefs(menuEl, ref), [ref]);

  const handleOnSelect = useCallback<typeof onSelectFromRoot>(
    (event) => {
      if (!closeOnSelect) {
        event.preventDefault();
      }

      if (event.target) {
        const target = event.target as HTMLDivElement;

        if (target.innerText && valueEl.current) {
          valueEl.current.innerHTML = target.innerText;
        }

        if (target.getAttribute("data-value")) {
          valueEl.current?.setAttribute("data-value", target.getAttribute("data-value") ?? "");
          valueEl.current?.style.setProperty("--data-value", target.getAttribute("data-value") ?? "");
          triggerEl.current?.style.setProperty("--data-value", target.getAttribute("data-value") ?? "");
        }
      }

      onSelectFromRoot(event);
      onSelectFromItem(event);
    },
    [closeOnSelect, onSelectFromRoot, valueEl, triggerEl, onSelectFromItem],
  );

  const handleOnBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      event.currentTarget.removeAttribute("data-highlighted");
      contentEl.current?.removeAttribute("aria-activedescendant");
      onBlur(event);
    },
    [contentEl, onBlur],
  );

  const handleOnFocus = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      event.currentTarget.setAttribute("data-highlighted", "");
      if (contentEl.current) {
        contentEl.current.setAttribute("aria-activedescendant", event.currentTarget.id);
        onHighlightChange(value);
      }
      onFocus(event);
    },
    [contentEl, onFocus, onHighlightChange, value],
  );

  useEffect(() => {
    if (valueEl.current) {
      if (valueEl.current?.getAttribute("data-value") === value) {
        menuEl.current?.focus({ preventScroll: true });
        menuEl.current?.scrollIntoView({ behavior: "instant" });
      }
    } else if (highlightedValue === value) {
      menuEl.current?.focus({ preventScroll: true });
      menuEl.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [valueEl, highlightedValue, value]);

  return (
    <MenuPrimitive.Item asChild ref={menuRef} textValue={value} onSelect={handleOnSelect} {...remainingProps}>
      <uix.div
        asChild={asChild}
        className={cn(
          "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 [outline:none] data-[highlighted]:bg-current/5",
          className,
        )}
        data-part="item"
        data-ownedby={ids.content}
        data-value={value}
        data-scope={MENU_SCOPE}
        id={id}
        role="menuitem"
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
      >
        {children}
      </uix.div>
    </MenuPrimitive.Item>
  );
};
MenuItem.displayName = MenuPrimitive.DropdownMenuItem.displayName;

type MenuValueProps = {
  children?: string | number | boolean | null;
  placeholder?: string;
};
/**-----------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------
 *
 * -----------------------------------------------------------------------------*/
export const MenuValue: UixComponent<"div", MenuValueProps> = (props) => {
  const { asChild, ref, children, className, placeholder, ...remainingProps } = props;

  const valueEl = useMenuContext((state) => state.valueEl);

  const menuRef = useMemo(() => composeRefs(valueEl, ref), [valueEl, ref]);

  return (
    <uix.div
      asChild={false}
      ref={menuRef}
      className={cn("font-medium text-[var(--bg-contrast)] text-sm", className)}
      data-part="value"
      data-scope={MENU_SCOPE}
      {...remainingProps}
    >
      {placeholder}
    </uix.div>
  );
};
