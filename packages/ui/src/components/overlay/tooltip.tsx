"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { createContext } from "@repo/utils/create-context";
import { isElementOrChildrenHovered, requestAnimationExit, uuid } from "@repo/utils/functions";
import { handleScroll } from "@repo/utils/handleScroll";
import type { Props } from "@repo/utils/types";
import { hideOthers } from "aria-hidden";
import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { useDisclosure } from "../../hooks/use-disclosure";
import { type UixComponent, uix } from "../factory";

type ElementIds = Partial<{
  uid: string;
  trigger: string;
  content: string;
  arrow: string;
}>;

type PositioningOptions = Partial<{
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
  offset: number;
}>;

type TooltipProps = {
  /**
   * Whether to close the tooltip when the Escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to close the tooltip on pointerdown.
   * @default true
   */
  closeOnPointerDown?: boolean;

  /**
   * Whether the tooltip's content is interactive. In this mode, the tooltip will remain open when user hovers over the content.
   * @default false
   */
  interactive?: boolean;

  /**
   * Whether the popover should be modal. When set to `true`: - interaction with outside elements will be disabled - only tooltip content will be visible to screen readers - scrolling is blocked - focus is trapped within the tooltip.
   * @default false
   */
  modal?: boolean;

  /**
   * Whether to enable lazy mounting.
   * @default false
   */
  lazyMount?: boolean;

  /**
   * Whether to unmount on exit.
   * @default true
   */
  unmountOnExit?: boolean;

  /**
   * Whether to show the arrow.
   * @default false
   */
  showArrow?: boolean;

  /**
   * Whether to use a portal for the tooltip.
   * @default false
   */
  portalled?: boolean;

  /**
   * Whether to restore focus to the element that had focus before the popover was opened.
   */
  restoreFocus?: boolean;

  /**
   * Specify a container element to portal the content into.
   */
  container?: TooltipPrimitive.TooltipPortalProps["container"];

  /**
   * The initial open state of the tooltip when it is first rendered. Use when you do not need to control its open state.
   */
  defaultOpen?: boolean;

  /**
   * Whether the tooltip is disabled.
   */
  disabled?: boolean;

  /**
   * The `id` of the tooltip.
   */
  id?: string;

  /**
   * Function called when the animation ends in the closed state.
   */
  onExitComplete?: () => void;

  /**
   * Function called when the tooltip is opened.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the tooltip is open.
   */
  open?: boolean;

  /**
   * The preferred position of the tooltip.
   */
  positioning?: PositioningOptions;

  children?: React.ReactNode;
};

type TooltipContextValue = Pick<TooltipProps, "portalled" | "container" | "showArrow" | "closeOnEscape" | "closeOnPointerDown" | "positioning"> & {
  ids: ElementIds;
  forceMount: true | undefined;
  isFirstOpen: boolean;
  triggerEl: React.RefObject<HTMLElement | null>;
  contentEl: React.RefObject<HTMLElement | null>;
};

/**-----------------------------------------------------------------------------
 * Tooltip Context
 * -----------------------------------------------------------------------------
 * Provides state management for tooltip components.
 *
 * -----------------------------------------------------------------------------*/
const tooltipContext = createContext<TooltipContextValue>({
  strict: true,
  hookName: "useTooltipContext",
  providerName: "TooltipProvider",
  errorMessage: "useTooltipContext: `context` is undefined. Seems you forgot to wrap component within `<TooltipProvider />`",
  defaultValue: undefined,
  name: "TooltipContext",
});

const [TooltipProvider, useTooltipContext] = tooltipContext;

const TOOLTIP_SCOPE = "tooltip";

/**-----------------------------------------------------------------------------
 * Tooltip Component
 * -----------------------------------------------------------------------------
 * Used to display additional information when a user hovers over an element.
 *
 * -----------------------------------------------------------------------------*/
