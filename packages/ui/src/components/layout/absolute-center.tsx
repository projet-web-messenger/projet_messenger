import { type VariantProps, cn, cva } from "@repo/utils/classes";
import { type UixComponent, uix } from "../factory";

/**
 * The AbsoluteCenter component variants.
 */
const centerVariants = cva("absolute", {
  variants: {
    /**
     * Use to change the centering axis.
     */
    axis: {
      both: "-translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2",
      horizontal: "-translate-x-1/2 left-1/2",
      vertical: "-translate-y-1/2 top-1/2",
    },
  },
  defaultVariants: {
    axis: "both",
  },
});

/**
 * The AbsoluteCenter component props.
 */
type AbsoluteCenterProps = VariantProps<typeof centerVariants>;

/**-----------------------------------------------------------------------------
 * AbsoluteCenter Component
 * -----------------------------------------------------------------------------
 * Used to horizontally and vertically center an element relative to its parent dimensions.
 *
 * -----------------------------------------------------------------------------*/
export const AbsoluteCenter: UixComponent<"div", AbsoluteCenterProps> = (props) => {
  const { className, axis, ...remainingProps } = props;

  return <uix.div className={cn(centerVariants({ axis, className }))} {...remainingProps} />;
};

AbsoluteCenter.displayName = "AbsoluteCenter";
