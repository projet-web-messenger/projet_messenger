"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { createContext } from "@repo/utils/create-context";
import { requestAnimationExit, uuid } from "@repo/utils/functions";
import { handleScroll } from "@repo/utils/handleScroll";
import { getFirstTabbable } from "@repo/utils/tabbable";
import type { Props } from "@repo/utils/types";
import { hideOthers } from "aria-hidden";
import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { useDisclosure } from "../../hooks/use-disclosure";
import { type UixComponent, uix } from "../factory";

type ElementIds = Partial<{ uid: string; anchor: string; trigger: string; content: string; closeTrigger: string; arrow: string }>;

type PositioningOptions = Partial<{
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
  offset: number;
}>;

type PopoverProps = {
  /**
   * Whether to automatically set focus on the first focusable content within the popover when opened.
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Whether to close the popover when the escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to close the popover when the user clicks outside of the popover.
   * @default true
   */
  closeOnInteractOutside?: boolean;

  /**
   * Whether to enable lazy mounting.
   * @default false
   */
  lazyMount?: boolean;

  /**
   * Whether the popover should be modal. When set to `true`: - interaction with outside elements will be disabled - only popover content will be visible to screen readers - scrolling is blocked - focus is trapped within the popover.
   * @default false
   */
  modal?: boolean;

  /**
   * Whether the popover is portalled. This will proxy the tabbing behavior regardless of the DOM position of the popover content.
   * @default false
   */
  portalled?: boolean;

  /**
   * Whether to show the arrow.
   * @default true
   */
  showArrow?: boolean;

  /**
   * Whether to unmount on exit.
   * @default false
   */
  unmountOnExit?: boolean;

  /**
   * Whether to restore focus to the element that had focus before the popover was opened.
   */
  restoreFocus?: boolean;

  /**
   * Specify a container element to portal the content into.
   */
  container?: PopoverPrimitive.PopoverPortalProps["container"];

  /**
   * The initial open state of the popover when it is first rendered. Use when you do not need to control its open state.
   */
  defaultOpen?: boolean;

  /**
   * The id of the popover.
   */
  id?: string;

  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusElement?: React.RefObject<HTMLElement | null>;

  /**
   * The element to focus on when the popover is closed.
   */
  finalFocusElement?: React.RefObject<HTMLElement | null>;

  /**
   * Function called when the escape key is pressed.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;

  /**
   * Function called when the animation ends in the closed state.
   */
  onExitComplete?: () => void;

  /**
   * Function called when the focus is moved outside the component.
   */
  onFocusOutside?: PopoverPrimitive.PopoverContentProps["onFocusOutside"];

  /**
   * Function called when an interaction happens outside the component.
   */
  onInteractOutside?: PopoverPrimitive.PopoverContentProps["onInteractOutside"];

  /**
   * Function called when the pointer is pressed down outside the component.
   */
  onPointerDownOutside?: PopoverPrimitive.PopoverContentProps["onPointerDownOutside"];

  /**
   * Function invoked when the popover opens or closes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the popover is open.
   */
  open?: boolean;

  positioning?: PositioningOptions;

  children?: React.ReactNode;
};

type PopoverContextValue = Pick<
  PopoverProps,
  | "closeOnEscape"
  | "closeOnInteractOutside"
  | "portalled"
  | "showArrow"
  | "positioning"
  | "container"
  | "onFocusOutside"
  | "onInteractOutside"
  | "onPointerDownOutside"
  | "onEscapeKeyDown"
> & {
  ids: ElementIds;
  forceMount: true | undefined;
  isFirstOpen: boolean;
  triggerEl: React.RefObject<HTMLElement | null>;
  contentEl: React.RefObject<HTMLElement | null>;
};

/**-----------------------------------------------------------------------------
 * Popover Context
 * -----------------------------------------------------------------------------
 * Provides state management for popover components.
 *
 * -----------------------------------------------------------------------------*/
const popoverContext = createContext<PopoverContextValue>({
  strict: true,
  hookName: "usePopoverContext",
  providerName: "PopoverProvider",
  errorMessage: "usePopoverContext: `context` is undefined. Seems you forgot to wrap component within `<PopoverProvider />`",
  defaultValue: undefined,
  name: "PopoverContext",
});

const [PopoverProvider, usePopoverContext] = popoverContext;

const POPOVER_SCOPE = "popover";

