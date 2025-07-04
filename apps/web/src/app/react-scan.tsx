"use client";

import { isDev } from "@repo/utils/guard";
import { useEffect } from "react";

export function ReactScan() {
  useEffect(() => {
    // Only import and run in development
    if (isDev()) {
      import("react-scan")
        .then(({ scan }) => {
          scan({
            enabled: true,
          });
        })
        .catch((err) => {
          console.error("Failed to load react-scan:", err);
        });
    }
  }, []);

  return null;
}
