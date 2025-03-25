"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  ChatBubbleOvalLeftIcon,
  UserIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useUser } from "@/app/contexts/UserContext";
import { useTranslations } from "next-intl";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isProfileComplete, isLoaded } = useUser();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // 페이지 로드 시 초기 isProfileComplete가 false일 때 바로 리다이렉트하지 않고
  // 프로필 데이터 로드가 완료될 때까지 기다립니다.
  useEffect(() => {
    // 프로필 데이터 로드가 완료된 경우에만 처리
    if (isLoaded) {
      // 초기 로드 상태를 false로 변경
      setIsInitialLoad(false);

      // 프로필 수정 페이지가 아니고, 프로필이 완성되지 않은 경우에만 리다이렉트
      if (!isProfileComplete && !pathname.includes("/profile/edit")) {
        router.push("/profile/edit");
      }
    }
  }, [isProfileComplete, router, isLoaded, pathname]);

  // 프로필 데이터가 로드되지 않은 경우 로딩 표시
  if (isInitialLoad || !isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9]">
        <div className="relative">
          <div className="animate-spin h-12 w-12 border-4 border-[#990dfa] rounded-full border-t-transparent"></div>
          <div className="absolute top-0 left-0 h-12 w-12 animate-ping opacity-20 scale-75 rounded-full bg-[#990dfa]"></div>
        </div>
        <p className="mt-4 text-[#3B2E7E] font-medium">프로필 확인 중...</p>
        <div className="mt-2 flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-[#990dfa] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9] pb-16">
      <main className="flex-grow relative z-1">{children}</main>

      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 w-full bg-white shadow-lg z-10 rounded-t-xl overflow-hidden">
        <div className="max-w-screen-md mx-auto flex justify-around">
          {/* 홈 버튼 */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center p-3 w-1/4 transition-all ${
              pathname === "/"
                ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                : "text-gray-600 hover:bg-[#990dfa]/5"
            }`}
          >
            <HomeIcon
              className={`h-6 w-6 ${
                pathname === "/" ? "text-[#990dfa]" : "text-gray-600"
              }`}
            />
            <span className="text-xs mt-1 font-medium">
              {t("navigation.home")}
            </span>
          </Link>

          {/* 채팅 버튼 */}
          <Link
            href="/chat"
            className={`flex flex-col items-center justify-center p-3 w-1/4 transition-all ${
              pathname.includes("/chat")
                ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                : "text-gray-600 hover:bg-[#990dfa]/5"
            }`}
          >
            <ChatBubbleOvalLeftIcon
              className={`h-6 w-6 ${
                pathname.includes("/chat") ? "text-[#990dfa]" : "text-gray-600"
              }`}
            />
            <span className="text-xs mt-1 font-medium">
              {t("navigation.chat")}
            </span>
          </Link>

          {/* 부적 갤러리 버튼 */}
          <Link
            href="/talisman-gallery"
            className={`flex flex-col items-center justify-center p-3 w-1/4 transition-all ${
              pathname.includes("/talisman-gallery")
                ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                : "text-gray-600 hover:bg-[#990dfa]/5"
            }`}
          >
            <SparklesIcon
              className={`h-6 w-6 ${
                pathname.includes("/talisman-gallery")
                  ? "text-[#990dfa]"
                  : "text-gray-600"
              }`}
            />
            <span className="text-xs mt-1 font-medium">
              {t("navigation.talisman")}
            </span>
          </Link>

          {/* 프로필 버튼 */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center p-3 w-1/4 transition-all ${
              pathname.includes("/profile")
                ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                : "text-gray-600 hover:bg-[#990dfa]/5"
            }`}
          >
            <UserIcon
              className={`h-6 w-6 ${
                pathname.includes("/profile")
                  ? "text-[#990dfa]"
                  : "text-gray-600"
              }`}
            />
            <span className="text-xs mt-1 font-medium">
              {t("navigation.profile")}
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
