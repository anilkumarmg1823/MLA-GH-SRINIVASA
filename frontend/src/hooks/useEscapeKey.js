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

    let prevOverflow = "";
    if (lockScroll && typeof document !== "undefined") {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      if (lockScroll && typeof document !== "undefined") {
        document.body.style.overflow = prevOverflow;
      }
    };
  }, [open, onClose, lockScroll]);
}
