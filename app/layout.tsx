import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "./i18n";
import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Fortune',
  description: 'AI powered fortune telling application',
};

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <title>포춘냥이</title>
        <meta name="description" content="AI-based fortune telling and consultation service" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <NextIntlClientProvider locale="ko" messages={messages["ko"]}>
            <UserProvider>
              {children}
            </UserProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
