import { isObject } from "./guard";

/**
 * Node type constants from the DOM specification.
 * Used for comparing against nodeType properties.
 */
const ELEMENT_NODE: typeof Node.ELEMENT_NODE = 1; // Regular DOM elements
const DOCUMENT_NODE: typeof Node.DOCUMENT_NODE = 9; // Document objects
const DOCUMENT_FRAGMENT_NODE: typeof Node.DOCUMENT_FRAGMENT_NODE = 11; // DocumentFragment including ShadowRoot

/**
 * Checks if a value is an HTMLElement.
 * @param el - The value to check
 * @returns Type guard ensuring the value is an HTMLElement
 */
export const isHTMLElement = (el: unknown): el is HTMLElement => isObject(el) && el.nodeType === ELEMENT_NODE && typeof el.nodeName === "string";

/**
 * Checks if a value is a Document object.
 * @param el - The value to check
 * @returns Type guard ensuring the value is a Document
 */
export const isDocument = (el: unknown): el is Document => isObject(el) && el.nodeType === DOCUMENT_NODE;

/**
 * Checks if a value is a Window object.
 * Window objects have a self-referential window property.
 * @param el - The value to check
 * @returns Type guard ensuring the value is a Window
 */
export const isWindow = (el: unknown): el is Window => isObject(el) && el === el.window;

/**
 * Checks if a value is a VisualViewport object.
 * Used for handling visual viewport API operations.
 * @param el - The value to check
 * @returns Type guard ensuring the value is a VisualViewport
 */
export const isVisualViewport = (el: unknown): el is VisualViewport => isObject(el) && el.constructor.name === "VisualViewport";
export const getNodeName = (node: Node | Window): string => {
  if (isHTMLElement(node)) {
    return node.localName || "";
  }
  return "#document";
};

/**
 * Determines if a node is one of the root elements of a document.
 * @param node - The DOM node to check
 * @returns true if the node is html, body, or document element
 */
export function isRootElement(node: Node): boolean {
  return ["html", "body", "#document"].includes(getNodeName(node));
}

/**
 * Checks if a value is a DOM Node.
 * @param el - The value to check
 * @returns Type guard ensuring the value is a Node
 */
export const isNode = (el: unknown): el is Node => isObject(el) && el.nodeType !== undefined;

/**
 * Checks if a value is a ShadowRoot.
 * Shadow roots are document fragments with a host property.
 * @param el - The value to check
 * @returns Type guard ensuring the value is a ShadowRoot
 */
export const isShadowRoot = (el: unknown): el is ShadowRoot => isNode(el) && el.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in el;

/**
 * Checks if a value is an input element.
 * @param el - The value to check
 * @returns Type guard ensuring the value is an HTMLInputElement
 */
export const isInputElement = (el: unknown): el is HTMLInputElement => isHTMLElement(el) && el.localName === "input";

/**
 * Checks if an element is an anchor with an href attribute.
 * @param el - The element to check
 * @returns Type guard ensuring the element is an HTMLAnchorElement with href
 */
export const isAnchorElement = (el: HTMLElement | null | undefined): el is HTMLAnchorElement => !!el?.matches("a[href]");

/**
 * Determines if an element is visible in the document.
 * An element is considered visible if it has non-zero dimensions.
 * @param el - The node to check for visibility
 * @returns true if the element has visible dimensions
 */
export const isElementVisible = (el: Node) => {
  // First ensure it's an HTMLElement since only those have dimension properties
  if (!isHTMLElement(el)) {
    return false;
  }
  // Check three different ways an element might have dimensions
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
};

/**
 * Regular expression to identify textarea and select elements.
 * Used to quickly match these common editable element types.
 */
const TEXTAREA_SELECT_REGEX = /(textarea|select)/;

/**
 * Determines if a DOM element is editable by the user.
 * Checks various ways an element can accept text input.
 * @param el - Element to check for editability
 * @returns boolean indicating if the element can accept text input
 */
export function isEditableElement(el: HTMLElement | EventTarget | null) {
  // Early return for null/undefined or non-HTMLElements
  if (el == null || !isHTMLElement(el)) {
    return false;
  }

  // Use try/catch since accessing properties on certain elements may throw errors (especially in cross-origin contexts)
  try {
    return (
      // Check if it's an input with text selection capabilities
      (isInputElement(el) && el.selectionStart != null) ||
      // Check if it's a textarea or select element
      TEXTAREA_SELECT_REGEX.test(el.localName) ||
      // Check for contentEditable in three possible forms:
      // 1. The computed property
      el.isContentEditable ||
      // 2. The attribute explicitly set to "true"
      el.getAttribute("contenteditable") === "true" ||
      // 3. The attribute present with empty value (which also means true)
      el.getAttribute("contenteditable") === ""
    );
  } catch {
    // If any errors occur while checking properties, assume it's not editable
    return false;
  }
}

