import { getDocument, getParentNode, getWindow, isHTMLElement, isRootElement, isVisualViewport } from "./node";

/**
 * Type definition for overflow ancestors
 * Represents elements that can create scrollable contexts in the DOM
 */
export type OverflowAncestor = Array<VisualViewport | Window | HTMLElement | null>;

/**
 * Finds the nearest ancestor element that creates a scrollable context.
 * @param el - The starting node to search from
 * @returns The nearest overflow ancestor element or document.body if none found
 */
export function getNearestOverflowAncestor(el: Node): HTMLElement {
  // Get the parent node of the current element
  const parentNode = getParentNode(el);

  // If we've reached a root element (html, body, document),
  // return the document body as the default overflow container
  if (isRootElement(parentNode)) {
    return getDocument(parentNode).body;
  }

  // If the parent is an HTML element and has overflow properties set,
  // we've found our nearest overflow ancestor
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }

  // If we haven't found an overflow ancestor yet,
  // continue the search up the DOM tree recursively
  return getNearestOverflowAncestor(parentNode);
}

/**
 * Collects all overflow ancestors of a given HTML element.
 * This function builds a complete list of all elements that create scrollable contexts
 * from a starting element up to the window.
 *
 * @param el - The HTML element to find overflow ancestors for
 * @param list - Optional array to accumulate results (used for recursion)
 * @returns Array of all overflow ancestors including Window and VisualViewport
 */
export function getOverflowAncestors(el: HTMLElement, list: OverflowAncestor = []): OverflowAncestor {
  // First, find the nearest ancestor that creates a scrollable context
  const scrollableAncestor = getNearestOverflowAncestor(el);

  // Check if we've reached the document body (top-level scrollable container)
  const isBody = scrollableAncestor === el.ownerDocument.body;

  // Get the Window object associated with this ancestor
  const win = getWindow(scrollableAncestor);

  if (isBody) {
    // If we've reached the body, we're at the top of the scrollable hierarchy
    // Return the accumulated list plus:
    // 1. The window object (which can scroll)
    // 2. The visual viewport (for mobile pinch-zoom contexts)
    // 3. The body element itself (only if it actually has overflow)
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
  }

  // If we haven't reached the body yet, continue the recursion:
  // 1. Add the current scrollable ancestor to our accumulated list
  // 2. Find all overflow ancestors of the current ancestor (recursive call)
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []));
}

/**
 * Gets the rectangular dimensions of various DOM container types.
 *
 * This utility function returns a standardized rectangle object for different
 * viewport containers: DOM elements, Window object, or VisualViewport object.
 *
 * @param el - The element or viewport to get dimensions for
 * @returns A rectangle object with top, left, bottom, right coordinates
 */
const getElementRect = (el: HTMLElement | Window | VisualViewport) => {
  // For regular DOM elements, use the standard getBoundingClientRect method
  if (isHTMLElement(el)) {
    return el.getBoundingClientRect();
  }

  // For VisualViewport (mobile pinch-zoom context),
  // return a rectangle starting at origin (0,0) with viewport dimensions
  if (isVisualViewport(el)) {
    return { top: 0, left: 0, bottom: el.height, right: el.width };
  }

  // For Window object, return a rectangle starting at origin (0,0)
  // with dimensions matching the browser window's inner dimensions
  return { top: 0, left: 0, bottom: el.innerHeight, right: el.innerWidth };
};

/**
 * Determines if an HTML element is fully visible within the viewport of an ancestor.
 *
 * This function checks if an element is completely within the visible boundaries
 * of a specified ancestor element or viewport container. It's useful for
 * determining if scrolling is needed to make an element fully visible.
 *
 * @param el - The element to check visibility for
 * @param ancestor - The container element or viewport to check against
 * @returns boolean - True if the element is fully visible within the ancestor's viewport
 */
