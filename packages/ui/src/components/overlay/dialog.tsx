"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { createContext } from "@repo/utils/create-context";
import { requestAnimationExit, uuid } from "@repo/utils/functions";
import { handleScroll } from "@repo/utils/handleScroll";
import { getFirstTabbable } from "@repo/utils/tabbable";
import type { Props } from "@repo/utils/types";
import { hideOthers } from "aria-hidden";
import { cloneElement, isValidElement, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuX } from "react-icons/lu";
import { useCallbackRef } from "../../hooks/use-callback-ref";
import { useDisclosure } from "../../hooks/use-disclosure";
import { type UixComponent, uix } from "../factory";

type ElementIds = Partial<{
  uid: string;
  positioner: string;
  trigger: string;
  backdrop: string;
  content: string;
  closeTrigger: string;
}>;

type PositioningOptions = Partial<{
  /**
   * The side of the dialog to position.
   */
  side: "top" | "bottom" | "left" | "right";
  /**
   * The alignment of the dialog.
   */
  align: "start" | "center" | "end";
  /**
   * The offset of the dialog from the edge of the screen.
   */
  offset: number;
}>;

type DialogProps = {
  /**
   * Whether to automatically set focus on the first focusable content within the dialog when opened.
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Whether to close the dialog when the escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to close the dialog when the outside is clicked.
   * @default true
   */
  closeOnInteractOutside?: boolean;

  /**
   * The initial open state of the dialog when it is first rendered. Use when you do not need to control its open state.
   */
  defaultOpen?: boolean;

  /**
   * Element to receive focus when the dialog is closed.
   */
  finalFocusElement?: React.RefObject<HTMLElement | null>;

  /**
   * Element to receive focus when the dialog is opened.
   */
  initialFocusElement?: React.RefObject<HTMLElement | null>;

  /**
   * Whether to mount the dialog lazily.
   * @default false
   */
  lazyMount?: boolean;

  /**
   * Whether to unmount on exit.
   * @default false
   */
  unmountOnExit?: boolean;

  /**
   * Whether to prevent pointer interaction outside the element and hide all content below it.
   * @default true
   */
  modal?: boolean;

  /**
   * Whether the dialog is portalled. This will proxy the tabbing behavior regardless of the DOM position of the dialog content.
   * @default false
   */
  portalled?: boolean;

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
  onFocusOutside?: DialogPrimitive.DialogContentProps["onFocusOutside"];

  /**
   * Function called when an interaction happens outside the component.
   */
  onInteractOutside?: DialogPrimitive.DialogContentProps["onInteractOutside"];

  /**
   * Function called when the pointer is pressed down outside the component.
   */
  onPointerDownOutside?: DialogPrimitive.DialogContentProps["onPointerDownOutside"];

  /**
   * Callback to be invoked when the dialog is opened or closed
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the dialog is open
   */
  open?: boolean;

  /**
   * Specify a container element to portal the content into.
   */
  container?: DialogPrimitive.DialogPortalProps["container"];

  /**
   * Whether to restore focus to the element that had focus before the dialog was opened.
   */
  restoreFocus?: boolean;

  /**
   * The dialog's role.
   * @default "dialog"
   */
  role?: "dialog" | "alertdialog";

  /**
   * The variant of the dialog.
   */
  variant?: "cover" | "full" | "drawer" | null;

  /**
   * The id of the dialog.
   */
  id?: string;

  /**
   * The className of the dialog overlay.
   */
  className?: string;

  /**
   * The children of the component.
   */
  children?: React.ReactNode;

  /**
   * The options used to dynamically position the menu.
   */
  positioning?: PositioningOptions;
};

type DialogContextValue = Pick<
  DialogProps,
  | "role"
  | "closeOnEscape"
  | "closeOnInteractOutside"
  | "portalled"
  | "container"
  | "variant"
  | "positioning"
  | "onFocusOutside"
  | "onInteractOutside"
  | "onPointerDownOutside"
  | "onEscapeKeyDown"
