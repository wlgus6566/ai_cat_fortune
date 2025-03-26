"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface TalismanPopupProps {
  imageUrl: string;
  onClose: () => void;
  title?: string;
  darkMode?: boolean;
  userName?: string;
}

export default function TalismanPopup({
  imageUrl,
  onClose,
  userName,
  title,
  darkMode = false,
}: TalismanPopupProps) {
  const t = useTranslations("talisman");
  const [isOpen, setIsOpen] = useState(false);
  const [isUnrolling, setIsUnrolling] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    // Animation sequence starts when popup is mounted
    const timer1 = setTimeout(() => {
      setIsOpen(true); // Show popup background
    }, 100);

    const timer2 = setTimeout(() => {
      // 전체 팝업에 흔들림 효과 적용
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }, 500);

    const timer3 = setTimeout(() => {
      // 흔들림 효과 후에 두루마기 펼치기 애니메이션 시작
      setIsUnrolling(true); // Start unrolling the scroll
    }, 1000);

    const timer4 = setTimeout(() => {
      setIsFullyVisible(true); // Fully unrolled state
    }, 1500);

    // Cleanup timers on unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Handle close animation
  const handleClose = () => {
    setIsFullyVisible(false);
    setIsUnrolling(false);
    setTimeout(() => {
      setIsOpen(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 500);
  };

  // 이미지 저장 함수
  const handleSaveImage = async () => {
    try {
      setSaveMessage(t("saving", { defaultValue: "이미지 저장 중..." }));

      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok)
        throw new Error(
          t("saveFailed", { defaultValue: "이미지 저장에 실패했습니다." })
        );

      const blob = await response.blob();

      // 브라우저가 download API를 지원하는지 확인
      if ("download" in HTMLAnchorElement.prototype) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `talisman_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSaveMessage(
          t("saved", { defaultValue: "이미지가 저장되었습니다." })
        );
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        // Fallback for browsers that don't support the download attribute
        window.open(imageUrl, "_blank");
        setSaveMessage(
          t("saveNewTab", {
            defaultValue:
              "새 탭에서 이미지를 열었습니다. 길게 눌러 저장해주세요.",
          })
        );
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      console.error("이미지 저장 실패:", error);
      setSaveMessage(
        t("saveFailed", { defaultValue: "이미지 저장에 실패했습니다." })
      );
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // 부적 제목 생성
  const getTalismanTitle = () => {
    if (title) return title;
    if (userName)
      return `${userName}${t("yourName", { defaultValue: "의 행운 부적" })}`;
    return t("lucky", { defaultValue: "행운의 부적" });
  };

  return (
    <div
      className={`transition-opacity duration-300
        ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className={`relative overflow-hidden transition-all duration-500 ease-in-out transform
          ${isOpen ? "scale-100" : "scale-95"}
          ${isShaking ? "animate-shake" : ""}`}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          perspective: "1000px",
          width: "100%",
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className={`absolute top-2 right-2 z-50 p-2 rounded-full flex items-center justify-center
            ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-800 hover:bg-gray-100"
            }
            shadow-lg transition-all`}
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 두루마기 배경 효과 */}
        <div
          className={`
            relative 
            ${darkMode ? "bg-gray-800" : "bg-amber-50"}
            shadow-2xl 
            rounded-xl 
            overflow-hidden 
            transition-all 
            duration-1000 
            ease-in-out
            flex
            flex-col
            items-center
            ${isUnrolling ? "h-auto" : "h-0"}
            ${isFullyVisible ? "opacity-100" : "opacity-0"}
          `}
          style={{
            minHeight: isUnrolling ? "50vh" : "0",
            maxHeight: "90vh",
            width: "100%",
            maxWidth: "400px",
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
            transform: `rotateX(${isUnrolling ? "0" : "60deg"})`,
            transformOrigin: "top",
          }}
        >
          {/* 부적 타이틀 */}
          <div
            className={`w-full text-center py-4 border-b ${
              darkMode ? "border-gray-700" : "border-amber-200"
            }`}
          >
            <h2
              className={`font-bold text-xl ${
                darkMode ? "text-white" : "text-amber-800"
              }`}
            >
              {getTalismanTitle()}
            </h2>
          </div>

          {/* 스크롤 내용 */}
          <div className="flex-1 overflow-auto w-full p-4">
            <div className="flex justify-center">
              <div
                className={`relative w-full`}
                style={{
                  aspectRatio: "9/16",
                  maxWidth: "350px",
                  maxHeight: "80vh",
                  overflow: "hidden",
                }}
              >
                {/* 두루마기 위에서 펼쳐지는 애니메이션 배경 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${
                    darkMode ? "from-gray-800" : "from-amber-50"
                  } to-transparent z-20 transition-all duration-1500`}
                  style={{
                    transform: isFullyVisible ? "scaleY(0)" : "scaleY(1)",
                    transformOrigin: "top",
                    transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
                  }}
                ></div>

                <Image
                  src={imageUrl}
                  alt={"행운의 부적"}
                  fill
                  quality={90}
                  className={`object-contain rounded-lg transition-all duration-1000 ${
                    isFullyVisible
                      ? "scale-100 filter-none"
                      : "scale-105 blur-sm"
                  }`}
                  style={{
                    transform: isFullyVisible
                      ? "translateY(0)"
                      : "translateY(-40%)",
                    transition: "transform 1.5s cubic-bezier(0.33, 1, 0.68, 1)",
                  }}
                />
              </div>
            </div>

            {/* 부적 설명 */}
            <div
              className={`mt-4 text-center ${
                darkMode ? "text-gray-300" : "text-amber-800"
              }`}
            >
              <p className="text-sm">
                {t("bringLuck", {
                  defaultValue: "이 부적을 소지하면 행운이 찾아옵니다.",
                })}
              </p>

              {/* 저장 버튼 */}
              <button
                onClick={handleSaveImage}
                className={`mt-4 px-4 py-2 rounded-md ${
                  darkMode
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                } transition-colors duration-200 flex items-center mx-auto`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("saveButton", { defaultValue: "저장하기" })}
              </button>

              {/* 저장 메시지 */}
              {saveMessage && (
                <div
                  className={`mt-2 text-sm ${
                    saveMessage.includes("실패")
                      ? "text-red-500"
                      : darkMode
                      ? "text-green-400"
                      : "text-green-600"
                  }`}
                >
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
