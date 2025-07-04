"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@repo/utils/classes";
import { type VariantProps, cva } from "@repo/utils/classes";
import { createContext } from "@repo/utils/create-context";
import type { Assign, Props } from "@repo/utils/types";
import { Children, cloneElement, isValidElement } from "react";
import { LuUser } from "react-icons/lu";
import { type PropsOf, type UixComponent, uix } from "../factory";

/**
 * The variants for the Avatar component.
 */
const avatarVariants = cva("relative inline-flex select-none rounded-full align-top font-medium", {
  variants: {
    /**
     * The size of the component
     */
    size: {
      xs: "size-6 text-xs",
      sm: "size-8 text-sm",
      md: "size-10 text-md",
      lg: "size-12 text-lg",
      xl: "size-14 text-xl",
      "2xl": "size-16 text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * The props for the Avatar component.
 */
export type AvatarProps = VariantProps<typeof avatarVariants> & {
  name?: string;
  fallback?: React.ReactNode;
  src?: string;
};

/**-----------------------------------------------------------------------------
 * Avatar Context
 * -----------------------------------------------------------------------------
 * Provides state management for avatar components.
 *
 * -----------------------------------------------------------------------------*/
const avatarContext = createContext<AvatarGroupProps>({
  strict: true,
  hookName: "useAvatarContext",
  providerName: "AvatarProvider",
  errorMessage: "useAvatarContext: `context` is undefined. Seems you forgot to wrap component within `<AvatarProvider />`",
  defaultValue: {},
  name: "AvatarContext",
});

const [AvatarProvider, useAvatarContext] = avatarContext;

/**-----------------------------------------------------------------------------
 * Avatar Component
 * -----------------------------------------------------------------------------
 * Used to represent user profile picture or initials.
 *
 * -----------------------------------------------------------------------------*/
export const Avatar: UixComponent<"img", Assign<PropsOf<typeof AvatarPrimitive.Image>, AvatarProps>> = (props) => {
  const { asChild, children, className, fallback, name, size: sizeProp, style, ...remainingProps } = props;

  const { size: sizeContext, stacking } = useAvatarContext();

  const size = sizeProp || sizeContext;

  const initials = name?.slice(0, 2).toUpperCase();

  const { backgroundColor, color } = name ? stringToColor(name) : { backgroundColor: undefined, color: undefined };

  const defaultFallback = <LuUser className="inline-block size-[1em] min-h-[1lh] shrink-0 align-middle text-2xl text-current leading-[1em]" />;

  const avatarStyle: object = {
    "--avatar-bg": backgroundColor,
    "--avatar-color": color,
    zIndex: stacking ? (stacking === "first-on-top" ? "calc(var(--avatar-group-count) - var(--avatar-group-index))" : "var(--avatar-group-index)") : undefined,
    ...style,
  };

  return (
    <AvatarPrimitive.Root asChild>
      <div
        className={cn(
          avatarVariants({ size }),
          "flex items-center justify-center",
          name ? "bg-[var(--avatar-bg)] text-[var(--avatar-color)]" : "bg-[var(--color-subtle)]",
          stacking && "-ms-3 border-2 border-[var(--color-border)]",
          className,
        )}
        style={avatarStyle}
      >
        <AvatarPrimitive.Image asChild {...remainingProps}>
          <uix.img
            alt={props.alt || name || "Avatar"}
            asChild={asChild}
            className="aspect-landscape size-full rounded-[inherit] object-cover"
            height={props.height || 128}
            src={props.src || undefined}
            width={props.width || 128}
          >
            {asChild ? children : null}
          </uix.img>
        </AvatarPrimitive.Image>
        <AvatarPrimitive.Fallback className={cn("rounded-[inherit] font-medium uppercase leading-none", !name && "")}>
          {initials || fallback || defaultFallback}
        </AvatarPrimitive.Fallback>
        {!asChild ? children : null}
      </div>
    </AvatarPrimitive.Root>
  );
};
Avatar.displayName = AvatarPrimitive.Root.displayName;

export type AvatarGroupProps = Pick<AvatarProps, "size"> & {
  stacking?: "first-on-top" | "last-on-top";
  max?: number;
  fallback?: React.ReactNode;
};

/**-----------------------------------------------------------------------------
 * Avatar Context
 * -----------------------------------------------------------------------------
 * Provides state management for avatar components.
 *
 * -----------------------------------------------------------------------------*/
export const AvatarGroup: UixComponent<"div", AvatarGroupProps> = (props) => {
  const { children, className, fallback: fallbackProp, max, size, stacking = "last-on-top", style, ...remainingProps } = props;

  const groupCount = Children.count(children);

  const remainingCount = groupCount - (max ?? groupCount);

  const fallback = fallbackProp || `+${remainingCount}`;

  const avatarGroupStyle: object = {
    "--avatar-group-count": max ? Math.min(max + 1, groupCount) : groupCount,
    ...style,
  };

  const content = Children.toArray(children)
    .slice(0, max)
    .map((child, index) => {
      if (isValidElement(child)) {
        return cloneElement(child as React.ReactElement<Props>, {
          style: {
            "--avatar-group-index": index,
          },
        });
      }
      return child;
    });

  return (
    <uix.div className={cn("relative isolate inline-flex items-center justify-start", className)} style={avatarGroupStyle} {...remainingProps}>
      <AvatarProvider value={{ size, stacking }}>
        {content}
        {remainingCount > 0 && (
          <Avatar
            fallback={fallback}
            style={
              {
                "--avatar-group-index": groupCount - remainingCount,
              } as object
            }
          />
        )}
      </AvatarProvider>
    </uix.div>
  );
};
AvatarGroup.displayName = "AvatarGroup";

/**
 * Generates a background color and text color based on the provided name.
 * @param name - The name to generate the color from.
 * @returns An object containing the background color and text color.
 */
function stringToColor(name: string) {
  let hash = 0;
  // Loop through each character in the name to generate a hash
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  let backgroundColor = "#";
  // Generate the background color based on the hash
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    backgroundColor += `00${value.toString(16)}`.slice(-2);
  }

  // Determine if the background color is light or dark
  const r = Number.parseInt(backgroundColor.slice(1, 3), 16);
  const g = Number.parseInt(backgroundColor.slice(3, 5), 16);
  const b = Number.parseInt(backgroundColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const color = brightness > 155 ? "#000000" : "#ffffff";

  return { backgroundColor, color };
}
