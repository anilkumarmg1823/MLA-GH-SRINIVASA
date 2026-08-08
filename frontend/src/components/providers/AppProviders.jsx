"use client";

import { GlobalLoaderProvider } from "@/components/ui/GlobalLoaderProvider";

export default function AppProviders({ children }) {
  return <GlobalLoaderProvider>{children}</GlobalLoaderProvider>;
}
