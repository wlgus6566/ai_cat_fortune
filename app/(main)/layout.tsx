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
import { TalismanProvider, useTalisman } from "@/app/contexts/TalismanContext";
import TalismanPopup from "@/app/components/TalismanPopup";
import Modal from "@/app/components/Modal";

// TalismanPopupContainer 컴포넌트 - 레이아웃 내부에서 사용
function TalismanPopupContainer() {
  const {
    isOpen,
    imageUrl,
    userName,
    title,
    darkMode,
    closeTalisman,
    translatedPhrase,
    talismanId,
    deleteTalisman,
    onTalismanDeleted,
  } = useTalisman();

  if (!isOpen || !imageUrl) return null;

  // 부적 삭제 핸들러 - 삭제 후 콜백 호출 처리
  const handleBurn = async (id: string) => {
    if (!id) {
      console.warn("Layout: 부적 ID가 없어 삭제할 수 없습니다.");
      return false;
    }

    console.log("Layout: 부적 삭제 핸들러 호출:", id);

    try {
      // onTalismanDeleted 존재 여부 로깅
      if (!onTalismanDeleted) {
        console.warn(
          "Layout: onTalismanDeleted 콜백이 없습니다. 삭제 후 화면이 갱신되지 않을 수 있습니다."
        );
      } else {
        console.log(
          "Layout: onTalismanDeleted 콜백이 존재합니다:",
          typeof onTalismanDeleted
        );
      }

      const success = await deleteTalisman(id);
      console.log("Layout: deleteTalisman 결과:", success);

      // 콜백이 있고 삭제에 성공했다면 setTimeout으로 콜백 호출
      if (success && onTalismanDeleted) {
        console.log("Layout: onTalismanDeleted 콜백 호출 준비");

        // 이벤트 루프의 다음 틱에서 실행하여 상태 업데이트 충돌 방지
        setTimeout(() => {
          console.log("Layout: onTalismanDeleted 콜백 실행");
          onTalismanDeleted(id);
        }, 100);
      }

      return success;
    } catch (error) {
      console.error("Layout: 부적 삭제 오류:", error);
      return false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeTalisman} zIndex={100}>
      <TalismanPopup
        imageUrl={imageUrl}
        onClose={closeTalisman}
        userName={userName}
        title={title}
        translatedPhrase={translatedPhrase}
        darkMode={darkMode}
        talismanId={talismanId}
        onBurn={handleBurn} // 래퍼 함수 전달
      />
    </Modal>
  );
}

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

      // 프로필이 완성되지 않았고, setup 페이지에 있지 않은 경우 리디렉션
      if (
        !isProfileComplete &&
        !pathname?.includes("/setup") &&
        !pathname?.includes("/auth/")
      ) {
        console.log("프로필이 완성되지 않아 setup 페이지로 이동합니다.");
        router.push("/setup");
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
      </div>
    );
  }

  return (
    <TalismanProvider>
      <div className="flex flex-col h-screen pb-16">
        <div className="absolute top-0 left-0 h-[200px] w-full bg-gradient-to-b from-[#e6d0ff] to-[#F9F9F9] "></div>
        <main className="flex-grow relative z-1">{children}</main>

        {isProfileComplete && (
          <nav className="fixed bottom-0 w-full bg-white shadow-lg z-10 rounded-t-xl overflow-hidden">
            <div className="max-w-screen-md mx-auto flex justify-around">
              {/* 홈 버튼 */}
              <Link
                href="/"
                className={`flex flex-col items-center justify-center p-3 w-1/4 transition-all ${
                  pathname === "/fortune"
                    ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                    : "text-gray-600 hover:bg-[#990dfa]/5"
                }`}
              >
                <HomeIcon
                  className={`h-6 w-6 ${
                    pathname === "/fortune" ? "text-[#990dfa]" : "text-gray-600"
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
                  pathname?.includes("/chat")
                    ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                    : "text-gray-600 hover:bg-[#990dfa]/5"
                }`}
              >
                <ChatBubbleOvalLeftIcon
                  className={`h-6 w-6 ${
                    pathname?.includes("/chat")
                      ? "text-[#990dfa]"
                      : "text-gray-600"
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
                  pathname?.includes("/talisman-gallery")
                    ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                    : "text-gray-600 hover:bg-[#990dfa]/5"
                }`}
              >
                <SparklesIcon
                  className={`h-6 w-6 ${
                    pathname?.includes("/talisman-gallery")
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
                  pathname?.includes("/profile")
                    ? "text-[#990dfa] bg-gradient-to-b from-[#990dfa]/10 to-transparent"
                    : "text-gray-600 hover:bg-[#990dfa]/5"
                }`}
              >
                <UserIcon
                  className={`h-6 w-6 ${
                    pathname?.includes("/profile")
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
        )}

        {/* TalismanPopup을 nav와 같은 레벨에 배치 */}
        <TalismanPopupContainer />
      </div>
    </TalismanProvider>
  );
}

export const dynamicParams = true;