> & {
  /**
   * The ids of the dialog elements.
   */
  ids: ElementIds;
  /**
   * Whether the dialog is force mounted.
   */
  forceMount: true | undefined;
  /**
   * The function to set the open state.
   */
  isFirstOpen: boolean;
  /**
   * The function to set the trigger element.
   */
  triggerEl: React.RefObject<HTMLButtonElement | null>;
  /**
   * The function to set the positioner element.
   */
  positionerEl: React.RefObject<HTMLDivElement | null>;
  /**
   * The function to set the content element.
   */
  contentEl: React.RefObject<HTMLDivElement | null>;
  /**
   * The function to set the backdrop element.
   */
  backdropEl: React.RefObject<HTMLDivElement | null>;
};

/**-----------------------------------------------------------------------------
 * Dialog Context
 * -----------------------------------------------------------------------------
 * Provides state management for dialog components.
 *
 * -----------------------------------------------------------------------------*/
const dialogContext = createContext<DialogContextValue>({
  strict: true,
  hookName: "useDialogContext",
  providerName: "DialogProvider",
  errorMessage: "useDialogContext: `context` is undefined. Seems you forgot to wrap component within `<DialogProvider />`",
  defaultValue: undefined,
  name: "DialogContext",
});
const [DialogProvider, useDialogContext] = dialogContext;

/**
 * The scope of the dialog component.
 * This is used to generate unique IDs for the dialog elements.
 */
const DIALOG_SCOPE = "dialog";

/**-----------------------------------------------------------------------------
 * Dialog Component
 * -----------------------------------------------------------------------------
 * Manages the state and behavior of dialog components.
 *
 * -----------------------------------------------------------------------------*/
