import { Nanum_Gothic, Noto_Sans_KR } from "next/font/google";
import "./style/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { messages } from "./i18n";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 운세",
  description: "AI가 알려주는 당신의 운세",
  icons: {
    icon: "/favicon.ico",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#990dfa",
};

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans",
});

const nanumGothic = Nanum_Gothic({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nanum-gothic",
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
        className={`${notoSansKr.variable} ${nanumGothic.variable} antialiased ${inter.className}`}
      >
        <Providers>
          <NextIntlClientProvider locale="ko" messages={messages["ko"]}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
