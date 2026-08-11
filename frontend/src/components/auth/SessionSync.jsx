"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "mla_session";
const EPOCH_KEY = "mla_auth_epoch";
const KICKED_KEY = "mla_kicked";
const SEEN_EPOCH_KEY = "mla_seen_epoch";

/**
 * Last-login-wins across tabs.
 * When another tab logs in (or out), this tab is sent to login.
 * Does NOT clear localStorage — that would wipe the winning tab’s session.
 */
export default function SessionSync() {
  const router = useRouter();

  useEffect(() => {
    try {
      sessionStorage.setItem(
        SEEN_EPOCH_KEY,
        localStorage.getItem(EPOCH_KEY) || ""
      );
    } catch {
      /* ignore */
    }

    const onStorage = (e) => {
      if (!e.key || ![SESSION_KEY, EPOCH_KEY].includes(e.key)) return;

      try {
        const nextEpoch = localStorage.getItem(EPOCH_KEY) || "";
        const seen = sessionStorage.getItem(SEEN_EPOCH_KEY) || "";
        if (e.key === EPOCH_KEY && nextEpoch === seen) return;

        sessionStorage.setItem(KICKED_KEY, "1");
        sessionStorage.setItem(SEEN_EPOCH_KEY, nextEpoch);
      } catch {
        /* ignore */
      }

      router.replace("/login?reason=session_replaced");
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [router]);

  return null;
}
