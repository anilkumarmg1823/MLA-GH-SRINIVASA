"use client";

import { Suspense } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import LoginForm from "@/components/auth/LoginForm";
import KudligiLoader from "@/components/ui/KudligiLoader";

export default function LoginPage() {
  return (
    <LanguageProvider>
      <Suspense
        fallback={
          <KudligiLoader
            variant="full"
            subKn="ಲೋಡ್ ಆಗುತ್ತಿದೆ…"
            subEn="Loading…"
          />
        }
      >
        <LoginForm />
      </Suspense>
    </LanguageProvider>
  );
}
