"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import KudligiLoader from "@/components/ui/KudligiLoader";

const GlobalLoaderContext = createContext({
  show: () => {},
  hide: () => {},
  withLoader: async (fn) => fn(),
  busy: false,
});

export function useGlobalLoader() {
  return useContext(GlobalLoaderContext);
}

export function GlobalLoaderProvider({ children }) {
  const pathname = usePathname();
  const [manual, setManual] = useState(0);
  const [routeBusy, setRouteBusy] = useState(false);
  const routeTimer = useRef(null);
  const first = useRef(true);

  const show = useCallback(() => setManual((n) => n + 1), []);
  const hide = useCallback(
    () => setManual((n) => Math.max(0, n - 1)),
    []
  );

  const withLoader = useCallback(
    async (fn) => {
      show();
      try {
        return await fn();
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  // Brief branded flash on client navigations (skips first paint)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setRouteBusy(true);
    if (routeTimer.current) clearTimeout(routeTimer.current);
    routeTimer.current = setTimeout(() => setRouteBusy(false), 520);
    return () => {
      if (routeTimer.current) clearTimeout(routeTimer.current);
    };
  }, [pathname]);

  const busy = manual > 0 || routeBusy;

  const value = useMemo(
    () => ({ show, hide, withLoader, busy }),
    [show, hide, withLoader, busy]
  );

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
      {busy ? (
        <KudligiLoader
          variant="overlay"
          subKn="ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ…"
          subEn="Please wait…"
        />
      ) : null}
    </GlobalLoaderContext.Provider>
  );
}
