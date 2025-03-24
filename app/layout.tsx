import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./contexts/UserContext";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "./i18n";
import { Providers } from './providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '포춘냥이 - AI 운세',
  description: '개인 맞춤형 AI 운세 상담 서비스',
  icons: {
    icon: '/favicon.ico',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#990dfa',
};

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  variable: "--font-noto-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head />
      <body
        className={`${notoSansKr.variable} antialiased`}
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
