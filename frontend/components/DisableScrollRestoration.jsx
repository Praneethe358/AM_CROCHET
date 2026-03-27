"use client";

import { useEffect } from "react";

export default function DisableScrollRestoration() {
  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      if (!window.location.hash) {
        window.scrollTo(0, 0);
      }
    } catch (_) {
      // Ignore browser-specific edge cases.
    }
  }, []);

  return null;
}