export const Dialog = (props: DialogProps) => {
  const {
    role = "dialog",
    autoFocus = true,
    closeOnEscape = true,
    closeOnInteractOutside = true,
    lazyMount = false,
    modal = true,
    portalled = false,
    unmountOnExit = false,
    container,
    variant,
    positioning,
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
    children,
    restoreFocus,
  } = props;

  // State to manage the dialog ID
  const [id, setId] = useState<string | undefined>(idProp);

  // Hook to track if the dialog is open. This is used to manage the dialog's open state.
  const { isOpen, onClose, onOpen } = useDisclosure({ defaultOpen, isOpen: open });

  /**
   * Preserves the modal state across renders and transitions.
   */
  const modalRef = useRef(isOpen ? modal : false);

  /**
   * Prevent certain behaviors from occurring before the dialog's first open event and manage mounted state.
   */
  const isFirstOpen = useRef(!isOpen);

  // Refs to manage the trigger, content, and backdrop elements. These are used to set focus and manage the dialog's behavior.
  const triggerEl = useRef<HTMLButtonElement>(null);
  const positionerEl = useRef<HTMLDivElement>(null);
  const contentEl = useRef<HTMLDivElement>(null);
  const backdropEl = useRef<HTMLDivElement>(null);

  // Use a callback ref to handle changes in the open state
  const onOpenChange = useCallbackRef(onOpenChangeProp);

  /**
   * Generates unique IDs for various dialog elements (e.g., positioner, trigger, content, etc.) within the dialog's scope. Returns an empty object if no `id` is provided.
   */
  const ids = useMemo<ElementIds>(() => {
    if (id) {
      return {
        uid: `«${id}»`,
        positioner: `${DIALOG_SCOPE}«${id}»positioner`,
        trigger: `${DIALOG_SCOPE}«${id}»trigger`,
        content: `${DIALOG_SCOPE}«${id}»content`,
        closeTrigger: `${DIALOG_SCOPE}«${id}»close-trigger`,
        backdrop: `${DIALOG_SCOPE}«${id}»backdrop`,
      };
    }
    return {};
  }, [id]);

  /**
   * Manage the force mount of the dialog. This is used to ensure that the dialog is mounted even when it is not open.
   */
  const forceMount = useMemo<true | undefined>(() => {
    return unmountOnExit ? undefined : lazyMount ? true : undefined;
  }, [unmountOnExit, lazyMount]);

  /**
   * Handles the opening of the dialog and related state changes.
   */
  const handleOpenDialog = useCallback(() => {
    if (isFirstOpen.current) {
      isFirstOpen.current = false;
    }

    modalRef.current = modal;
    onOpen();
    onOpenChange(true);
  }, [onOpen, onOpenChange, modal]);

  /**
   * Handles the closing of the dialog and related state changes.
   */
  const handleCloseDialog = useCallback(() => {
    modalRef.current = false;

    onClose();
    onOpenChange(false);
  }, [onClose, onOpenChange]);

  /**
   * Handles the initial focus of an element when the dialog is opened.
   */
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

  /**
   * Handles focusing the final element when the dialog is closed.
   */
  const handleFinalElementFocus = useCallback(() => {
    let element: HTMLElement | null = null;
    if (finalFocusElement?.current) {
      element = finalFocusElement.current;
    } else if (restoreFocus) {
      const restoreFocusTarget = document.querySelector(`[data-dialog-restore-focus-target="${ids.uid}"]`) as HTMLElement | null;
      if (restoreFocusTarget) {
        restoreFocusTarget.removeAttribute("data-dialog-restore-focus-target");
        element = restoreFocusTarget;
      }
    }

    if (!element) {
      element = triggerEl.current;
    }
    element?.focus({ preventScroll: true });
  }, [ids.uid, restoreFocus, finalFocusElement]);

  /**
   * Handles visibility of lazy-mounted dialog elements when opening.
   */
  const handleOnOpenLazyMount = useCallback(() => {
    if (forceMount) {
      backdropEl.current?.removeAttribute("hidden");
      positionerEl.current?.removeAttribute("hidden");
      contentEl.current?.removeAttribute("hidden");
    }
  }, [forceMount]);

  /**
   * Handles visibility of lazy-mounted dialog elements when closing.
   */
  const handleOnCloseLazyMount = useCallback(() => {
    if (forceMount) {
      const focusGuards = document.body.querySelectorAll("[data-radix-focus-guard]");
      for (const el of focusGuards) {
        document.body.removeChild(el);
      }
      backdropEl.current?.setAttribute("hidden", "");
      positionerEl.current?.setAttribute("hidden", "");
      contentEl.current?.setAttribute("hidden", "");
    } else {
      backdropEl.current?.parentElement?.removeChild(backdropEl.current);
    }
  }, [forceMount]);

  /**
   * Handles the open state change and manages animation exit and cleanup of the dialog.
   */
  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        handleOpenDialog();
      } else {
        contentEl.current?.setAttribute("data-state", "closed");
        backdropEl.current?.setAttribute("data-state", "closed");
        requestAnimationExit({
          node: contentEl.current,
          callbacks: [handleCloseDialog, onExitComplete],
        });
      }
    },
    [handleOpenDialog, handleCloseDialog, onExitComplete],
  );

  /**
   * Provides the context value for the dialog component.
   */
  const contextValue: DialogContextValue = {
    ids,
    forceMount,
    closeOnEscape,
    positioning,
    variant,
    isFirstOpen: isFirstOpen.current,
    closeOnInteractOutside,
    onEscapeKeyDown,
    onFocusOutside,
    onInteractOutside,
    onPointerDownOutside,
    portalled,
    container,
    role,
    triggerEl,
    positionerEl,
    contentEl,
    backdropEl,
  };

  /**
   * Manages initial focus and mounting when dialog opens.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (restoreFocus && ids.uid) {
          document.activeElement?.setAttribute("data-dialog-restore-focus-target", ids.uid);
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
   * Manages the aria attribute for the dialog elements.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFirstOpen.current) {
        if (isOpen) {
          if (triggerEl.current && contentEl.current) {
            triggerEl.current.setAttribute("aria-controls", contentEl.current.id);
          }
          if (backdropEl.current && positionerEl.current) {
            if (!modalRef.current) {
              backdropEl.current.className = cn(backdropEl.current.className, "-z-10");
            }
            backdropEl.current.setAttribute("data-state", "open");
            positionerEl.current.setAttribute("data-state", "open");
            positionerEl.current.parentElement?.insertBefore(backdropEl.current, positionerEl.current);
          }
        } else {
          backdropEl.current?.setAttribute("data-state", "closed");
          positionerEl.current?.setAttribute("data-state", "closed");
          triggerEl.current?.removeAttribute("aria-controls");
        }
      } else {
        backdropEl.current?.parentElement?.removeChild(backdropEl.current);
      }
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [isOpen]);

  // Add this useEffect to attach/detach wheel event handler
  useEffect(() => {
    // Only attach the wheel event handler when the dialog is open and modal is true
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
        // Prevent scrolling entirely for elements outside dialog content
        event.preventDefault();
        return;
      }

      // For elements inside dialog content, only prevent overscroll
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

  // Handle pointer events for modal dialogs to prevent interaction with background content
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
        // When dialog opens, disable pointer events on body
        document.body.style.setProperty("pointer-events", "none");

        // Apply aria-hiding to all elements except dialog content
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
   * Ensures the dialog has a unique identifier.
   */
  useEffect(() => {
    if (!id) {
      const generatedId = uuid();
      setId(generatedId);
    }
  }, [id]);

  return (
    <DialogProvider value={contextValue}>
      <DialogPrimitive.Dialog modal={false} open={isOpen} onOpenChange={handleOnOpenChange}>
        {children}
      </DialogPrimitive.Dialog>
    </DialogProvider>
  );
};
Dialog.displayName = "Dialog";

