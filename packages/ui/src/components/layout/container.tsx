import { cn } from "@repo/utils/classes";
import { type UixComponent, uix } from "../factory";

/**
 * The Container component props.
 */
type ContainerProps = {
  /**
   * Use the centerContent prop to center the content of the container.
   */
  centerContent?: boolean;
  /**
   * Use the fluid prop to make the container stretch to fill the width of its parent.
   */
  fluid?: boolean;
};

/**-----------------------------------------------------------------------------
 * Container Component
 * -----------------------------------------------------------------------------
 * Used to constrain a content's width to the current breakpoint, while keeping it fluid.
 *
 * -----------------------------------------------------------------------------*/
export const Container: UixComponent<"div", ContainerProps> = (props) => {
  const { centerContent, className, fluid, ...remainingProps } = props;

  return (
    <uix.div
      className={cn("relative mx-auto w-full px-4", fluid ? "max-w-full" : "max-w-screen-xl", centerContent && "flex flex-col items-center", className)}
      {...remainingProps}
    />
  );
};

Container.displayName = "Container";
