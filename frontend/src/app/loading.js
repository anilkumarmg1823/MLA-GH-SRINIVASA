"use client";

import KudligiLoader from "@/components/ui/KudligiLoader";

/** Next.js route-level loading UI */
export default function Loading() {
  return (
    <KudligiLoader
      variant="full"
      subKn="ಪುಟ ತೆರೆಯುತ್ತಿದೆ…"
      subEn="Opening page…"
    />
  );
}