export const Tooltip = (props: TooltipProps) => {
  const {
    id: idProp,
    closeOnEscape = true,
    closeOnPointerDown = true,
    interactive = false,
    lazyMount = false,
    unmountOnExit = false,
    showArrow = false,
    portalled = false,
    positioning,
    defaultOpen,
    disabled,
    onExitComplete,
    onOpenChange: onOpenChangeProp,
    open,
    modal,
    container,
    restoreFocus,
    children,
  } = props;

  const [id, setId] = useState<string | undefined>(idProp);

  const { isOpen, onClose, onOpen } = useDisclosure({ defaultOpen, isOpen: open });

  const modalRef = useRef(isOpen ? modal : false);

  const isFirstOpen = useRef(!isOpen);

  const mousePositionRef = useRef({ x: 0, y: 0 });

  const triggerEl = useRef<HTMLButtonElement>(null);
  const contentEl = useRef<HTMLDivElement>(null);

  const onOpenChange = useCallbackRef(onOpenChangeProp);

  // Generate unique IDs for the trigger, content, and arrow elements
  const ids = useMemo<ElementIds>(() => {
    if (id) {
      return {
        uid: `«${id}»`,
        trigger: `${TOOLTIP_SCOPE}«${id}»trigger`,
        content: `${TOOLTIP_SCOPE}«${id}»content`,
        arrow: `${TOOLTIP_SCOPE}«${id}»arrow`,
      };
    }
    return {};
  }, [id]);

  const forceMount = useMemo<true | undefined>(() => {
    return unmountOnExit ? undefined : lazyMount ? true : undefined;
  }, [unmountOnExit, lazyMount]);

  const handleOpenTooltip = useCallback(() => {
    if (isFirstOpen.current) {
      isFirstOpen.current = false;
    }

    modalRef.current = modal;
    onOpen();
    onOpenChange(true);
  }, [onOpen, onOpenChange, modal]);

  const handleCloseTooltip = useCallback(() => {
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
        if (!disabled) {
          handleOpenTooltip();
        }
      } else {
        // If trying to close, check if mouse is still within tooltip system
        const { x, y } = mousePositionRef.current;

        // Don't close if mouse is still over trigger or content
        if (triggerEl.current && isElementOrChildrenHovered(triggerEl.current, x, y)) {
          return; // Cancel close - mouse is over trigger
        }

        // For interactive tooltips, also check content element
        if (interactive && contentEl.current && isElementOrChildrenHovered(contentEl.current, x, y)) {
          return; // Cancel close - mouse is over content in interactive mode
        }

        contentEl.current?.setAttribute("data-state", "closed");
        requestAnimationExit({
          node: contentEl.current,
          callbacks: [handleCloseTooltip, onExitComplete],
        });
      }
    },
    [disabled, interactive, handleOpenTooltip, handleCloseTooltip, onExitComplete],
  );

  const contextValue: TooltipContextValue = {
    contentEl,
    forceMount,
    ids,
    isFirstOpen: isFirstOpen.current,
    triggerEl,
    closeOnEscape,
    closeOnPointerDown,
    portalled,
    positioning,
    showArrow,
    container,
  };

  // Track mouse position
  useEffect(() => {
    // Only add listeners when tooltip is open and interactive
    if (isOpen && interactive) {
      const handleMouseMove = (e: MouseEvent) => {
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isOpen, interactive]);

  /**
   * Manages initial focus and mounting when tooltip opens.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (restoreFocus && ids.uid) {
          document.activeElement?.setAttribute("data-tooltip-restore-focus-target", ids.uid);
        }

        if (isOpen) {
          handleOnOpenLazyMount();
        } else {
          handleOnCloseLazyMount();
        }
      }
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen, ids.uid, restoreFocus, handleOnOpenLazyMount, handleOnCloseLazyMount]);

  /**
   * Manages the aria attribute for the tooltip elements.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (isOpen) {
          triggerEl.current?.setAttribute("data-state", "open");
          contentEl.current?.setAttribute("data-state", "open");
          contentEl.current?.removeAttribute("hidden");
          if (triggerEl.current && contentEl.current) {
            triggerEl.current.setAttribute("aria-describedby", contentEl.current.id);
          }
        } else {
          triggerEl.current?.removeAttribute("aria-describedby");
        }
      }
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen]);

  // Add this useEffect to attach/detach wheel event handler
  useEffect(() => {
    // Only attach the wheel event handler when the tooltip is open and modal is true
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
        // Prevent scrolling entirely for elements outside tooltip content
        event.preventDefault();
        return;
      }

      // For elements inside tooltip content, only prevent overscroll
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

  // Handle pointer events for modal tooltips to prevent interaction with background content
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
        // When tooltip opens, disable pointer events on body
        document.body.style.setProperty("pointer-events", "none");

        // Apply aria-hiding to all elements except tooltip content
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

  // Generate a unique ID if not provided
  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  return (
    <TooltipProvider value={contextValue}>
      <TooltipPrimitive.Provider>
        <TooltipPrimitive.Root open={isOpen} delayDuration={0} disableHoverableContent={!interactive} onOpenChange={handleOnOpenChange}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    </TooltipProvider>
  );
};
Tooltip.displayName = "Tooltip";

type TooltipTriggerProps = {
  ids?: ElementIds;
};

/**-----------------------------------------------------------------------------
 * TooltipTrigger Component
 * -----------------------------------------------------------------------------
 * Used to trigger the tooltip when hovered or focused.
 *
 * -----------------------------------------------------------------------------*/
export const TooltipTrigger: UixComponent<"button", TooltipTriggerProps> = (props) => {
  const { ref, asChild, children, ...remainingProps } = props;

  const { ids, triggerEl } = useTooltipContext((state) => ({
    ids: state.ids,
    triggerEl: state.triggerEl,
  }));

  const triggerRef = useMemo(() => composeRefs(triggerEl, ref), [triggerEl, ref]);

  return (
    <TooltipPrimitive.Trigger ref={triggerRef} asChild {...remainingProps}>
      <uix.button asChild={asChild} data-scope={TOOLTIP_SCOPE} data-part="trigger" id={ids?.trigger}>
        {children}
      </uix.button>
    </TooltipPrimitive.Trigger>
  );
};
TooltipTrigger.displayName = "TooltipTrigger";

type TooltipContentProps = Pick<TooltipProps, "positioning"> & {
  collisionPadding?: TooltipPrimitive.TooltipContentProps["collisionPadding"];
};

/**-----------------------------------------------------------------------------
 * TooltipContent Component
 * -----------------------------------------------------------------------------
 * Used to display the content of the tooltip.
 *
 * -----------------------------------------------------------------------------*/
export const TooltipContent: UixComponent<"div", TooltipContentProps> = (props) => {
  const { ref, asChild, children, className, positioning: positioningProp, collisionPadding = 10, ...remainingProps } = props;

  const {
    ids,
    forceMount,
    closeOnEscape,
    portalled,
    showArrow,
    contentEl,
    container,
    isFirstOpen,
    closeOnPointerDown,
    positioning: positioningContext,
  } = useTooltipContext((state) => ({
    ids: state.ids,
    forceMount: state.forceMount,
    closeOnEscape: state.closeOnEscape,
    portalled: state.portalled,
    showArrow: state.showArrow,
    contentEl: state.contentEl,
    positioning: state.positioning,
    container: state.container,
    isFirstOpen: state.isFirstOpen,
    closeOnPointerDown: state.closeOnPointerDown,
  }));

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

  const removeLastChild = useCallback((node: HTMLElement | null) => {
    setTimeout(() => {
      if (node) {
        const duplicatedTooltipElement = node.querySelector('[role="tooltip"]');
        if (duplicatedTooltipElement) {
          node.removeChild(duplicatedTooltipElement);
        }
      }
    }, 1);
  }, []);

  const handleOnEscapeKeyDown: TooltipPrimitive.TooltipContentProps["onEscapeKeyDown"] = (event) => {
    if (!closeOnEscape) {
      event.preventDefault();
    }
  };

  const handleOnPointerDownOutside: TooltipPrimitive.TooltipContentProps["onPointerDownOutside"] = (event) => {
    if (!closeOnPointerDown) {
      event.preventDefault();
    }
  };

  const contentRef = useMemo(() => {
    return composeRefs(removeLastChild, contentEl, ref);
  }, [removeLastChild, contentEl, ref]);

  const tooltipContentWithArrow = useMemo(() => {
    if (asChild && showArrow && isValidElement(children)) {
      return cloneElement(
        children,
        {},
        <>
          {(children as React.ReactElement<Props>).props.children}
          <TooltipArrow id={ids.arrow} />
        </>,
      );
    }

    let contentWithArrow = <>{children}</>;

    if (showArrow) {
      contentWithArrow = (
        <>
          {contentWithArrow}
          <TooltipArrow id={ids.arrow} />
        </>
      );
    }

    return (contentWithArrow as React.ReactElement<Props>).props.children;
  }, [ids.arrow, asChild, showArrow, children]);

  let content = (
    <TooltipPrimitive.Content
      ref={contentRef}
      asChild={asChild}
      style={{ pointerEvents: "auto" }}
      forceMount={!portalled ? forceMount : undefined}
      onEscapeKeyDown={handleOnEscapeKeyDown}
      onPointerDownOutside={handleOnPointerDownOutside}
      side={positioning.side}
      align={positioning.align}
      sideOffset={positioning.offset}
      collisionPadding={collisionPadding}
      className={cn(
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 relative max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-32 max-w-80 origin-[var(--radix-tooltip-content-transform-origin)] rounded-sm bg-[var(--color-bg)] text-[var(--bg-contrast)] duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",

        "data-[state=open]:data-[side=top]:slide-in-from-bottom-[0.5rem] data-[state=closed]:data-[side=top]:slide-out-to-bottom-[0.5rem] data-[state=open]:data-[side=bottom]:slide-in-from-top-[0.5rem] data-[state=closed]:data-[side=bottom]:slide-out-to-top-[0.5rem] data-[state=open]:data-[side=left]:slide-in-from-right-[0.5rem] data-[state=closed]:data-[side=left]:slide-out-to-right-[0.5rem] data-[state=open]:data-[side=right]:slide-in-from-left-[0.5rem] data-[state=closed]:data-[side=right]:slide-out-to-left-[0.5rem]",
        className,
      )}
      hidden
      data-scope={TOOLTIP_SCOPE}
      data-part="content"
      id={ids?.content}
      role="tooltip"
      {...remainingProps}
    >
      {tooltipContentWithArrow}
    </TooltipPrimitive.Content>
  );

  useEffect(() => {
    return () => {};
  });

  if (portalled) {
    content = (
      <TooltipPrimitive.Portal container={container} forceMount={forceMount}>
        {content}
      </TooltipPrimitive.Portal>
    );
  }

  return !isFirstOpen ? content : null;
};
TooltipContent.displayName = "TooltipContent";

type TooltipArrowProps = {
  ids?: ElementIds;
};

/**-----------------------------------------------------------------------------
 * TooltipArrow Component
 * -----------------------------------------------------------------------------
 * Renders the arrow of the tooltip.
 *
 * -----------------------------------------------------------------------------*/
const TooltipArrow: UixComponent<"svg", TooltipArrowProps> = (props) => {
  const { children, className, ...remainingProps } = props;

  return <TooltipPrimitive.Arrow className={cn("fill-[var(--bg-currentcolor)]", className)} data-part="arrow" data-scope={TOOLTIP_SCOPE} {...remainingProps} />;
};
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;
