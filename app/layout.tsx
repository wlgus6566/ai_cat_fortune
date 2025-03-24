'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "./i18n";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, setLocale] = useState<string>("ko"); // 기본 언어를 한국어로 설정
  
  // 컴포넌트 마운트 시 로컬 스토리지에서 언어 설정 가져오기
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window !== 'undefined') {
      const storedLanguage = localStorage.getItem('language_preference');
      if (storedLanguage) {
        setLocale(storedLanguage);
      }
    }
  }, []);

  return (
    <html lang={locale}>
      <head>
        <title>포춘냥이</title>
        <meta name="description" content="AI-based fortune telling and consultation service" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
          <UserProvider>
            {children}
          </UserProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
