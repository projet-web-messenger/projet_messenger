"use client";

import { cn } from "@repo/utils/classes";
import { createContext } from "@repo/utils/create-context";
import { type UixComponent, uix } from "../factory";

/**
 * The props of the Link component.
 */
type LinkProps = {
  /**
   * Whether the link is external.
   */
  external?: boolean;
};

type LinkContextValue = {
  extraClassName?: string;
};

/**-----------------------------------------------------------------------------
 * Link Context
 * -----------------------------------------------------------------------------
 * Provides state management for link components.
 *
 * -----------------------------------------------------------------------------*/
const linkContext = createContext<LinkContextValue>({
  strict: true,
  hookName: "useLinkContext",
  providerName: "LinkProvider",
  errorMessage: "useLinkContext: `context` is undefined. Seems you forgot to wrap component within `<LinkProvider />`",
  defaultValue: {},
  name: "LinkContext",
});

const [LinkProvider, useLinkContext] = linkContext;

/**-----------------------------------------------------------------------------
 * Link Component
 * -----------------------------------------------------------------------------
 * Used to provide accessible navigation.
 *
 * -----------------------------------------------------------------------------*/
export const Link: UixComponent<"a", LinkProps> = (props) => {
  const { external, className, ...remainingProps } = props;

  const { extraClassName } = useLinkContext();

  return (
    <uix.a
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 rounded-xs decoration-current/20 underline-offset-3 hover:underline",
        extraClassName,
        className,
      )}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
      {...remainingProps}
    />
  );
};
Link.displayName = "Link";

/**-----------------------------------------------------------------------------
 * Link Component
 * -----------------------------------------------------------------------------
 * Used to wrap elements (cards, blog posts, articles, etc.) in a link.
 *
 * -----------------------------------------------------------------------------*/
export const LinkBox: UixComponent<"div"> = (props) => {
  const { className, children, ...remainingProps } = props;

  // Context value is separated for potential future modifications or extensions.
  const contextValue: LinkContextValue = {
    extraClassName: "relative",
  };

  return (
    <uix.div className={cn("relative", className)} {...remainingProps}>
      <LinkProvider value={contextValue}>{children}</LinkProvider>
    </uix.div>
  );
};
LinkBox.displayName = "LinkBox";

/**-----------------------------------------------------------------------------
 * Link Component
 * -----------------------------------------------------------------------------
 * Used to stretch a link over a container.
 *
 * -----------------------------------------------------------------------------*/
export const LinkOverlay: UixComponent<"a", LinkProps> = (props) => {
  const { children, className, ...remainingProps } = props;

  return (
    <Link
      className={cn("static before:absolute before:inset-0 before:block before:cursor-[inherit] before:content-[''] hover:no-underline", className)}
      {...remainingProps}
    >
      {children}
    </Link>
  );
};
LinkOverlay.displayName = "LinkOverlay";
