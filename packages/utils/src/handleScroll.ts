type Axis = "v" | "h";

const alwaysContainsScroll = (node: Element): boolean =>
  // textarea will always _contain_ scroll inside self. It only can be hidden
  node.tagName === "TEXTAREA";

const elementCanBeScrolled = (node: Element, overflow: "overflowX" | "overflowY"): boolean => {
  if (!(node instanceof Element)) {
    return false;
  }

  const styles = window.getComputedStyle(node);

  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" &&
    // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};

const elementCouldBeVScrolled = (node: HTMLElement): boolean => elementCanBeScrolled(node, "overflowY");
const elementCouldBeHScrolled = (node: HTMLElement): boolean => elementCanBeScrolled(node, "overflowX");

export const locationCouldBeScrolled = (axis: Axis, node: HTMLElement): boolean => {
  const ownerDocument = node.ownerDocument;
  let current = node;

  do {
    // Skip over shadow root
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host as HTMLElement;
    }

    const isScrollable = elementCouldBeScrolled(axis, current);

    if (isScrollable) {
      const [, scrollHeight, clientHeight] = getScrollVariables(axis, current);

      if (scrollHeight > clientHeight) {
        return true;
      }
    }

    current = (current.parentNode as HTMLElement) || null;
  } while (current && current !== ownerDocument.body);

  return false;
};

type SV = [scrollTop: number, scrollHeight: number, clientHeight: number];

const getVScrollVariables = ({ scrollTop, scrollHeight, clientHeight }: HTMLElement): SV => [scrollTop, scrollHeight, clientHeight];
const getHScrollVariables = ({ scrollLeft, scrollWidth, clientWidth }: HTMLElement): SV => [scrollLeft, scrollWidth, clientWidth];

const elementCouldBeScrolled = (axis: Axis, node: HTMLElement): boolean => (axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node));

const getScrollVariables = (axis: Axis, node: HTMLElement) => (axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node));

const getDirectionFactor = (axis: Axis, direction: string | null) =>
  /**
   * If the element's direction is rtl (right-to-left), then scrollLeft is 0 when the scrollbar is at its rightmost position,
   * and then increasingly negative as you scroll towards the end of the content.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
   */
  axis === "h" && direction === "rtl" ? -1 : 1;

export const handleScroll = (axis: Axis, endTarget: HTMLElement, event: Event, sourceDelta: number, noOverscroll: boolean) => {
  const directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  const delta = directionFactor * sourceDelta;

  // find scrollable target
  let target = event.target as HTMLElement | null;
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  const targetInLock = endTarget.contains(target);

  let shouldCancelScroll = false;
  const isDeltaPositive = delta > 0;

  let availableScroll = 0;
  let availableScrollTop = 0;

  do {
    const [position, scroll, capacity] = getScrollVariables(axis, target);

    const elementScroll = scroll - capacity - directionFactor * position;

    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }

    if (target instanceof ShadowRoot) {
      target = target.host as HTMLElement;
    } else {
      target = target.parentNode as HTMLElement;
    }
  } while (
    // portaled content
    (!targetInLock && target !== document.body) ||
    // self content
    (targetInLock && (endTarget.contains(target) || endTarget === target))
  );

  // handle epsilon around 0 (non standard zoom levels)
  if (isDeltaPositive && ((noOverscroll && Math.abs(availableScroll) < 1) || (!noOverscroll && delta > availableScroll))) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && ((noOverscroll && Math.abs(availableScrollTop) < 1) || (!noOverscroll && -delta > availableScrollTop))) {
    shouldCancelScroll = true;
  }

  return shouldCancelScroll;
};
