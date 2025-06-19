import { Avatar as UixAvatar } from "@repo/ui/media/avatar";
import type { Assign, PropsOf } from "@repo/utils/types";
import NextImage from "next/image";

export function Avatar(props: Assign<Omit<PropsOf<typeof UixAvatar>, "as" | "asChild">, Omit<PropsOf<typeof NextImage>, "src" | "alt">>) {
  const { children, src, alt, ...rest } = props;

  return (
    <UixAvatar src={src} alt={alt} asChild {...rest}>
      <NextImage src={src as string} alt={alt as string} />
    </UixAvatar>
  );
}
