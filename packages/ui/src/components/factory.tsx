import { composeRefs } from "@repo/utils/compose-refs";
import { mergeProps } from "@repo/utils/merge-props";
import type { Assign, Dict, HTMLProps, PropsOf } from "@repo/utils/types";
import { Children, cloneElement, createElement, isValidElement, memo } from "react";

/**
 * Props for polymorphic components, allowing the use of a different element type or child element.
 */
export type PolymorphicProps = {
  /**
   * Use the provided child element as the default rendered element, combining their props and behavior.
   */
  asChild?: boolean;
  /**
   * Specifies the element type to render.
   */
  as?: React.ElementType;
};

/**
 * Merges the props of the component with the props of the "as" component and additional props.
 */
export type MergeWithAs<
  ComponentProps extends object,
  AsComponentProps extends object,
  AdditionalProps extends object = object,
  AsComponent extends React.ElementType = React.ElementType,
> = (Assign<ComponentProps, AdditionalProps> | Assign<AsComponentProps, AdditionalProps>) & {
  /**
   * Specifies the element type to render.
   */
  as?: AsComponent;
};

/**
 * Type for a forward ref exotic component, allowing the use of a different element type or child element.
 */
type ForwardRefExoticComponent<Component extends React.ElementType, Props extends object = object> = {
  <AsComponent extends React.ElementType = "div">(props: MergeWithAs<PropsOf<Component>, PropsOf<AsComponent>, Props, AsComponent>): React.ReactNode;
  displayName?: string;
};

/**
 * Type for JSX elements, allowing the use of a different element type or child element.
 */
type JsxElements = { [E in keyof React.JSX.IntrinsicElements]: UixComponent<E> };

/**
 * Props for HTML elements, allowing the use of a different element type or child element.
 */
export type HTMLUixProps<T extends keyof React.JSX.IntrinsicElements> = HTMLProps<T> & PolymorphicProps;

/**
 * Type for a Uix component, allowing the use of a different element type or child element.
 */
export type UixComponent<E extends React.ElementType, P extends object = object> = ForwardRefExoticComponent<E, Assign<PolymorphicProps, P>>;

/**
 * Props for components, allowing the use of a different element type or child element.
 */
export type UixPropsWithRef<E extends React.ElementType, P extends object = object> = Assign<PropsOf<E>, Assign<PolymorphicProps, P>>;

/**
 * Retrieves the ref from a React element, handling different React versions.
 * @param element - The React element to get the ref from.
 * @returns The ref of the element.
 */
function getRef(element: React.ReactElement) {
  // React <=18 in DEV
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element as Dict).ref;
  }

  // React 19 in DEV
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return (element.props as Dict).ref;
  }

  return (element.props as Dict).ref || (element as Dict).ref;
}

/**
 * Higher-order component that allows a component to render as a different element type or child element.
 * @param Component - The component to enhance.
 * @returns The enhanced component.
 */
const withAsChild = (Component: React.ElementType) => {
  const Comp = (props: UixPropsWithRef<typeof Component>) => {
    const { asChild, as: As, children, ref, ...restProps } = props;

    if (!asChild) {
      const Tag = As || Component;
      return createElement(Tag, { ...restProps, ref }, children);
    }

    const onlyChild: React.ReactNode = Children.only(children);

    if (!isValidElement(onlyChild)) {
      return null;
    }

    const childRef = getRef(onlyChild);

    return cloneElement(onlyChild as React.ReactElement<Dict>, {
      ...mergeProps(restProps, onlyChild.props as object),
      ref: ref ? composeRefs(ref, childRef) : childRef,
    });
  };

  // @ts-expect-error - it exists
  Comp.displayName = Component.displayName || Component.name || `uix.${Component}`;

  return Comp;
};

/**
 * Factory function to create a proxy for JSX elements, allowing the use of a different element type or child element.
 * @returns The proxy for JSX elements.
 */
export const jsxFactory = () => {
  const cache = new Map();

  return new Proxy(withAsChild, {
    apply(_target, _thisArg, argArray) {
      return withAsChild(argArray[0]);
    },
    get(_, element) {
      const asElement = element as React.ElementType;
      if (!cache.has(asElement)) {
        const memoizedComponent = memo(withAsChild(asElement));
        cache.set(asElement, memoizedComponent);
      }
      return cache.get(asElement);
    },
  }) as unknown as JsxElements;
};

/**
 * Proxy for JSX elements, allowing the use of a different element type or child element.
 */
export const uix = jsxFactory();
