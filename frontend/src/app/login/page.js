"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <LanguageProvider>
      <LoginForm />
    </LanguageProvider>
  );
}
