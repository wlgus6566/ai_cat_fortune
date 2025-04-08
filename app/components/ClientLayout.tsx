"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "../i18n";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState("ko");

  useEffect(() => {
    // 로컬 스토리지에서 언어 설정 확인
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language_preference");
      if (storedLanguage) {
        setLocale(storedLanguage);
      }
    }
  }, []);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale as keyof typeof messages]}
    >
      {children}
    </NextIntlClientProvider>
  );
}
