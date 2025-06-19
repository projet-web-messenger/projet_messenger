import { type VariantProps, cn, cva } from "@repo/utils/classes";
import { type UixComponent, uix } from "../factory";

/**
 * The variants of the Float component.
 */
const floatVariants = cva("absolute inline-flex items-center justify-center", {
  variants: {
    /**
     * The placement of the indicator.
     */
    placement: {
      "top-start": "-translate-y-1/2 -translate-x-1/2 inset-[0_auto_auto_0]",
      "top-center": "-translate-x-1/2 -translate-y-1/2 inset-[0_auto_auto_50%]",
      "top-end": "-translate-y-1/2 inset-[0_0_auto_auto] translate-x-1/2",
      "middle-start": "-translate-x-1/2 -translate-y-1/2 inset-[50%_auto_50%_0]",
      "middle-center": "-translate-x-1/2 -translate-y-1/2 inset-[50%_auto_50%_50%]",
      "middle-end": "translate-x-1/2 -translate-y-1/2 inset-[50%_0_50%_auto]",
      "bottom-start": "-translate-x-1/2 inset-[auto_auto_0_auto] translate-y-1/2",
      "bottom-center": "-translate-x-1/2 inset-[auto_auto_0_50%] translate-y-1/2",
      "bottom-end": "inset-[auto_0_0_auto] translate-x-1/2 translate-y-1/2",
    },
  },
  defaultVariants: {
    placement: "top-end",
  },
});

/**
 * The props of the Float component.
 */
export type FloatProps = VariantProps<typeof floatVariants>;

/**-----------------------------------------------------------------------------
 * Float Component
 * -----------------------------------------------------------------------------
 * Used to anchor an element to the edge of a container.
 *
 * -----------------------------------------------------------------------------*/
export const Float: UixComponent<"div", FloatProps> = (props) => {
  const { placement, className, ...remainingProps } = props;

  return <uix.div className={cn(floatVariants({ placement, className }))} {...remainingProps} />;
};

Float.displayName = "Float";