/**-----------------------------------------------------------------------------
 * DialogTrigger Component
 * -----------------------------------------------------------------------------
 * Renders a button that triggers the dialog.
 *
 * -----------------------------------------------------------------------------*/
export const DialogTrigger: UixComponent<"button"> = (props) => {
  const { ref, asChild, children, ...remainingProps } = props;

  const { ids, triggerEl } = useDialogContext((state) => ({
    ids: state.ids,
    triggerEl: state.triggerEl,
  }));

  /**
   * Creates a composite ref by combining the internal context ref with any external ref.
   */
  const triggerRef = useMemo(() => composeRefs(triggerEl, ref), [triggerEl, ref]);

  return (
    <DialogPrimitive.Trigger asChild ref={triggerRef} {...remainingProps}>
      <uix.button asChild={asChild} data-scope={DIALOG_SCOPE} data-part="trigger" id={ids?.trigger}>
        {children}
      </uix.button>
    </DialogPrimitive.Trigger>
  );
};
DialogTrigger.displayName = "DialogTrigger";

/**-----------------------------------------------------------------------------
 * DialogTriggerAction Component
 * -----------------------------------------------------------------------------
 * Renders a button that triggers the dialog and closes it when clicked.
 *
 * -----------------------------------------------------------------------------*/
export const DialogTriggerAction: UixComponent<"button"> = (props) => {
  const { asChild, children, ...remainingProps } = props;

  return (
    <DialogPrimitive.Close asChild {...remainingProps}>
      <uix.button asChild={asChild}>{children}</uix.button>
    </DialogPrimitive.Close>
  );
};
DialogTriggerAction.displayName = "DialogTriggerAction";

/**-----------------------------------------------------------------------------
 * DialogClose Component
 * -----------------------------------------------------------------------------
 * Renders a button that closes the dialog.
 *
 * -----------------------------------------------------------------------------*/
