import { cn } from "@repo/utils/classes";
import { LuCircleHelp } from "react-icons/lu";
import { type UixComponent, uix } from "../factory";

/**-----------------------------------------------------------------------------
 * Icon
 * -----------------------------------------------------------------------------
 * Used to display an svg icon.
 *
 * @param props - The component props.
 * @returns The Icon component.
 *
 * -----------------------------------------------------------------------------*/
export const Icon: UixComponent<"svg"> = (props) => {
  const { as, children, className, ...remainingProps } = props;

  const Component = as || (children ? "svg" : LuCircleHelp);

  return (
    <uix.svg
      as={Component}
      focusable={false}
      className={cn("inline-block size-[1em] min-h-[1lh] shrink-0 align-middle text-current leading-[1em]", className)}
      {...remainingProps}
    >
      {Component === "svg" ? children : null}
    </uix.svg>
  );
};

Icon.displayName = "Icon";