/**-----------------------------------------------------------------------------
 * Popover Component
 * -----------------------------------------------------------------------------
 * Used to show detailed information inside a pop-up.
 *
 * -----------------------------------------------------------------------------*/
export const Popover = (props: PopoverProps) => {
  const {
    autoFocus = true,
    closeOnEscape = true,
    closeOnInteractOutside = true,
    lazyMount = false,
    modal = false,
    portalled = false,
    showArrow = true,
    unmountOnExit = false,
    restoreFocus,
    container,
    defaultOpen,
    id: idProp,
    initialFocusElement,
    finalFocusElement,
    onEscapeKeyDown,
    onExitComplete,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    onOpenChange: onOpenChangeProp,
    open,
    positioning,
    children,
  } = props;

  const [id, setId] = useState<string | undefined>(idProp);

  const { isOpen, onClose, onOpen } = useDisclosure({ defaultOpen, isOpen: open });

  const modalRef = useRef(isOpen ? modal : false);

  const isFirstOpen = useRef(!isOpen);

  const triggerEl = useRef<HTMLElement | null>(null);
  const contentEl = useRef<HTMLElement | null>(null);

  const onOpenChange = useCallbackRef(onOpenChangeProp);

  const ids = useMemo<ElementIds>(() => {
    if (id) {
      return {
        uid: `«${id}»`,
        trigger: `${POPOVER_SCOPE}«${id}»trigger`,
        content: `${POPOVER_SCOPE}«${id}»content`,
        arrow: `${POPOVER_SCOPE}«${id}»arrow`,
        anchor: `${POPOVER_SCOPE}«${id}»anchor`,
        closeTrigger: `${POPOVER_SCOPE}«${id}»close-trigger`,
      };
    }
    return {};
  }, [id]);

  const forceMount = useMemo<true | undefined>(() => {
    return unmountOnExit ? undefined : lazyMount ? true : undefined;
  }, [unmountOnExit, lazyMount]);

  const handleOpenPopover = useCallback(() => {
    if (isFirstOpen.current) {
      isFirstOpen.current = false;
    }

    modalRef.current = modal;
    onOpen();
    onOpenChange(true);
  }, [onOpen, onOpenChange, modal]);

  const handleClosePopover = useCallback(() => {
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

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        handleOpenPopover();
      } else {
        contentEl.current?.setAttribute("data-state", "closed");
        requestAnimationExit({
          node: contentEl.current,
          callbacks: [handleClosePopover, onExitComplete],
        });
      }
    },
    [handleOpenPopover, handleClosePopover, onExitComplete],
  );

  const handleInitialElementFocus = useCallback(() => {
    if (isOpen && autoFocus) {
      let element: HTMLElement | null = null;
      if (initialFocusElement?.current) {
        element = initialFocusElement.current;
      } else {
        element = getFirstTabbable(contentEl.current);
      }
      element?.focus({ preventScroll: true });
    }
  }, [isOpen, autoFocus, initialFocusElement]);

  const handleFinalElementFocus = useCallback(() => {
    let element: HTMLElement | null = null;
    if (finalFocusElement?.current) {
      element = finalFocusElement.current;
    } else if (restoreFocus) {
      const restoreFocusTarget = document.querySelector(`[data-popover-restore-focus-target="${ids.uid}"]`) as HTMLElement | null;
      if (restoreFocusTarget) {
        restoreFocusTarget.removeAttribute("data-popover-restore-focus-target");
        element = restoreFocusTarget;
      }
    }

    if (!element) {
      element = triggerEl.current;
    }
    element?.focus({ preventScroll: true });
  }, [ids.uid, restoreFocus, finalFocusElement]);

  const contextValue: PopoverContextValue = {
    ids,
    forceMount,
    closeOnEscape,
    closeOnInteractOutside,
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    portalled,
    positioning,
    showArrow,
    triggerEl,
    contentEl,
    isFirstOpen: isFirstOpen.current,
    container,
  };

  /**
   * Manages initial focus and mounting when popover opens.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (restoreFocus && ids.uid) {
          document.activeElement?.setAttribute("data-popover-restore-focus-target", ids.uid);
        }

        if (isOpen) {
          handleInitialElementFocus();
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
  }, [isOpen, ids.uid, restoreFocus, handleOnOpenLazyMount, handleOnCloseLazyMount, handleInitialElementFocus, handleFinalElementFocus]);

  /**
   * Manages the aria attribute for the popover elements.
   */
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

  // Add this useEffect to attach/detach wheel event handler
  useEffect(() => {
    // Only attach the wheel event handler when the popover is open and modal is true
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
        // Prevent scrolling entirely for elements outside popover content
        event.preventDefault();
        return;
      }

      // For elements inside popover content, only prevent overscroll
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

  // Handle pointer events for modal popovers to prevent interaction with background content
  useEffect(() => {
    // Skip if not in modal mode
    if (!modalRef.current) {
      return;
    }

    let restoreAriaHidden: (() => void) | undefined;

    // Store original pointer-events value to restore later
    const prevPointerEvents = document.body.style.pointerEvents;

    // Add timeout to give DOM time to update
    const timeout = setTimeout(() => {
      if (isOpen) {
        // When popover opens, disable pointer events on body
        document.body.style.setProperty("pointer-events", "none");

        // Apply aria-hiding to all elements except popover content
        if (contentEl.current) {
          restoreAriaHidden = hideOthers(contentEl.current);
        }
      } else {
        restoreAriaHidden?.();
      }
    }, 1);

    // Cleanup function runs when effect dependencies change or component unmounts
    return () => {
      // Clear the timeout to prevent memory leaks
      clearTimeout(timeout);
      restoreAriaHidden?.();

      // Restore original pointer-events setting
      if (prevPointerEvents) {
        document.body.style.setProperty("pointer-events", prevPointerEvents);
      } else {
        document.body.style.removeProperty("pointer-events");
      }
    };
  }, [isOpen]);

  /**
   * Ensures the popover has a unique identifier.
   */
  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  return (
    <PopoverProvider value={contextValue}>
      <PopoverPrimitive.Root modal={false} onOpenChange={handleOnOpenChange} open={isOpen}>
        {children}
      </PopoverPrimitive.Root>
    </PopoverProvider>
  );
};
Popover.displayName = "Popover";