export const DialogClose: UixComponent<"button"> = memo((props) => {
  const { asChild, className, children, ...remainingProps } = props;

  const ids = useDialogContext((state) => state.ids);

  /**
   * Renders the close button content.
   */
  const content = useMemo(() => {
    if (asChild) {
      return children;
    }
    return <LuX className={cn("inline-block size-4 min-h-[1lh] shrink-0 align-middle text-[1.2em] text-current leading-[1em]")} />;
  }, [asChild, children]);

  return (
    <DialogPrimitive.Close asChild {...remainingProps}>
      <uix.button
        asChild={asChild}
        className={cn(
          "absolute top-2 right-2 isolate inline-flex h-8 min-w-8 cursor-pointer select-none appearance-none items-center justify-center whitespace-nowrap align-middle",
          className,
        )}
        aria-label="Close dialog"
        data-part="close"
        data-scope={DIALOG_SCOPE}
        id={ids?.closeTrigger}
      >
        {content}
      </uix.button>
    </DialogPrimitive.Close>
  );
});
DialogClose.displayName = "DialogClose";

type DialogContentProp = Pick<DialogProps, "positioning" | "variant">;
/**-----------------------------------------------------------------------------
 * DialogContent Component
 * -----------------------------------------------------------------------------
 * Renders the content of the dialog.
 *
 * -----------------------------------------------------------------------------*/
