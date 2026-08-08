"use client";

import KudligiLoader from "@/components/ui/KudligiLoader";

/** In-page / gate loading state used across dashboard modules */
export default function PageLoader({
  subKn = "ಸಿದ್ಧವಾಗುತ್ತಿದೆ…",
  subEn = "Preparing…",
  full = false,
}) {
  return (
    <KudligiLoader
      variant={full ? "full" : "block"}
      subKn={subKn}
      subEn={subEn}
    />
  );
}