/**-----------------------------------------------------------------------------
 * PopoverTrigger Component
 * -----------------------------------------------------------------------------
 * Renders a button that triggers the popover.
 *
 * -----------------------------------------------------------------------------*/
export const PopoverTrigger: UixComponent<"button"> = (props) => {
  const { ref, asChild, children, ...remainingProps } = props;

  const { ids, triggerEl } = usePopoverContext((state) => ({
    ids: state.ids,
    triggerEl: state.triggerEl,
  }));

  const triggerRef = useMemo(() => composeRefs(triggerEl, ref), [triggerEl, ref]);

  return (
    <PopoverPrimitive.Trigger ref={triggerRef} asChild {...remainingProps}>
      <uix.button asChild={asChild} data-scope={POPOVER_SCOPE} data-part="trigger" id={ids?.trigger}>
        {children}
      </uix.button>
    </PopoverPrimitive.Trigger>
  );
};
PopoverTrigger.displayName = "PopoverTrigger";

type PopoverContentProps = {
  /**
   * The options used to dynamically position the menu.
   */
  positioning?: PositioningOptions;

  /**
   * The distance in pixels from the boundary edges where collision detection should occur. Accepts a number (same for all sides), or a partial padding object, for example: **{ top: 20, left: 20 }**.
   */
  collisionPadding?: PopoverPrimitive.PopoverContentProps["collisionPadding"];
};
/**-----------------------------------------------------------------------------
 * PopoverTrigger Component
 * -----------------------------------------------------------------------------
 * Renders a button that triggers the popover.
 *
 * -----------------------------------------------------------------------------*/