export const DialogContent: UixComponent<"div", DialogContentProp> = (props) => {
  const {
    ref,
    asChild,
    children,
    className,
    variant: variantProp,
    positioning: positioningProp,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...remainingProps
  } = props;

  const {
    ids,
    forceMount,
    closeOnEscape,
    closeOnInteractOutside,
    portalled,
    contentEl,
    positionerEl,
    container,
    role,
    variant: variantContext,
    isFirstOpen,
    positioningContext,
    onEscapeKeyDownContext,
    onFocusOutsideContext,
    onInteractOutsideContext,
    onPointerDownOutsideContext,
  } = useDialogContext((state) => ({
    ids: state.ids,
    forceMount: state.forceMount,
    closeOnEscape: state.closeOnEscape,
    closeOnInteractOutside: state.closeOnInteractOutside,
    portalled: state.portalled,
    contentEl: state.contentEl,
    positionerEl: state.positionerEl,
    container: state.container,
    role: state.role,
    variant: state.variant,
    isFirstOpen: state.isFirstOpen,
    positioningContext: state.positioning,
    onEscapeKeyDownContext: state.onEscapeKeyDown,
    onFocusOutsideContext: state.onFocusOutside,
    onInteractOutsideContext: state.onInteractOutside,
    onPointerDownOutsideContext: state.onPointerDownOutside,
  }));

  // Preserves callback reference stability across renders.
  const onEscapeKeyDown = useCallbackRef(onEscapeKeyDownContext);
  const onFocusOutside = useCallbackRef(onFocusOutsideContext);
  const onInteractOutside = useCallbackRef(onInteractOutsideContext);
  const onPointerDownOutside = useCallbackRef(onPointerDownOutsideContext);

  /**
   * Determines which variant styling to apply to the dialog.
   */
  const variant = useMemo(() => {
    return variantProp || variantContext || null;
  }, [variantProp, variantContext]);

  /**
   * Cleans up accessibility attributes from the dialog content ensuring proper dialog behavior without redundant accessibility markup.
   */
  const cleanupAccessibilityAttributes = useCallback(
    (node: HTMLDivElement | null) => {
      setTimeout(() => {
        if (node) {
          node.removeAttribute("aria-describedby");
          node.removeAttribute("aria-labelledby");
          const accessibilityEl = node.querySelector(`[data-dialog-undo-accessibility-target="${ids.uid}"]`);
          if (accessibilityEl) {
            node.removeChild(accessibilityEl);
          }

          if (ariaLabelledBy) {
            node.setAttribute("aria-describedby", ariaLabelledBy);
          }

          if (ariaDescribedBy) {
            node.setAttribute("aria-labelledby", ariaDescribedBy);
          }
        }
      }, 1);
    },
    [ids.uid, ariaLabelledBy, ariaDescribedBy],
  );

  /**
   * Creates a memoized composite ref for the dialog content.
   */
  const contentRef = useMemo(() => {
    return composeRefs(cleanupAccessibilityAttributes, contentEl, ref);
  }, [cleanupAccessibilityAttributes, contentEl, ref]);

  /**
   * Calculates and merges positioning options for the dialog.
   */
  const positioning = useMemo(() => {
    const positioning: PositioningOptions = { ...positioningContext, ...positioningProp };
    if (!positioning.offset) {
      positioning.offset = variant === "drawer" ? 0 : variant === "cover" ? 10 : 64;
    }
    if (!positioning.side) {
      positioning.side = variant === "drawer" ? "bottom" : variant === "cover" ? "top" : "top";
    }
    if (!positioning.align) {
      positioning.align = variant === "drawer" ? "start" : variant === "cover" ? "center" : "start";
    }
    return positioning;
  }, [positioningContext, positioningProp, variant]);

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
      if (!closeOnInteractOutside || role === "alertdialog") {
        event.preventDefault();
      }
      onInteractOutside(event);
    },
    [closeOnInteractOutside, onInteractOutside, role],
  );

  /**
   * Injects hidden accessibility markup into dialog content.
   */
  const injectAccessibilityMarkup = useMemo(() => {
    if (asChild && isValidElement(children)) {
      return cloneElement(
        children,
        {},
        <>
          {(children as React.ReactElement<Props>).props.children}
          <div data-dialog-undo-accessibility-target={ids.uid} hidden>
            <DialogPrimitive.Title />
            <DialogPrimitive.Description />
          </div>
        </>,
      );
    }

    const accessibilityMarkup = (
      <>
        {children}
        <div data-dialog-undo-accessibility-target={ids.uid} hidden>
          <DialogPrimitive.Title />
          <DialogPrimitive.Description />
        </div>
      </>
    );

    return (accessibilityMarkup as React.ReactElement<Props>).props.children;
  }, [asChild, children, ids.uid]);

  /**
   * Renders the dialog content element with appropriate styles and attributes.
   */
  let content = (
    <div
      ref={positionerEl}
      className="pointer-events-none fixed inset-0 h-dvh w-screen overflow-auto overscroll-y-none"
      data-part="positioner"
      data-scope={DIALOG_SCOPE}
      id={ids?.positioner}
    >
      <DialogPrimitive.Content
        asChild
        ref={contentRef}
        style={
          {
            pointerEvents: "auto",
            "--content-height": `calc(100dvh - ${positioning.offset}px * 2)`,
            "--content-width": `calc(100dvw - ${positioning.offset}px * 2)`,
            "--content-offset": `${positioning.offset}px`,
          } as React.CSSProperties
        }
        forceMount={!portalled ? forceMount : undefined}
        onOpenAutoFocus={handleAutoFocus}
        onCloseAutoFocus={handleAutoFocus}
        onEscapeKeyDown={handleOnEscapeKeyDown}
        onFocusOutside={onFocusOutside}
        onInteractOutside={handleOnInteractOutside}
        onPointerDownOutside={onPointerDownOutside}
        {...remainingProps}
      >
        <uix.div
          asChild={asChild}
          className={cn(
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 fixed w-full min-w-32 rounded-sm bg-[var(--color-bg)] text-[var(--bg-contrast)] duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",

            !variant &&
              positioning.align === "start" &&
              "data-[state=open]:slide-in-from-top-[0.5rem] data-[state=closed]:slide-out-to-top-[0.5rem] inset-x-0 top-0 mx-auto my-[var(--content-offset)] max-h-[var(--content-height)] max-w-[32rem]",

            !variant &&
              positioning.align === "center" &&
              "data-[state=open]:data-[state=open]:zoom-in-95 data-[state=closed]:data-[state=open]:zoom-out-95 inset-0 m-auto max-h-[var(--content-height)] max-w-[32rem] ",

            !variant &&
              positioning.align === "end" &&
              "data-[state=open]:slide-in-from-bottom-[0.5rem] data-[state=closed]:slide-out-to-bottom-[0.5rem] inset-x-0 bottom-0 mx-auto my-[var(--content-offset)] max-h-[var(--content-height)] max-w-[32rem]",

            variant === "drawer" && "m-[var(--content-offset)] max-h-[var(--content-height)] w-full max-w-[var(--content-width)]",

            variant === "drawer" && positioning.side === "top" && positioning.offset === 0 && "rounded-t-none",
            variant === "drawer" && positioning.side === "bottom" && positioning.offset === 0 && "rounded-b-none",
            variant === "drawer" && positioning.side === "left" && positioning.offset === 0 && "rounded-l-none",
            variant === "drawer" && positioning.side === "right" && positioning.offset === 0 && "rounded-r-none",

            variant === "drawer" &&
              positioning.side === "top" &&
              "data-[state=closed]:slide-out-to-top-[100%] data-[state=open]:slide-in-from-top-[100%] inset-x-0 top-0",
            variant === "drawer" &&
              positioning.side === "bottom" &&
              "data-[state=closed]:slide-out-to-bottom-1 data-[state=open]:slide-in-from-bottom-slide-out-to-bottom-1 inset-x-0 bottom-0",
            variant === "drawer" &&
              positioning.side === "left" &&
              "data-[state=closed]:slide-out-to-left-[100%] data-[state=open]:slide-in-from-left-[100%] inset-y-0 left-0 w-1/3",
            variant === "drawer" &&
              positioning.side === "right" &&
              "data-[state=closed]:slide-out-to-right-[100%] data-[state=open]:slide-in-from-right-[100%] inset-y-0 right-0 w-1/3",

            variant === "cover" && "inset-0 m-[var(--content-offset)] h-full max-h-[var(--content-height)] w-full max-w-[var(--content-width)]",
            variant === "full" && "inset-0 h-full max-h-screen w-full max-w-screen rounded-none",

            className,
          )}
          data-scope={DIALOG_SCOPE}
          data-part="content"
          id={ids?.content}
        >
          {injectAccessibilityMarkup}
        </uix.div>
      </DialogPrimitive.Content>
    </div>
  );

  if (portalled) {
    content = (
      <DialogPrimitive.Portal container={container} forceMount={forceMount}>
        {content}
      </DialogPrimitive.Portal>
    );
  }

  return !isFirstOpen ? content : null;
};
DialogContent.displayName = "DialogContent";

