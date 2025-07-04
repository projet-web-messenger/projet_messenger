import { type VariantProps, cn, cva } from "@repo/utils/classes";
import { type UixComponent, uix } from "../factory";

/**
 * The Spinner component variants.
 */
const spinnerVariants = cva("inline-block animate-spin rounded-full border-2 border-current duration-slowest [border-inline-start-color:transparent]", {
  variants: {
    /**
     * Use to change the size of the spinner.
     */
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-8",
      xl: "size-10",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

/**
 * The props for the Spinner component.
 */
type SpinnerProps = VariantProps<typeof spinnerVariants>;

/**-----------------------------------------------------------------------------
 * Spinner Component
 * -----------------------------------------------------------------------------
 * Used to provide a visual cue that an action is processing.
 *
 * -----------------------------------------------------------------------------*/
export const Spinner: UixComponent<"span", SpinnerProps> = (props) => {
  const { className, size, ...remainingProps } = props;

  return <uix.span className={cn(spinnerVariants({ size, className }))} {...remainingProps} />;
};

Spinner.displayName = "Spinner";