export function isInView(el: HTMLElement | Window | VisualViewport, ancestor: HTMLElement | Window | VisualViewport) {
  // If the element isn't an actual HTML element (e.g., it's Window or VisualViewport),
  // we consider it to be always in view
  if (!isHTMLElement(el)) {
    return true;
  }

  // Get the rectangular boundaries of the ancestor viewport
  const ancestorRect = getElementRect(ancestor);

  // Get the rectangular boundaries of the element we're checking
  const elRect = el.getBoundingClientRect();

  // Check if the element is completely within the ancestor's boundaries:
  // 1. The element's top edge must be at or below the ancestor's top edge
  // 2. The element's left edge must be at or to the right of the ancestor's left edge
  // 3. The element's bottom edge must be at or above the ancestor's bottom edge
  // 4. The element's right edge must be at or to the left of the ancestor's right edge
  return elRect.top >= ancestorRect.top && elRect.left >= ancestorRect.left && elRect.bottom <= ancestorRect.bottom && elRect.right <= ancestorRect.right;
}

/**
 * Regular expression to match CSS overflow property values that create scrollable contexts
 * Includes: auto, scroll, overlay, hidden, and clip
 */
const OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/;

/**
 * Determines if an HTML element creates a scrollable context based on its CSS properties.
 * @param el - The HTML element to check
 * @returns boolean - True if the element creates a scrollable context
 */
export function isOverflowElement(el: HTMLElement): boolean {
  // Get the window object associated with this element (handles cross-frame scenarios)
  const win = getWindow(el);

  // Retrieve the computed CSS properties related to overflow and display
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el);

  // An element is considered an overflow element if:
  // 1. Any of its overflow properties (overflow, overflowX, overflowY) match the overflow pattern
  //    (auto, scroll, overlay, hidden, or clip)
  // 2. AND its display is not "inline" or "contents" (which don't create scrollable contexts)
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}

/**
 * Extended options for scrolling operations.
 * Extends the standard ScrollIntoViewOptions with a root element reference.
 *
 * @property rootEl - The container element that serves as the scrolling context
 *                    If null, the document scrolling context is used
 */
export interface ScrollOptions extends ScrollIntoViewOptions {
  rootEl: HTMLElement | null;
}

/**
 * Determines if an HTML element has content that exceeds its visible dimensions.
 * An element is considered scrollable when its content is larger than its viewport.
 * @param el - The HTML element to check for scrollability
 * @returns boolean - True if the element has overflow content in either dimension
 */
function isScrollable(el: HTMLElement): boolean {
  // An element is scrollable if either:
  // 1. Its scroll height exceeds its client height (vertical scrolling possible)
  // 2. Its scroll width exceeds its client width (horizontal scrolling possible)
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}

/**
 * Scrolls an element into view within a specified container.
 *
 * This function extends the standard Element.scrollIntoView() method by adding
 * support for a specific container element as the scrolling context. It also
 * includes validation to ensure scrolling only happens when necessary.
 *
 * @param el - The element to scroll into view
 * @param options - Optional configuration including the root container and standard scroll options
 * @returns void
 */
export function scrollIntoView(el: HTMLElement | null | undefined, options?: ScrollOptions): void {
  // Destructure the options to separate our custom rootEl from standard scroll options
  const { rootEl, ...scrollOptions } = options || {};

  // Early return if we don't have a valid element or root container
  if (!el || !rootEl) {
    return;
  }

  // Check if the root element is actually capable of scrolling:
  // 1. It must have overflow CSS properties that create a scrollable context
  // 2. It must have content that exceeds its dimensions (actually needs scrolling)
  if (!isOverflowElement(rootEl) || !isScrollable(rootEl)) {
    return;
  }

  // If all conditions are met, perform the actual scroll operation
  // using the browser's built-in scrollIntoView method with the provided options
  el.scrollIntoView(scrollOptions);
}

/**
 * Interface representing scroll position coordinates.
 * Provides a standardized way to track both horizontal and vertical scroll positions.
 */
export interface ScrollPosition {
  /** Horizontal scroll position in pixels from the left edge */
  scrollLeft: number;
  /** Vertical scroll position in pixels from the top edge */
  scrollTop: number;
}

