"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to check if a component is mounted.
 *
 * This hook uses the `useEffect` hook to set the `mounted` state to `true`
 * after the component has been mounted, effectively allowing components to
 * know when they are mounted or hydrated on the client side.
 *
 * @returns {boolean} The `mounted` state, which is `true` after the component mounts,
 *                                and `false` before mounting.
 *
 * @see https://react.dev/reference/react/useEffect for more information on useEffect.
 */
export const useMounted = (): boolean => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};
