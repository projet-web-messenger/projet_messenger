import type { PropsOf } from "@repo/ui/factory";
import { Image as UixImage } from "@repo/ui/media/image";
import type { Assign } from "@repo/utils/types";
import NextImage from "next/image";

export function Image(props: Assign<Omit<PropsOf<typeof UixImage>, "as" | "asChild">, Omit<PropsOf<typeof NextImage>, "src" | "alt">>) {
  const { children, alt, src, ...rest } = props;

  return (
    <UixImage src={src} alt={alt} asChild {...rest}>
      <NextImage src={src} alt={alt as string} />
    </UixImage>
  );
}
