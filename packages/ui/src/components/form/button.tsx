"use client";

import { type VariantProps, cn, cva } from "@repo/utils/classes";
import { composeRefs } from "@repo/utils/compose-refs";
import { createContext } from "@repo/utils/create-context";
import type { Assign, Props } from "@repo/utils/types";
import { cloneElement } from "react";
import { LuX } from "react-icons/lu";
import { type UixComponent, uix } from "../factory";

/**
 * The variants of the Button component.
 */
const buttonVariants = cva(
  "relative isolate inline-flex shrink-0 cursor-pointer select-none appearance-none items-center justify-center whitespace-nowrap align-middle font-medium transition-colors duration-200",
  {
    variants: {
      size: {
        "2xs": "h-6 min-w-6 gap-1 px-2 text-xs",
        xs: "h-8 min-w-8 gap-1 px-2.5 text-xs",
        sm: "h-9 min-w-9 gap-2 px-3.5 text-sm",
        md: "h-10 min-w-10 gap-2 px-4 text-sm",
        lg: "h-11 min-w-11 gap-3 px-5 text-md",
        xl: "h-12 min-w-12 gap-2.5 px-5 text-md",
      },
      variant: {
        ghost: "rounded-sm bg-current/0 hover:bg-opacity-20 active:bg-opacity-25",
        link: "h-auto min-w-0 rounded-xs p-0 decoration-current/20 underline-offset-3 hover:underline active:opacity-85",
        outline: "rounded-sm border border-current/20 bg-current/0 hover:bg-opacity-20 active:bg-opacity-25",
        solid: "rounded-sm bg-[var(--color-fg)] text-[var(--bg-contrast)] hover:bg-opacity-90 active:bg-opacity-85",
        subtle: "rounded-sm bg-current/15 hover:bg-opacity-20 active:bg-opacity-25",
        unstyled: "h-auto min-w-0 gap-0 px-0 text-inherit",
        plain: "rounded-sm",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "solid",
    },
  },
);

type ButtonVariant = VariantProps<typeof buttonVariants>;

/**
 * The props of the ButtonGroup component.
 */
export type ButtonGroupProps = ButtonVariant & {
  /**
   * If true, the buttons are attached to each other.
   */
  attached?: boolean;
};

/**
 * The props of the Button component.
 */
export type ButtonProps = ButtonVariant & {
  /**
   * Use the loading and loadingText prop to show a loading spinner.
   */
  loading?: boolean;

  /**
   * The text to show when the button is in a loading state.
   */
  loadingText?: string;

  /**
   * The spinner to show when the button is in a loading state.
   */
  spinner?: React.ReactElement;
};

/**-----------------------------------------------------------------------------
 * Dialog Context
 * -----------------------------------------------------------------------------
 * Provides state management for button components.
 *
 * -----------------------------------------------------------------------------*/
const buttonContext = createContext<ButtonVariant>({
  strict: true,
  hookName: "useButtonContext",
  providerName: "ButtonProvider",
  errorMessage: "useButtonContext: `context` is undefined. Seems you forgot to wrap component within `<ButtonProvider />`",
  defaultValue: {},
  name: "ButtonContext",
});

const [ButtonProvider, useButtonContext] = buttonContext;

/**-----------------------------------------------------------------------------
 * Button Component
 * -----------------------------------------------------------------------------
 * Used to trigger an action or event.
 *
 * -----------------------------------------------------------------------------*/
export const Button: UixComponent<"button", ButtonProps> = (props) => {
  const {
    asChild,
    children,
    className,
    disabled: disabledProp,
    loading,
    loadingText,
    ref,
    size: sizeProp = "md",
    spinner: spinnerProp,
    type,
    variant: variantProp = "solid",
    ...remainingProps
  } = props;

  const { size: sizeContext, variant: variantContext } = useButtonContext();

  const size = sizeProp ?? sizeContext;
  const variant = variantProp ?? variantContext;

  const disabled = disabledProp || loading;

  const spinner = spinnerProp;

  const setButtonType = (element: HTMLElement | null) => {
    if (element && element.tagName === "BUTTON") {
      (element as HTMLButtonElement).type = type === undefined ? "button" : type;
    }
  };

  const buttonRef = composeRefs(setButtonType, ref);

  return (
    <uix.button
      ref={buttonRef}
      asChild={asChild}
      className={cn(
        buttonVariants({ size, variant }),
        disabled && "disabled:cursor-not-allowed disabled:opacity-50",
        disabled && variant === "solid" && "disabled:bg-opacity-100",
        disabled && variant === "subtle" && "disabled:bg-opacity-10",
        disabled && variant === "outline" && "disabled:bg-opacity-0",
        disabled && variant === "ghost" && "disabled:bg-opacity-0",
        disabled && variant === "link" && "disabled:no-underline",
        className,
      )}
      disabled={disabled}
      {...remainingProps}
    >
      {loading ? (
        <>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 inline-flex max-w-full items-center px-1">
            {spinner}
            {loadingText ? <span className="overflow-hidden text-ellipsis">{loadingText}</span> : null}
          </div>
          <span className="invisible">{children}</span>
        </>
      ) : (
        children
      )}
    </uix.button>
  );
};
Button.displayName = "Button";

/**-----------------------------------------------------------------------------
 * IconButton Component
 * -----------------------------------------------------------------------------
 * Used to render an icon within a button.
 *
 * -----------------------------------------------------------------------------*/
export const IconButton: UixComponent<"button", Assign<ButtonProps, { icon: React.ReactElement }>> = (props) => {
  const { children, className, icon, size: sizeProp = "md", variant: variantProp = "solid", ...remainingProps } = props;

  const { size: sizeContext, variant: variantContext } = useButtonContext();

  const size = sizeProp || sizeContext;
  const variant = variantProp || variantContext;

  const content = cloneElement(icon as React.ReactElement<Props>, {
    className: cn(
      "text-[1.2em]",
      size === "2xs" && "size-3",
      (size === "xs" || size === "sm") && "size-4",
      (size === "md" || size === "lg") && "size-5",
      size === "xl" && "size-6",
      (icon as React.ReactElement<Props>).props.className,
    ),
  });

  return (
    <Button className={cn("p-0", className)} size={size} variant={variant} {...remainingProps}>
      {content}
      {children}
    </Button>
  );
};
IconButton.displayName = "IconButton";

/**-----------------------------------------------------------------------------
 * CloseButton Component
 * -----------------------------------------------------------------------------
 * Used to trigger close functionality.
 *
 * -----------------------------------------------------------------------------*/
export const CloseButton: UixComponent<"button", ButtonProps> = (props) => {
  const { children, size: sizeProp, variant: variantProp = "ghost", ...remainingProps } = props;

  const { size: sizeContext, variant: variantContext } = useButtonContext();

  const size = sizeProp || sizeContext;
  const variant = variantProp || variantContext;

  return (
    <IconButton icon={<LuX />} size={size} variant={variant} {...remainingProps}>
      <span className="sr-only">Close</span>
    </IconButton>
  );
};
CloseButton.displayName = "CloseButton";

/**-----------------------------------------------------------------------------
 * ButtonGroup Component
 * -----------------------------------------------------------------------------
 * Used to group buttons together.
 *
 * -----------------------------------------------------------------------------*/
export const ButtonGroup: UixComponent<"div", ButtonGroupProps> = (props) => {
  const { attached, size, variant, className, children, ...remainingProps } = props;

  return (
    <uix.div
      data-attached={attached ? "" : undefined}
      // biome-ignore lint/a11y/useSemanticElements: <explanation>
      role="group"
      className={cn("relative isolate inline-flex items-center", attached ? "gap-0" : "flex-wrap gap-2", className)}
      {...remainingProps}
    >
      <ButtonProvider value={{ size, variant }}>{children}</ButtonProvider>
    </uix.div>
  );
};
ButtonGroup.displayName = "ButtonGroup";
