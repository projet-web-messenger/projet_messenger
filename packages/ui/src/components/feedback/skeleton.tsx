import { type UixComponent, uix } from "@repo/ui/factory";
import { cn } from "@repo/utils/classes";

/**-----------------------------------------------------------------------------
 * Skeleton Component
 * -----------------------------------------------------------------------------
 * Used to render a placeholder while the content is loading.
 *
 * -----------------------------------------------------------------------------*/
export const Skeleton: UixComponent<"div"> = (props) => {
  const { className, style, ...remainingProps } = props;

  const skeletonStyle: React.CSSProperties = {
    backgroundClip: "padding-box",
    backgroundImage: "linear-gradient(270deg, var(--tw-gradient-from), var(--tw-gradient-to), var(--tw-gradient-from))",
    backgroundSize: "400% 100%",
    ...style,
  };

  return (
    <uix.div
      className={cn("pointer-events-none animate-shine select-none rounded-sm from-[var(--color-subtle)] to-[var(--color-muted)] text-transparent", className)}
      style={skeletonStyle}
      {...remainingProps}
    />
  );
};
