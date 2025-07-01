"use client";

import { cn } from "@repo/utils/classes";
import { useEffect, useState } from "react";
import { LuInfo, LuLoader } from "react-icons/lu";
import { type UixComponent, uix } from "../factory";

/**
 * The props for the Image component.
 */
export type ImageProps = {
  src: string;
  alt?: string;
  spinner?: React.ReactElement | null;
  fallback?: React.ReactElement | null;
};

/**-----------------------------------------------------------------------------
 * Image
 * -----------------------------------------------------------------------------
 * Used to display images.
 *
 * -----------------------------------------------------------------------------*/
export const Image: UixComponent<"img", ImageProps> = (props) => {
  const { alt, className, spinner, fallback, ...remainingProps } = props;

  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState(false);

  const altText = alt || getDefaultAlt(props.src);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading((prev) => (prev === undefined ? true : prev));
    }, 50);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (error) {
    return (
      fallback ?? (
        <div
          className={cn(
            "flex aspect-landscape flex-col items-center justify-center p-2",
            className,
            "bg-[var(--color-error)]/10 text-[var(--color-error)] ring-1 ring-[var(--color-error)]/40",
          )}
        >
          <LuInfo className="mb-2 inline-block size-8 min-h-[1lh] shrink-0 align-middle text-current leading-[1em]" />
          <p className="line-clamp-1">Failed to load image</p>
        </div>
      )
    );
  }

  return (
    <>
      <uix.img
        alt={altText}
        className={cn("aspect-landscape object-cover", loading && spinner !== null && "-top-full invisible fixed", className)}
        width={128}
        height={128}
        loading="lazy"
        onLoad={() => {
          setLoading(false);
        }}
        onError={(e) => {
          if (fallback !== null) {
            setError(true);
          }
          setLoading(false);
        }}
        {...remainingProps}
      />

      {loading ? (
        spinner !== undefined ? (
          spinner
        ) : (
          <div className={cn("flex aspect-landscape items-center justify-center bg-[var(--color-subtle)]", className)}>
            <LuLoader className="inline-block size-8 min-h-[1lh] shrink-0 animate-spin align-middle text-current leading-[1em]" />
          </div>
        )
      ) : null}
    </>
  );
};

Image.displayName = "Image";

/**
 * Generates a default alt text for an image based on its filename.
 * @param src - The source URL of the image.
 * @returns The default alt text.
 */
function getDefaultAlt(src: string): string {
  const imageUrl = typeof src === "string" ? src : (src as { src: string }).src;
  const url = new URL(imageUrl, "http://localhost:3000");
  const filename = url.pathname.split("/").pop();
  return filename ? filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Image";
}
