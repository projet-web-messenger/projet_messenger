"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { isElementOrChildrenHovered, requestAnimationExit, uuid } from "@repo/utils/functions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuChevronUp } from "react-icons/lu";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { useDisclosure } from "../../hooks/use-disclosure";
import { type UixComponent, uix } from "../factory";

type ElementIds = Partial<{
  trigger: string;
  content: string;
  arrow: string;
}>;

type PositioningOptions = Partial<{
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
  offset: number;
}>;

type TooltipDelay = Partial<{
  open: number;
  close: number;
}>;

type TooltipProps = {
  /**
   * The delay before the tooltip opens or closes.
   * @default { open: 0, close: 0 }
   */
  delay?: TooltipDelay;

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
   * @default true
   */
  portalled?: boolean;

  /**
   * Custom label for the tooltip.
   */
  "aria-label"?: string;

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

  /**
   * When true, overrides the side andalign preferences to prevent collisions with boundary edges.
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * Whether to hide the content when the trigger becomes fully occluded.
   * @default true
   */
  hideWhenDetached?: boolean;

  /**
   * The element used as the collision boundary. By default this is the viewport, though you can provide additional element(s) to be included in this check.
   */
  collisionBoundary?: TooltipPrimitive.TooltipContentProps["collisionBoundary"];

  collisionPadding?: TooltipPrimitive.TooltipContentProps["collisionPadding"];

  /**
   * The text or element that will be displayed when the tooltip is open.
   */
  content: React.ReactNode;

  children: React.ReactElement;
} & Pick<React.ComponentProps<"div">, "ref" | "className" | "style">;

const TOOLTIP_SCOPE = "tooltip";

/**-----------------------------------------------------------------------------
 * Tooltip Component
 * -----------------------------------------------------------------------------
 * Used to display additional information when a user hovers over an element.
 *
 * -----------------------------------------------------------------------------*/
