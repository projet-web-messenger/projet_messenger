import { cn } from "@repo/utils/classes";
import { mergeProps } from "@repo/utils/merge-props";
import { Children, cloneElement, isValidElement } from "react";
import { type UixComponent, uix } from "../factory";

/**
 * The Stack component props.
 */
type StackProps = {
  /**
   * Use the separator prop to add a separator between the stack items.
   */
  separator?: React.ReactElement;
};

/**-----------------------------------------------------------------------------
 * Stack Component
 * -----------------------------------------------------------------------------
 * Used to layout its children in a vertical or horizontal stack.
 *
 * @param props - The component props.
 * @returns The Stack component.
 *
 * -----------------------------------------------------------------------------*/
export const Stack: UixComponent<"div", StackProps> = (props) => {
  const { children, className, separator, ...remainingProps } = props;

  const count = Children.count(children);

  const content = Children.toArray(children).reduce<React.ReactNode[]>((acc, child, index) => {
    if (index > 0 && separator) {
      const key = `stack-separator-${index}`;
      acc.push(cloneElement(separator, { key }));
    }

    if (isValidElement(child)) {
      const rowStart = index + 1;
      const rowEnd = count + index + 1;
      const colStart = index + 1;
      const colEnd = count * 2 - index;

      acc.push(
        cloneElement(
          child,
          mergeProps(
            {
              style: {
                gridArea: `${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`,
                zIndex: count - index,
              },
            },
            child.props as object,
          ),
        ),
      );
      return acc;
    }

    acc.push(child);
    return acc;
  }, []);

  return (
    <uix.div
      className={cn("inline-grid gap-1", className)}
      style={{
        gridTemplateRows: `${"0px ".repeat(count - 1)}1fr ${"0px ".repeat(count - 1)}`,
        gridTemplateColumns: `${"0px ".repeat(count - 1)}1fr ${"0px ".repeat(count - 1)}`,
      }}
      {...remainingProps}
    >
      {content}
    </uix.div>
  );
};

Stack.displayName = "Stack";