type DialogBackdropProps = {
  children?: never;
};
/**-----------------------------------------------------------------------------
 * DialogBackdrop Component
 * -----------------------------------------------------------------------------
 * Renders a backdrop behind the dialog.
 *
 * -----------------------------------------------------------------------------*/
export const DialogBackdrop: UixComponent<"div", DialogBackdropProps> = (props) => {
  const { asChild, ref, className, children, ...remainingProps } = props;

  const { ids, container, portalled, forceMount, backdropEl } = useDialogContext((state) => ({
    ids: state.ids,
    container: state.container,
    portalled: state.portalled,
    forceMount: state.forceMount,
    backdropEl: state.backdropEl,
  }));

  const backdropRef = useMemo(() => composeRefs(backdropEl, ref), [backdropEl, ref]);

  const content = (
    <uix.div
      ref={backdropRef}
      asChild={asChild}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-black/20 duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in",
        // !modal && "-z-10",
        className,
      )}
      data-scope={DIALOG_SCOPE}
      data-part="backdrop"
      id={ids?.backdrop}
      {...remainingProps}
    >
      {children}
    </uix.div>
  );

  if (portalled) {
    return (
      <DialogPrimitive.Portal container={container} forceMount={forceMount}>
        {content}
      </DialogPrimitive.Portal>
    );
  }

  return content;
};