export const Tooltip = (props: TooltipProps) => {
  const {
    ref,
    children,
    content,
    className,
    style,
    id: idProp,
    delay,
    closeOnEscape = true,
    closeOnPointerDown = true,
    interactive = false,
    lazyMount = false,
    unmountOnExit = false,
    showArrow = false,
    portalled = true,
    hideWhenDetached = true,
    avoidCollisions = true,
    collisionBoundary,
    collisionPadding,
    positioning,
    "aria-label": ariaLabel,
    defaultOpen,
    disabled,
    onExitComplete,
    onOpenChange: onOpenChangeProp,
    open,
  } = props;

  const [id, setId] = useState<string | undefined>(idProp);
  const [forceMount, setForceMount] = useState(false);

  const hasBeenOpenedOnce = useRef(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const triggerEl = useRef<HTMLButtonElement>(null);
  const contentEl = useRef<HTMLDivElement>(null);
  const onOpenChange = useCallbackRef(onOpenChangeProp);

  const { isOpen, onClose, onOpen } = useDisclosure({
    defaultOpen,
    isOpen: open,
    openDelay: delay?.open ?? 0,
    closeDelay: delay?.close ?? 0,
  });

  const contentRef = useMemo(() => composeRefs(contentEl, ref), [ref]);

  // Generate unique IDs for the trigger, content, and arrow elements
  const ids = useMemo<ElementIds>(() => {
    if (id) {
      return {
        trigger: `${TOOLTIP_SCOPE}::${id}::trigger`,
        content: `${TOOLTIP_SCOPE}::${id}::content`,
        arrow: `${TOOLTIP_SCOPE}::${id}::arrow`,
      };
    }
    return {};
  }, [id]);

  // Handle lazy mount
  const handleLazyMount = useCallback(() => {
    if (lazyMount) {
      const contentEl = ids.content ? document.getElementById(ids.content) : null;
      if (contentEl) {
        if (isOpen) {
          contentEl.removeAttribute("hidden");
        } else {
          contentEl.setAttribute("hidden", "");
        }
      }
    }
  }, [ids.content, isOpen, lazyMount]);

  // Handle unmount on exit
  const handleUnmountOnExit = useCallback(() => {
    if (unmountOnExit || !lazyMount) {
      setForceMount(false);
    }
  }, [unmountOnExit, lazyMount]);

  // Handle close on pointer down
  const handleCloseOnPointerDown = useCallback(() => {
    if (isOpen && closeOnPointerDown) {
      // For Pointer down, trigger click interaction close the tooltip
      onClose();
      onOpenChange(false);
    }
  }, [isOpen, closeOnPointerDown, onClose, onOpenChange]);

  // Improved close detection
  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      // If trying to open, always allow it
      if (open) {
        onOpen();
        onOpenChange(true);
        return;
      }

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

      // If we got here, it's safe to close
      onClose();
      onOpenChange(false);
    },
    [onClose, onOpen, onOpenChange, interactive],
  );

  // Add this inside the Tooltip component
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Close tooltip on Tab, Space, Enter, or Escape regardless of mouse position
      if (isOpen && (e.key === "Tab" || e.key === " " || e.key === "Enter" || (e.key === "Escape" && closeOnEscape))) {
        // For accessibility, keyboard interactions always close the tooltip
        if (onOpenChangeProp) {
          onOpenChange(false);
        } else {
          onClose();
        }
      }
    },
    [isOpen, onClose, onOpenChange, onOpenChangeProp, closeOnEscape],
  );

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

  // Add this effect to listen for keyboard events
  useEffect(() => {
    // Only add listeners when tooltip is open
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // Add this effect to listen for click event on trigger
  useEffect(() => {
    // Only add listeners when tooltip is open
    if (isOpen && triggerEl.current) {
      triggerEl.current?.addEventListener("click", handleCloseOnPointerDown);
      return () => {
        triggerEl.current?.removeEventListener("click", handleCloseOnPointerDown);
      };
    }
  }, [isOpen, handleCloseOnPointerDown]);

  // Add this effect to handle lazy mount and unmount on exit
  useEffect(() => {
    let timeoutAnimationExit: NodeJS.Timeout | undefined = undefined;

    if (hasBeenOpenedOnce.current) {
      if (isOpen) {
        handleLazyMount();
      } else {
        timeoutAnimationExit = requestAnimationExit({
          node: ids.content ? document.getElementById(ids.content) : null,
          callbacks: [handleLazyMount, handleUnmountOnExit, onExitComplete],
        });
      }
    }
    return () => {
      clearTimeout(timeoutAnimationExit);
    };
  }, [ids.content, onExitComplete, isOpen, handleUnmountOnExit, handleLazyMount]);

  // Set the force mount state when the tooltip is opened for the first time
  useEffect(() => {
    if (!disabled && !hasBeenOpenedOnce.current && isOpen) {
      hasBeenOpenedOnce.current = true;
      setForceMount(true);
    }
  }, [isOpen, disabled]);

  // Generate a unique ID if not provided
  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root open={isOpen} delayDuration={0} disableHoverableContent={!interactive} onOpenChange={handleOnOpenChange}>
        <TooltipTrigger ref={triggerEl} ids={ids}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          ref={contentRef}
          ids={ids}
          open={isOpen}
          portalled={portalled}
          showArrow={showArrow}
          closeOnEscape={closeOnEscape}
          closeOnPointerDown={closeOnPointerDown}
          forceMount={forceMount}
          positioning={positioning}
          avoidCollisions={avoidCollisions}
          hideWhenDetached={hideWhenDetached}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          className={className}
          style={style}
          aria-label={ariaLabel}
        >
          {content}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
Tooltip.displayName = TooltipPrimitive.Tooltip.displayName;

type TooltipTriggerProps = {
  ids?: ElementIds;
};

/**-----------------------------------------------------------------------------
 * TooltipTrigger Component
 * -----------------------------------------------------------------------------
 * Used to trigger the tooltip when hovered or focused.
 *
 * -----------------------------------------------------------------------------*/
const TooltipTrigger: UixComponent<"button", TooltipTriggerProps> = (props) => {
  const { asChild = true, children, ids, ...remainingProps } = props;

  return (
    <TooltipPrimitive.Trigger asChild {...remainingProps}>
      <uix.button asChild={asChild} data-scope={TOOLTIP_SCOPE} data-part="trigger" id={ids?.trigger} aria-describedby={ids?.content}>
        {children}
      </uix.button>
    </TooltipPrimitive.Trigger>
  );
};

type TooltipContentProps = Pick<
  TooltipProps,
  | "portalled"
  | "open"
  | "showArrow"
  | "closeOnEscape"
  | "closeOnPointerDown"
  | "positioning"
  | "avoidCollisions"
  | "collisionBoundary"
  | "collisionPadding"
  | "hideWhenDetached"
> & {
  ids: ElementIds;
  forceMount?: boolean;
};

/**-----------------------------------------------------------------------------
 * TooltipContent Component
 * -----------------------------------------------------------------------------
 * Used to display the content of the tooltip.
 *
 * -----------------------------------------------------------------------------*/
const TooltipContent: UixComponent<"div", TooltipContentProps> = (props) => {
  const {
    ref,
    asChild,
    open,
    children,
    className,
    style,
    showArrow,
    positioning: positioningProp,
    closeOnEscape,
    closeOnPointerDown,
    collisionBoundary,
    collisionPadding = 10,
    ids,
    forceMount,
    portalled,
    ...remainingProps
  } = props;

  const isMounted = useRef(false);

  const positioning = useMemo(() => {
    const positioning: PositioningOptions = { ...positioningProp };
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
  }, [positioningProp]);

  const removeLastChild = useCallback((node: HTMLElement | null) => {
    if (!isMounted.current && node?.lastElementChild) {
      node.removeChild(node.lastElementChild);
      node.removeAttribute("open");
      isMounted.current = true;
    }
  }, []);

  const contentRef = useMemo(() => composeRefs(removeLastChild, ref), [removeLastChild, ref]);

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

  const content = (
    <TooltipPrimitive.Content
      style={{
        pointerEvents: "auto",
      }}
      ref={contentRef}
      onEscapeKeyDown={handleOnEscapeKeyDown}
      onPointerDownOutside={handleOnPointerDownOutside}
      side={positioning.side}
      align={positioning.align}
      sideOffset={positioning.offset}
      collisionPadding={collisionPadding}
      forceMount={forceMount || undefined}
      data-state={open ? "open" : "closed"}
      asChild
      {...remainingProps}
    >
      <uix.div
        asChild={asChild}
        className={cn(
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 relative max-h-[var(--radix-dropdown-menu-content-available-height)] max-w-80 origin-[var(--radix-tooltip-content-transform-origin)] rounded-sm bg-[var(--color-inverted)] px-2.5 py-1 font-medium text-[var(--bg-contrast)] text-xs shadow-md duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",

          "data-[state=open]:data-[side=top]:slide-in-from-bottom-[0.5rem] data-[state=closed]:data-[side=top]:slide-out-to-bottom-[0.5rem] data-[state=open]:data-[side=bottom]:slide-in-from-top-[0.5rem] data-[state=closed]:data-[side=bottom]:slide-out-to-top-[0.5rem] data-[state=open]:data-[side=left]:slide-in-from-right-[0.5rem] data-[state=closed]:data-[side=left]:slide-out-to-right-[0.5rem] data-[state=open]:data-[side=right]:slide-in-from-left-[0.5rem] data-[state=closed]:data-[side=right]:slide-out-to-left-[0.5rem]",
          className,
        )}
        style={style}
        data-scope={TOOLTIP_SCOPE}
        data-part="content"
        id={ids?.content}
        role="tooltip"
      >
        {children}
        {showArrow ? <TooltipArrow /> : null}
      </uix.div>
    </TooltipPrimitive.Content>
  );

  if (portalled) {
    return <TooltipPrimitive.Portal forceMount={forceMount || undefined}>{content}</TooltipPrimitive.Portal>;
  }

  return content;
};
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type TooltipArrowProps = Pick<TooltipProps, "positioning"> & {
  ids?: ElementIds;
};

/**-----------------------------------------------------------------------------
 * TooltipArrow Component
 * -----------------------------------------------------------------------------
 * Renders the arrow of the tooltip.
 *
 * -----------------------------------------------------------------------------*/
const TooltipArrow: UixComponent<"svg", TooltipArrowProps> = (props) => {
  const { children, className, ids, positioning, ...remainingProps } = props;

  return (
    <TooltipPrimitive.Arrow asChild {...remainingProps}>
      <span
        style={{
          width: Math.max(positioning?.offset ?? 0, 8),
          height: Math.max(positioning?.offset ?? 0, 8),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LuChevronUp
          className="-top-[8.8px] absolute inline-block size-6 min-h-[1lh] shrink-0 rotate-180 fill-[var(--bg-currentcolor)] stroke-1 align-middle text-[1.2em] text-transparent leading-[1em]"
          data-part="arrow"
          data-scope={TOOLTIP_SCOPE}
          id={ids?.arrow}
        />
      </span>
    </TooltipPrimitive.Arrow>
  );
};
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;
