import type { PropsOf } from "@repo/ui/factory";
import { Link as UixLink } from "@repo/ui/navigation/link";
import type { Assign } from "@repo/utils/types";
import NextLink from "next/link";

export function Link(props: Assign<PropsOf<typeof UixLink>, Omit<PropsOf<typeof NextLink>, "as">>) {
  const { children, href, ...rest } = props;
  return (
    <UixLink asChild {...rest}>
      <NextLink href={href}>{children}</NextLink>
    </UixLink>
  );
}