/**
 * Type representing a potential target for DOM containment operations.
 * Can be an HTML element, any event target, or null/undefined.
 */
type Target = HTMLElement | EventTarget | null | undefined;

/**
 * Determines if a parent element contains a child element, even across Shadow DOM boundaries.
 * @param parent - The potential parent element
 * @param child - The potential child element
 * @returns true if parent contains child (or they are the same element)
 */
export function contains(parent: Target, child: Target) {
  // Early return if either element is null/undefined
  if (!parent || !child) {
    return false;
  }

  // Ensure both elements are HTMLElements for proper DOM operations
  if (!isHTMLElement(parent) || !isHTMLElement(child)) {
    return false;
  }

  // Get the root node of the child element for Shadow DOM checks
  const rootNode = child.getRootNode?.();

  // Check case 1: Self-reference (an element always contains itself)
  if (parent === child) {
    return true;
  }

  // Check case 2: Standard DOM containment using native contains() method
  if (parent.contains(child)) {
    return true;
  }

  // Check case 3: Shadow DOM traversal (when child is in a shadow tree)
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    // Walk up through the DOM tree and shadow boundaries
    while (next) {
      if (parent === next) {
        return true;
      }
      // @ts-ignore - TypeScript doesn't fully understand the dual-nature of next.host (for shadow roots) and next.parentNode (for regular DOM)
      next = next.parentNode || next.host;
    }
  }

  // If all checks fail, parent doesn't contain child
  return false;
}

/**
 * Retrieves the Document object associated with a DOM element, window, or node.
 * @param el - The element, window, node, or document to get the document from
 * @returns The associated Document object, or the global document as fallback
 */
export function getDocument(el: Element | Window | Node | Document | null | undefined) {
  // If input is already a Document, return it directly
  if (isDocument(el)) {
    return el;
  }
  // If input is a Window object, return its document property
  if (isWindow(el)) {
    return el.document;
  }
  // Otherwise, try to get the ownerDocument of the element/node or fall back to the global document if element is null/undefined
  return el?.ownerDocument ?? document;
}

/**
 * Gets the documentElement (usually the <html> element) from a given element or context.
 * @param el - The element, node, window, or document to get the document element from
 * @returns The documentElement of the associated document
 */
export function getDocumentElement(el: Element | Node | Window | Document | null | undefined): HTMLElement {
  // First get the document, then return its documentElement property
  return getDocument(el).documentElement;
}

/**
 * Retrieves the Window object associated with a DOM node or document.
 * @param el - The node, shadow root, or document to get the window from
 * @returns The associated Window object, or the global window as fallback
 */
export function getWindow(el: Node | ShadowRoot | Document | null | undefined) {
  // For shadow roots, we need to get the window of the host element
  if (isShadowRoot(el)) {
    return getWindow(el.host);
  }
  // For documents, return the defaultView (window) or fall back to global window
  if (isDocument(el)) {
    return el.defaultView ?? window;
  }
  // For HTML elements, get the window through the ownerDocument
  if (isHTMLElement(el)) {
    return el.ownerDocument?.defaultView ?? window;
  }
  // Fall back to the global window object
  return window;
}

/**
 * Gets the currently active (focused) element, even across Shadow DOM boundaries.
 * @param rootNode - The root document or shadow root to search within
 * @returns The active element, or null if none is focused
 */
export function getActiveElement(rootNode: Document | ShadowRoot): HTMLElement | null {
  // Start with the active element from the root node
  let activeElement = rootNode.activeElement as HTMLElement | null;

  // If active element has shadow root, dig deeper to find the actual focused element
  while (activeElement?.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement as HTMLElement | null;
    // Break recursion if we've reached the deepest level
    if (el === activeElement) {
      break;
    }
    activeElement = el;
  }

  return activeElement;
}

/**
 * Gets the parent node of an element, handling special cases like shadow DOM.
 * @param node - The node to get the parent for
 * @returns The parent node
 */
export function getParentNode(node: Node): Node {
  // HTML element is its own parent (end of traversal)
  if (getNodeName(node) === "html") {
    return node;
  }

  // Handle regular parent nodes, shadow DOM hosts, or document element as fallback
  const result = node.parentNode || (isShadowRoot(node) && node.host) || getDocumentElement(node);

  // If result is a shadow root, return its host instead
  return isShadowRoot(result) ? result.host : result;
}
