"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, Download, Flame } from "lucide-react";

interface TalismanPopupProps {
  imageUrl: string;
  onClose: () => void;
  title?: string;
  darkMode?: boolean;
  userName?: string;
  createdAt?: string;
  concern?: string;
  translatedPhrase?: string;
}

export default function TalismanPopup({
  imageUrl,
  onClose,
  userName,
  title,
  darkMode = false,
  createdAt,
  concern,
  translatedPhrase,
}: TalismanPopupProps) {
  const t = useTranslations("talisman");
  const [isOpen, setIsOpen] = useState(false);
  const [isUnrolling, setIsUnrolling] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [isBurned, setIsBurned] = useState(false);
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
      setSaveMessage("이미지 저장 중...");

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

        setSaveMessage("이미지가 저장되었습니다.");
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

  // 부적 태우기 함수
  const handleBurnTalisman = () => {
    setIsBurning(true);
  };

  // 부적 태우기 애니메이션 완료 후 실행
  useEffect(() => {
    if (isBurning) {
      const timer = setTimeout(() => {
        alert("내가 잘 처리했다냥!");
        setIsBurned(true);
        setTimeout(() => {
          handleClose();
        }, 500);
      }, 3000); // 애니메이션 지속 시간

      return () => clearTimeout(timer);
    }
  }, [isBurning]);

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
          <X className="w-6 h-6" />
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

            {/* 부적 생성일 표시 */}
            {createdAt && (
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-400" : "text-amber-700"
                }`}
              >
                {createdAt}
              </p>
            )}
          </div>

          {/* 스크롤 내용 */}
          <div className="flex-1 overflow-auto w-full p-4">
            <div className="flex justify-center">
              <div
                className={`relative w-full`}
                style={{
                  aspectRatio: "4/5",
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
                  className={`object-contain rounded-lg transition-all duration-1000 
                    ${
                      isFullyVisible
                        ? "scale-100 filter-none"
                        : "scale-105 blur-sm"
                    }
                    ${isBurning ? "burning-animation" : ""}
                    ${isBurned ? "opacity-0" : ""}`}
                  style={{
                    transform: isFullyVisible
                      ? "translateY(0)"
                      : "translateY(-40%)",
                    transition: "transform 1.5s cubic-bezier(0.33, 1, 0.68, 1)",
                  }}
                />
              </div>
            </div>

            {/* 고민 키워드 (해시태그) */}
            {concern && (
              <div
                className={`mt-4 ${
                  darkMode ? "text-gray-300" : "text-amber-800"
                }`}
              >
                <p className="text-sm font-medium">
                  {t("concernTags", { defaultValue: "고민 키워드" })}:
                </p>
                {concern}
              </div>
            )}

            {/* 부적 설명 */}
            <div
              className={`mt-4 text-center ${
                darkMode ? "text-gray-300" : "text-amber-800"
              }`}
            >
              {translatedPhrase && (
                <p className={`text-md mt-4 px-2 py-1 text-center font-medium`}>
                  {translatedPhrase}
                </p>
              )}
              <p className="mt-4 text-sm">
                {t("bringLuck", {
                  defaultValue: "이 부적을 소지하면 행운이 찾아온다냥~",
                })}
              </p>

              {/* 저장 및 태우기 버튼 */}
              <div className="mt-4 w-full flex justify-center gap-2 pb-6">
                <button
                  onClick={handleSaveImage}
                  className={`
                    flex items-center justify-center space-x-2 px-4 py-2 rounded-full
                    ${
                      darkMode
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }
                    transition-all shadow-md
                  `}
                >
                  <Download className="w-5 h-5" />
                  <span>이미지 저장</span>
                </button>

                <button
                  onClick={handleBurnTalisman}
                  disabled={isBurning || isBurned}
                  className={`
                    flex items-center justify-center space-x-2 px-4 py-2 rounded-full
                    ${
                      darkMode
                        ? "bg-red-700 text-white hover:bg-red-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }
                    ${
                      (isBurning || isBurned) && "opacity-50 cursor-not-allowed"
                    }
                    transition-all shadow-md
                  `}
                >
                  <Flame className="w-5 h-5" />
                  <span>부적 태우기</span>
                </button>
              </div>

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

      <style jsx global>{`
        @keyframes burn {
          0% {
            clip-path: inset(0 0 0 0);
            filter: brightness(1) sepia(0);
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          20% {
            filter: brightness(1.2) sepia(0.3) hue-rotate(10deg);
            transform: scale(1.02) rotate(1deg);
          }
          40% {
            clip-path: polygon(
              20% 0%,
              80% 0%,
              100% 20%,
              100% 80%,
              80% 100%,
              20% 100%,
              0% 80%,
              0% 20%
            );
            filter: brightness(1.3) sepia(0.5) hue-rotate(20deg);
            transform: scale(1.03) rotate(-1deg);
            opacity: 0.9;
          }
          60% {
            clip-path: polygon(
              30% 0%,
              70% 0%,
              100% 30%,
              100% 70%,
              70% 100%,
              30% 100%,
              0% 70%,
              0% 30%
            );
            filter: brightness(1.4) sepia(0.7) hue-rotate(30deg);
            transform: scale(1.01) rotate(2deg);
            opacity: 0.7;
          }
          80% {
            clip-path: polygon(
              40% 0%,
              60% 0%,
              100% 40%,
              100% 60%,
              60% 100%,
              40% 100%,
              0% 60%,
              0% 40%
            );
            filter: brightness(1.6) sepia(0.8) hue-rotate(40deg);
            transform: scale(0.98) rotate(-2deg);
            opacity: 0.4;
          }
          100% {
            clip-path: polygon(
              50% 0%,
              50% 0%,
              100% 50%,
              50% 100%,
              50% 100%,
              50% 100%,
              0% 50%,
              50% 0%
            );
            filter: brightness(1.8) sepia(1) hue-rotate(50deg);
            transform: scale(0.95) rotate(0deg);
            opacity: 0;
          }
        }

        .burning-animation {
          animation: burn 3s forwards;
        }
      `}</style>
    </div>
  );
}
