import { isHTMLElement } from "./node";

type ElementGetter = () => Element | null;

const fps = 1000 / 60; // Approximately 16.67ms - polling at 60fps

/**
 * Waits for an element to appear in the DOM and then executes a callback
 * @param query A function that attempts to retrieve the desired element
 * @param cb The callback function to execute once the element is found
 * @returns A cleanup function that cancels the waiting process if needed
 */
export function waitForElement(query: ElementGetter, cb: (el: HTMLElement) => void) {
  // Try to get the element immediately first - it might already be available
  const el = query();
  if (isHTMLElement(el)) {
    // Element found immediately, execute callback right away
    cb(el);
    // Return a no-op cleanup function since no interval was created
    return () => void 0;
  }

  // Set up polling if element wasn't found immediately
  const timeId = setInterval(() => {
    // Attempt to get the element on each interval tick
    const el = query();
    // Check if element exists and is actually connected to the DOM
    if (isHTMLElement(el) && el.isConnected) {
      // Element found and connected, execute callback
      cb(el);
      // Stop polling as we found what we needed
      clearInterval(timeId);
    }
  }, fps); // Using the fps constant (1000/60 ≈ 16.67ms) for smooth polling

  // Return a cleanup function that can be called to stop waiting
  // This is useful when component unmounts or when waiting is no longer needed
  return () => clearInterval(timeId);
}

/**
 * Takes an array of element getter functions and a callback to run when each element is found
 * @param queries An array of element getter functions
 * @param cb A callback to run when each element is found
 * @returns A cleanup function to cancel all waiting operations
 */
export function waitForElements(queries: ElementGetter[], cb: (el: HTMLElement) => void) {
  // Array to store all the cleanup functions returned by individual waitForElement calls
  const cleanups: VoidFunction[] = [];

  // Iterate through each element query function
  for (const query of queries) {
    // Set up waiting for this specific element
    // The same callback will be executed for each element when found
    const clean = waitForElement(query, cb);

    // Store the cleanup function for later use
    cleanups.push(clean);
  }

  // Return a master cleanup function that will cancel all waiting operations
  return () => {
    // When called, execute all stored cleanup functions
    for (const fn of cleanups) {
      fn();
    }
  };
}