/**
 * Gets the current scroll position from either an HTML element or Window object.
 *
 * This utility normalizes the way scroll position is retrieved across different
 * types of scrollable containers. For HTML elements, it uses scrollLeft/scrollTop
 * properties, while for Window objects it uses scrollX/scrollY.
 *
 * @param element - The scrollable element or window to get scroll position from
 * @returns A ScrollPosition object with normalized scrollLeft and scrollTop values
 */
export function getScrollPosition(element: HTMLElement | Window): ScrollPosition {
  // For DOM elements, use their direct scroll properties
  if (isHTMLElement(element)) {
    return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop };
  }

  // For Window objects, use the window-specific scroll properties
  // Note: scrollX/scrollY are aliases for pageXOffset/pageYOffset
  return { scrollLeft: element.scrollX, scrollTop: element.scrollY };
}

/**
 * Interface for tracking mouse position relative to an element
 */
export interface MousePosition {
  /** Horizontal position relative to element's left edge */
  x: number;
  /** Vertical position relative to element's top edge */
  y: number;
  /** Whether the mouse is inside the element */
  isInside: boolean;
}

/**
 * Options for mouse overflow tracking
 */
export interface MouseOverflowOptions {
  /** Grace area in pixels outside the element that still counts as "inside" */
  threshold?: number;
  /** Whether to continue tracking when mouse leaves the element */
  trackOutside?: boolean;
  /** Callback when mouse enters the element */
  onEnter?: (position: MousePosition) => void;
  /** Callback when mouse moves within or near the element */
  onMove?: (position: MousePosition) => void;
  /** Callback when mouse leaves the element (beyond threshold) */
  onLeave?: (position: MousePosition) => void;
}

/**
 * Tracks mouse position relative to an element, with configurable overflow behavior
 *
 * @param element - The element to track mouse position against
 * @param options - Configuration options for tracking behavior
 * @returns A cleanup function that removes event listeners when called
 */
export function trackMouseOverflow(element: HTMLElement, options: MouseOverflowOptions = {}) {
  const { threshold = 0, trackOutside = false, onEnter, onMove, onLeave } = options;

  // Store tracking state
  let isCurrentlyInside = false;

  // Calculate mouse position relative to element
  const calculatePosition = (e: MouseEvent): MousePosition => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if mouse is inside element or within threshold
    const withinXThreshold = x >= -threshold && x <= rect.width + threshold;
    const withinYThreshold = y >= -threshold && y <= rect.height + threshold;
    const isInside = withinXThreshold && withinYThreshold;

    return { x, y, isInside };
  };

  // Event handlers
  const handleMouseEnter = (e: MouseEvent) => {
    const position = calculatePosition(e);
    isCurrentlyInside = true;
    onEnter?.(position);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const position = calculatePosition(e);
    onMove?.(position);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    const position = calculatePosition(e);
    isCurrentlyInside = false;
    onLeave?.(position);

    // If we're not tracking outside, remove the document mousemove listener
    if (!trackOutside && documentListener) {
      document.removeEventListener("mousemove", documentMouseMove);
      documentListener = false;
    }
  };

  // For tracking outside the element when needed
  let documentListener = false;
  const documentMouseMove = (e: MouseEvent) => {
    // Only process if we're tracking outside or cursor is within threshold
    const position = calculatePosition(e);

    if (position.isInside && !isCurrentlyInside) {
      // Re-entering the element or threshold area
      isCurrentlyInside = true;
      onEnter?.(position);
    } else if (!position.isInside && isCurrentlyInside) {
      // Leaving the element or threshold area
      isCurrentlyInside = false;
      onLeave?.(position);

      // If we're not tracking outside, remove listener
      if (!trackOutside) {
        document.removeEventListener("mousemove", documentMouseMove);
        documentListener = false;
      }
    }

    // Always call move handler when tracking
    onMove?.(position);
  };

  // Add event listeners
  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseleave", handleMouseLeave);

  // If tracking outside, add document listener
  if (trackOutside) {
    document.addEventListener("mousemove", documentMouseMove);
    documentListener = true;
  }

  // Return cleanup function
  return () => {
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseleave", handleMouseLeave);

    if (documentListener) {
      document.removeEventListener("mousemove", documentMouseMove);
    }
  };
}
