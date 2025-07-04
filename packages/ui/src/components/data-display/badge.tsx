import { type VariantProps, cn, cva } from "@repo/utils/classes";
import type { Props } from "@repo/utils/types";
import { Children, cloneElement, isValidElement } from "react";
import { type UixComponent, uix } from "../factory";

const badgeVariant = cva("", {
  variants: {
    /**
     * The size of the component.
     */
    size: {
      xs: "min-h-4 px-1 text-2xs leading-3",
      sm: "min-h-5 px-1.5 text-xs leading-4",
      md: "min-h-6 px-2 text-sm leading-5",
      lg: "min-h-7 px-2.5 text-sm leading-5",
    },
    /**
     * The variant of the componentĆ
     */
    variant: {
      outline: "border border-current/20",
      solid: "bg-gray-900 text-[var(--bg-contrast)]",
      subtle: "bg-current/15",
      tag: "border border-current/20 bg-current/15",
    },
  },
  defaultVariants: {
    variant: "subtle",
    size: "sm",
  },
});

type BadgeVariant = VariantProps<typeof badgeVariant>;

type BadgeProps = BadgeVariant;

export const Badge: UixComponent<"span", BadgeProps> = (props) => {
  const { children, className, size = "sm", variant, ...remainingProps } = props;

  const content = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const childEl = child as React.ReactElement<Props>;
      return cloneElement(childEl, {
        className: cn(
          size === "xs" && "size-3 text-2xs",
          size === "sm" && "size-3.5 text-xs",
          size === "md" && "size-4 text-sm",
          size === "lg" && "size-5 text-sm",
          childEl.props.className,
        ),
      });
    }
    if (typeof child === "string" || typeof child === "number") {
      return <span className="line-clamp-1 text-wrap">{child}</span>;
    }
    return child;
  });

  return (
    <uix.span className={cn(badgeVariant({ variant, size, className }))} {...remainingProps}>
      {content}
    </uix.span>
  );
};