export const PopoverContent: UixComponent<"div", PopoverContentProps> = (props) => {
  const { ref, asChild, children, className, positioning: positioningProp, collisionPadding = 10, ...remainingProps } = props;

  const {
    ids,
    forceMount,
    closeOnEscape,
    closeOnInteractOutside,
    portalled,
    showArrow,
    contentEl,
    container,
    isFirstOpen,
    onEscapeKeyDown: onEscapeKeyDownProp,
    onFocusOutside: onFocusOutsideProp,
    onInteractOutside: onInteractOutsideProp,
    onPointerDownOutside: onPointerDownOutsideProp,
    positioning: positioningContext,
  } = usePopoverContext((state) => ({
    ids: state.ids,
    forceMount: state.forceMount,
    closeOnEscape: state.closeOnEscape,
    closeOnInteractOutside: state.closeOnInteractOutside,
    portalled: state.portalled,
    showArrow: state.showArrow,
    contentEl: state.contentEl,
    positioning: state.positioning,
    container: state.container,
    isFirstOpen: state.isFirstOpen,
    onEscapeKeyDown: state.onEscapeKeyDown,
    onFocusOutside: state.onFocusOutside,
    onInteractOutside: state.onInteractOutside,
    onPointerDownOutside: state.onPointerDownOutside,
  }));

  const contentRef = useMemo(() => {
    return composeRefs(contentEl, ref);
  }, [contentEl, ref]);

  const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownProp);
  const onFocusOutside = useCallbackRef(onFocusOutsideProp);
  const onInteractOutside = useCallbackRef(onInteractOutsideProp);
  const onPointerDownOutside = useCallbackRef(onPointerDownOutsideProp);

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

  const handleAutoFocus = useCallback<(event: Event) => void>((event) => {
    event.preventDefault();
  }, []);

  const handleOnEscapeKeyDown = useCallback<typeof onEscapeKeyDown>(
    (event) => {
      if (!closeOnEscape) {
        event.preventDefault();
      }
      onEscapeKeyDown(event);
    },
    [closeOnEscape, onEscapeKeyDown],
  );

  const handleOnInteractOutside = useCallback<typeof onInteractOutside>(
    (event) => {
      if (!closeOnInteractOutside) {
        event.preventDefault();
      }
      onInteractOutside(event);
    },
    [closeOnInteractOutside, onInteractOutside],
  );

  const injectAccessibilityMarkup = useMemo(() => {
    if (asChild && showArrow && isValidElement(children)) {
      return cloneElement(
        children,
        {},
        <>
          {(children as React.ReactElement<Props>).props.children}
          <PopoverArrow id={ids.arrow} />
        </>,
      );
    }

    let accessibilityMarkup = <>{children}</>;

    accessibilityMarkup = (
      <>
        {children}
        {showArrow ? <PopoverArrow id={ids.arrow} /> : null}
      </>
    );

    return (accessibilityMarkup as React.ReactElement<Props>).props.children;
  }, [ids.arrow, asChild, showArrow, children]);

  let content = (
    <PopoverPrimitive.Content
      ref={contentRef}
      asChild
      style={{
        pointerEvents: "auto",
      }}
      forceMount={!portalled ? forceMount : undefined}
      onOpenAutoFocus={handleAutoFocus}
      onCloseAutoFocus={handleAutoFocus}
      onEscapeKeyDown={handleOnEscapeKeyDown}
      onFocusOutside={onFocusOutside}
      onInteractOutside={handleOnInteractOutside}
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
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 relative max-h-[var(--radix-popover-content-available-height)] min-w-32 max-w-80 origin-[var(--radix-popover-content-transform-origin)] rounded-sm bg-[var(--color-bg)] text-[var(--bg-contrast)] duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",

          "data-[state=open]:data-[side=top]:slide-in-from-bottom-[0.5rem] data-[state=closed]:data-[side=top]:slide-out-to-bottom-[0.5rem] data-[state=open]:data-[side=bottom]:slide-in-from-top-[0.5rem] data-[state=closed]:data-[side=bottom]:slide-out-to-top-[0.5rem] data-[state=open]:data-[side=left]:slide-in-from-right-[0.5rem] data-[state=closed]:data-[side=left]:slide-out-to-right-[0.5rem] data-[state=open]:data-[side=right]:slide-in-from-left-[0.5rem] data-[state=closed]:data-[side=right]:slide-out-to-left-[0.5rem]",
          className,
        )}
        data-scope={POPOVER_SCOPE}
        data-part="content"
        id={ids?.content}
      >
        {injectAccessibilityMarkup}
      </uix.div>
    </PopoverPrimitive.Content>
  );

  if (portalled) {
    content = (
      <PopoverPrimitive.Portal container={container} forceMount={forceMount}>
        {content}
      </PopoverPrimitive.Portal>
    );
  }

  return !isFirstOpen ? content : null;
};
PopoverContent.displayName = "PopoverContent";

/**-----------------------------------------------------------------------------
 * PopoverArrow Component
 * -----------------------------------------------------------------------------
 * Renders the arrow of the popover.
 *
 * -----------------------------------------------------------------------------*/

const PopoverArrow: UixComponent<"svg"> = (props) => {
  const { children, className, ...remainingProps } = props;

  return <PopoverPrimitive.Arrow className={cn("fill-[var(--bg-currentcolor)]", className)} data-part="arrow" data-scope={POPOVER_SCOPE} {...remainingProps} />;
};
PopoverArrow.displayName = PopoverPrimitive.Arrow.displayName;
