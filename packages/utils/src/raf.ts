/**
 * Schedules a function to run after two animation frames.
 *
 * This creates a more reliable "next tick" that occurs after browser rendering
 * but before the next user interaction, giving the browser time to complete layout.
 *
 * @param fn - The function to execute after two animation frames
 * @returns A cleanup function that cancels all pending animation frames
 */
export function nextTick(fn: VoidFunction) {
  // Set to track all the cleanup functions for cancellation
  const set = new Set<VoidFunction>();

  // Inner function to schedule animation frames and track cancellation
  function raf(fn: VoidFunction) {
    const id = globalThis.requestAnimationFrame(fn);
    set.add(() => globalThis.cancelAnimationFrame(id));
  }

  // Schedule fn to run after two animation frames
  // This ensures it runs after the browser has completed a render cycle
  raf(() => raf(fn));

  // Return a cleanup function that cancels all pending animation frames
  return function cleanup() {
    for (const fn of set) {
      fn();
    }
  };
}

/**
 * Schedules a function to run on the next animation frame.
 *
 * This is a wrapper around requestAnimationFrame that handles cleanup
 * and supports functions that return their own cleanup functions.
 *
 * @param fn - The function to execute on the next animation frame
 * @returns A cleanup function that cancels the animation frame
 */
export function raf(fn: VoidFunction | (() => VoidFunction)) {
  // Variable to store any cleanup function returned by fn
  let cleanup: VoidFunction | undefined | void;

  // Schedule the animation frame
  const id = globalThis.requestAnimationFrame(() => {
    cleanup = fn();
  });

  // Return a function that both cancels the animation frame and runs any cleanup
  return () => {
    globalThis.cancelAnimationFrame(id);
    cleanup?.();
  };
}

/**
 * Races between an event and the next animation frame.
 *
 * Useful for handling cases where you want to do something before an event occurs,
 * but still want to ensure it happens even if the event never fires
 *
 * @param el - The event target (like a DOM element)
 * @param type - The event type to listen for
 * @param cb - The callback to execute
 * @returns A function to cancel the timer
 */
export function queueBeforeEvent(el: EventTarget, type: string, cb: () => void) {
  // Schedule callback to run on next animation frame
  const cancelTimer = raf(() => {
    el.removeEventListener(type, exec, true);
    cb();
  });

  // Event handler that cancels the timer and runs the callback
  const exec = () => {
    cancelTimer();
    cb();
  };

  // Add event listener that will run before the animation frame if event occurs
  el.addEventListener(type, exec, { once: true, capture: true });

  // Return function to cancel the timer if needed
  return cancelTimer;
}
