"use client";

import { useEffect } from "react";

/** Close on Escape; optionally lock body scroll while open */
export function useEscapeKey(open, onClose, { lockScroll = true } = {}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    let prevBody = "";
    let prevHtml = "";
    if (lockScroll && typeof document !== "undefined") {
      prevBody = document.body.style.overflow;
      prevHtml = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (lockScroll && typeof document !== "undefined") {
        document.body.style.overflow = prevBody;
        document.documentElement.style.overflow = prevHtml;
      }
    };
  }, [open, onClose, lockScroll]);
}
