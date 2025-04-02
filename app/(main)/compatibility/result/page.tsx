"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCompatibility } from "@/app/context/CompatibilityContext";
import type { CompatibilityResult } from "@/app/lib/openai";
import CircularProgress from "@/app/components/CircularProgress";
import { Heart, Star, Sparkles, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import ShareModal from "@/app/components/ShareModal";

// 카카오 SDK 타입 정의
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: KakaoShareOptions) => void;
      };
    };
  }
}

// 카카오 공유 옵션 타입
interface KakaoShareOptions {
  objectType: string;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons: {
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }[];
}

// 애니메이션 변수
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// 슬라이드 변수
const slideInUp = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// 별 애니메이션
const starVariants = {
  animate: (i: number) => ({
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      delay: i * 0.3,
    },
  }),
};

interface CategoryCardProps {
  title: string;
  score: number;
  children: React.ReactNode;
  delay?: number;
  icon?: React.ReactNode;
  color?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  children,
  delay = 0,
  icon,
  color = "rgba(255, 107, 158, 0.8)",
}) => {
  // 제목이 '음양오행 분석'인 경우 기본적으로 펼쳐진 상태로 초기화
  const [isOpen, setIsOpen] = useState(title === "음양오행 분석");

  return (
    <motion.div
      className="mb-4 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg border border-white/20"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))`,
      }}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay,
          },
        },
      }}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(135deg, ${color}, rgba(255, 255, 255, 0.3))`,
            }}
          >
            {icon || <span className="text-white font-bold">{score}</span>}
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative w-4 h-4 mr-1">
                  <Star
                    className={`w-4 h-4 ${
                      i < Math.round(score / 20)
                        ? "text-yellow-300 fill-yellow-300"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-white/30 rotate-180" : "bg-white/10"
          }`}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <div className="bg-white/10 p-4 rounded-xl text-white border border-white/20">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function CompatibilityResultPage() {
  const router = useRouter();
  const { state } = useCompatibility();
  const [compatibilityData, setCompatibilityData] =
    useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingStage, setLoadingStage] = useState(1); // 3단계 로딩 (1: 초기, 2: 분석중, 3: 완료)
  const [showShareModal, setShowShareModal] = useState(false);

  // 카카오 SDK 초기화
  useEffect(() => {
    // 카카오 SDK 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js";
    // script.integrity =
    //   "sha384-kYPsUbBPlktXsY6/oNHSUDZoTX6+YI51f63jCPENAC7vwVvMUe0JWBZ5t0xk9sUy";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      // Kakao SDK 초기화
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "");
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // 사용자가 입력 데이터 없이 직접 URL 접근했을 경우 리다이렉트
    if (!state.person1.name || !state.person2.name) {
      router.push("/compatibility");
      return;
    }

    // 기본적인 로딩 시간 (UX를 위해)
    const loadingTimer = setTimeout(() => {
      setLoadingStage(2);
    }, 1500);

    // API 호출로 궁합 분석
    const fetchCompatibility = async () => {
      try {
        // API 라우트를 사용하여 서버에서 OpenAI API 호출
        const response = await fetch("/api/compatibility", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            person1: state.person1,
            person2: state.person2,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "궁합 분석 중 오류가 발생했습니다."
          );
        }

        const result = await response.json();
        setCompatibilityData(result);

        // 추가 시간 후 로딩 완료
        setTimeout(() => {
          setLoadingStage(3);
          setLoading(false);
        }, 2000);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "궁합 분석 중 오류가 발생했습니다.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchCompatibility();

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [state, router]);

  // 현재 URL 생성
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";

    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/compatibility?name=${encodeURIComponent(
      state.person1.name
    )}&birthdate=${state.person1.birthdate}&gender=${
      state.person1.gender
    }&birthtime=${state.person1.birthtime}&shared=true`;

    return shareUrl;
  };

  // 링크 복사 기능
  const copyToClipboard = () => {
    const shareUrl = generateShareUrl();
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("링크가 복사되었습니다!");
        setShowShareModal(false);
      })
      .catch((err) => {
        toast.error("링크 복사에 실패했습니다.");
        console.error("링크 복사 실패:", err);
      });
  };

  // 카카오톡 공유하기
  const shareToKakao = () => {
    if (!window.Kakao || !window.Kakao.Share) {
      toast.error("카카오톡 공유 기능을 불러오는데 실패했습니다.");
      return;
    }

    const shareUrl = generateShareUrl();

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "궁합 테스트 결과",
        description: `${state.person1.name}님과 ${state.person2.name}님의 궁합 결과를 확인해보세요!`,
        imageUrl: `${window.location.origin}/compatibility-header.png`, // 프로젝트에 있는 실제 이미지 사용
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "궁합 확인하기",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  // 오행에 따른 이모티콘 반환 함수
  const getElementEmoji = (element?: string) => {
    switch (element) {
      case "목":
        return "🌿"; // 나무, 식물
      case "화":
        return "🔥"; // 불
      case "토":
        return "🏔️"; // 땅, 산
      case "금":
        return "💎"; // 보석, 금속
      case "수":
        return "💧"; // 물방울
      default:
        return "✨"; // 기본값
    }
  };

  // 두 오행 사이의 상생/상극 관계 이모티콘 반환 함수
  const getCompatibilitySymbol = (element1?: string, element2?: string) => {
    // 상생 관계: 목생화, 화생토, 토생금, 금생수, 수생목
    const generatingRelations = [
      { from: "목", to: "화" },
      { from: "화", to: "토" },
      { from: "토", to: "금" },
      { from: "금", to: "수" },
      { from: "수", to: "목" },
    ];

    // 상극 관계: 목극토, 토극수, 수극화, 화극금, 금극목
    const conflictingRelations = [
      { from: "목", to: "토" },
      { from: "토", to: "수" },
      { from: "수", to: "화" },
      { from: "화", to: "금" },
      { from: "금", to: "목" },
    ];

    // 기본값 설정
    if (!element1 || !element2) return "⟷"; // 중립

    // 상생 관계 확인
    if (
      generatingRelations.some((r) => r.from === element1 && r.to === element2)
    ) {
      return "→"; // 상생
    }

    // 역상생 관계 확인
    if (
      generatingRelations.some((r) => r.from === element2 && r.to === element1)
    ) {
      return "←"; // 역상생
    }

    // 상극 관계 확인
    if (
      conflictingRelations.some((r) => r.from === element1 && r.to === element2)
    ) {
      return "⇒"; // 상극
    }

    // 역상극 관계 확인
    if (
      conflictingRelations.some((r) => r.from === element2 && r.to === element1)
    ) {
      return "⇐"; // 역상극
    }

    // 동일 오행 관계
    if (element1 === element2) {
      return "⟺"; // 동일 오행
    }

    return "⟷"; // 중립 관계
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3B2E7E] via-[#5D4A9C] to-[#7057C9] font-gothic flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        {/* Toaster for notifications */}
        <Toaster position="top-center" />

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              onShareKakao={shareToKakao}
              onCopyLink={copyToClipboard}
              title="결과 공유하기"
            />
          )}
        </AnimatePresence>

        <motion.div
          className="w-24 h-28 mb-8 relative"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            y: {
              duration: 2,
              ease: "easeInOut",
            },
          }}
        >
          <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
          <Image
            src="/new_cat_magic.png"
            alt="로딩중"
            width={80}
            height={120}
            className="w-full h-full relative z-10 -rotate-12"
          />
        </motion.div>

        <motion.h2
          className="text-xl font-dodamdodam font-bold mb-6 text-center"
          animate={{
            scale: [1, 1.05, 1],
            textShadow: [
              "0 0 8px rgba(255,255,255,0.5)",
              "0 0 16px rgba(255,255,255,0.8)",
              "0 0 8px rgba(255,255,255,0.5)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {loadingStage === 1
            ? "사주 정보를 확인하고 있어요..."
            : "두 사람의 인연을 분석중입니다..."}
        </motion.h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3B2E7E] via-[#5D4A9C] to-[#7057C9] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* 배경 장식 요소 */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
            custom={i}
            variants={starVariants}
            animate="animate"
          >
            {Math.random() > 0.7 ? "✨" : Math.random() > 0.5 ? "⭐" : "🌟"}
          </motion.div>
        ))}

        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-8 max-w-md w-full border border-white/30">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500 flex items-center justify-center">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              오류가 발생했습니다
            </h2>
          </div>
          <p className="text-center text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push("/compatibility")}
            className="w-full px-6 py-3 rounded-xl bg-white text-[#3B2E7E] font-medium hover:bg-white/90 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/bg_only_sky.png"
          alt="배경이미지"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* 커스텀 헤더 */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-[#3B2E7E]/50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.push("/compatibility")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white ml-2">궁합 결과</h1>
        </div>
      </div>
      <div className="container max-w-md mx-auto px-4 py-6 relative z-10 pb-28">
        {/* 결과 컨테이너 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* 상단 요소: 제목 및 테마 */}
          <motion.div variants={slideInUp} className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {compatibilityData?.magicTitle || "별빛 아래 운명의 실타래"}
            </h1>
            <p className="text-lg opacity-90 bg-white/10 backdrop-blur-sm inline-block px-4 py-1 rounded-full">
              <span className="font-semibold">
                {compatibilityData?.compatibilityTheme || "상생의 기운"}
              </span>
            </p>
          </motion.div>

          {/* 점수 요약 카드 */}
          <motion.div
            variants={slideInUp}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4 text-lg">
                <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-pink-100">
                  {state.person1.name}
                </span>
              </div>
              <motion.div
                className="bg-gradient-to-br from-pink-500 to-red-500 rounded-full p-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Heart className="w-8 h-8 text-white fill-white" />
              </motion.div>
              <div className="ml-4 text-lg">
                <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-pink-100 to-pink-200">
                  {state.person2.name}
                </span>
              </div>
            </div>

            {/* 원형 차트 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 rounded-full opacity-20 blur-xl"
                  style={{
                    background: "linear-gradient(135deg, #FF6B9E, #FFDD94)",
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <CircularProgress
                  percentage={compatibilityData?.score || 83}
                  size={140}
                  strokeWidth={12}
                  color="#FF6B9E"
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-3xl font-bold text-white">
                    {compatibilityData?.score || 83}
                  </span>
                  <span className="block text-sm text-pink-200">점</span>
                </div>
              </div>
            </div>

            <p className="text-center font-medium text-xl text-white">
              {compatibilityData?.summary ||
                "함께 있을수록 더 빛나는 인연이야, 냥~"}
            </p>
          </motion.div>

          {/* 궁합 세부 카드 */}
          <motion.div variants={slideInUp} className="space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Star className="h-5 w-5 text-yellow-300 mr-2 fill-yellow-300" />
              세부 분석
            </h2>
            {/* 음양오행 분석 */}
            <CategoryCard
              title="음양오행 분석"
              score={
                compatibilityData?.details?.yinYangAnalysis?.compatibility
                  ?.compatibilityScore || 91
              }
              delay={0.5}
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              color="rgba(129, 140, 248, 0.8)"
            >
              <div className="space-y-4">
                {/* 음양오행 소개 */}
                <div className="bg-white/30 p-4 rounded-lg text-center">
                  <p className="text-sm italic">
                    ✨ 음양오행은 우주의 모든 만물이 다섯 가지 기운(목/木,
                    화/火, 토/土, 금/金, 수/水)으로 이루어져 있다는 동양
                    철학입니다. 두 사람의 기운이 어떻게 상호작용하는지
                    알아보세요! ✨
                  </p>
                </div>

                {/* Person1 정보 패널 */}
                <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 p-4 rounded-lg border border-white/20 shadow-inner">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                      <span className="text-white text-xl">🌿</span>
                    </div>
                    <h4 className="font-medium text-lg">
                      {state.person1.name}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg text-center">
                      <p className="text-xs opacity-80">오행</p>
                      <p className="text-lg font-semibold">
                        {getElementEmoji(
                          compatibilityData?.details?.yinYangAnalysis?.user
                            ?.element
                        )}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.user
                          ?.element || "목"}
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg text-center">
                      <p className="text-xs opacity-80">음양</p>
                      <p className="text-lg font-semibold">
                        {compatibilityData?.details?.yinYangAnalysis?.user
                          ?.yinYang === "음"
                          ? "☽"
                          : "☀️"}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.user
                          ?.yinYang || "양"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <p className="text-sm">
                      {
                        compatibilityData?.details?.yinYangAnalysis?.user
                          ?.description
                      }
                    </p>
                  </div>
                </div>

                {/* 중앙 연결 화살표 */}
                <div className="flex justify-center items-center relative py-1">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-white/30"></div>
                  <div className="absolute w-10 h-10 bg-pink-500/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10 border border-white/30 shadow-lg">
                    <span className="text-lg">💫</span>
                  </div>
                </div>

                {/* Person2 정보 패널 */}
                <div className="bg-gradient-to-r from-pink-500/30 to-orange-500/30 p-4 rounded-lg border border-white/20 shadow-inner">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center mr-3">
                      <span className="text-white text-xl">🔥</span>
                    </div>
                    <h4 className="font-medium text-lg">
                      {state.person2.name}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/20 p-2 rounded-lg text-center">
                      <p className="text-xs opacity-80">오행</p>
                      <p className="text-lg font-semibold">
                        {getElementEmoji(
                          compatibilityData?.details?.yinYangAnalysis?.partner
                            ?.element
                        )}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.element || "화"}
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg text-center">
                      <p className="text-xs opacity-80">음양</p>
                      <p className="text-lg font-semibold">
                        {compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.yinYang === "음"
                          ? "☽"
                          : "☀️"}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.yinYang || "양"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <p className="text-sm">
                      {
                        compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.description
                      }
                    </p>
                  </div>
                </div>

                {/* 상성 분석 패널 */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-5 rounded-lg border border-white/30 mt-4 shadow-inner">
                  <h4 className="font-medium mb-3 text-center text-lg flex items-center justify-center">
                    <span className="mr-2">✨</span> 두 사람의 상성{" "}
                    <span className="ml-2">✨</span>
                  </h4>

                  <div className="flex justify-center items-center my-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/30 flex items-center justify-center">
                      {getElementEmoji(
                        compatibilityData?.details?.yinYangAnalysis?.user
                          ?.element
                      )}
                    </div>
                    <div className="w-24 h-1 bg-white/30 mx-1 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg">
                        {getCompatibilitySymbol(
                          compatibilityData?.details?.yinYangAnalysis?.user
                            ?.element,
                          compatibilityData?.details?.yinYangAnalysis?.partner
                            ?.element
                        )}
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-pink-600/30 flex items-center justify-center">
                      {getElementEmoji(
                        compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.element
                      )}
                    </div>
                  </div>

                  <div className="bg-white/20 p-4 rounded-lg mb-3">
                    <p className="text-sm mb-3">
                      {
                        compatibilityData?.details?.yinYangAnalysis
                          ?.compatibility?.description
                      }
                    </p>
                  </div>

                  <div className="bg-white/30 p-4 rounded-lg text-center">
                    <p className="text-sm font-medium flex items-center justify-center">
                      <span className="mr-2">🐾</span>
                      {
                        compatibilityData?.details?.yinYangAnalysis
                          ?.compatibility?.catComment
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CategoryCard>
            {/* 성격 궁합 */}
            <CategoryCard
              title="성격 궁합"
              score={
                compatibilityData?.details?.personalityCompatibility?.score ||
                85
              }
              delay={0.1}
              icon={<Sparkles className="h-6 w-6 text-white" />}
              color="rgba(255, 107, 158, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.personalityCompatibility?.analysis}
              </p>
              <div className="bg-white/20 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.personalityCompatibility?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 연애 스타일 */}
            <CategoryCard
              title="연애 스타일"
              score={compatibilityData?.details?.loveStyle?.score || 78}
              delay={0.2}
              icon={<Heart className="h-6 w-6 text-white" />}
              color="rgba(255, 77, 128, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.loveStyle?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.loveStyle?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 갈등 요소 */}
            <CategoryCard
              title="갈등 요소"
              score={compatibilityData?.details?.conflictElements?.score || 67}
              delay={0.3}
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              }
              color="rgba(255, 159, 64, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.conflictElements?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.conflictElements?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 미래 전망 */}
            <CategoryCard
              title="미래 전망"
              score={compatibilityData?.details?.futurePerspective?.score || 88}
              delay={0.4}
              icon={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
              color="rgba(72, 187, 120, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.futurePerspective?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.futurePerspective?.tip}
                </p>
              </div>
            </CategoryCard>
          </motion.div>

          {/* 하단 콘텐츠 */}
          <motion.div
            variants={slideInUp}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-8 border border-white/20"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))`,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🧙‍♂️</span> 전체 조언
            </h3>
            <p className="mb-6 leading-relaxed">
              {compatibilityData?.totalAdvice}
            </p>

            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🐾</span> 고양이의 한마디
            </h3>
            <p className="mb-6 leading-relaxed">
              {compatibilityData?.catComment}
            </p>

            <div className="bg-white/20 p-4 rounded-lg border border-white/10">
              <h3 className="text-md font-bold mb-2 flex items-center">
                <span className="mr-2">🎁</span> 행운 아이템
              </h3>
              <p className="text-sm">{compatibilityData?.luckyItem}</p>
            </div>
            <div className="mt-2 bg-white/20 p-4 rounded-lg border border-white/10">
              <h3 className="text-md font-bold mb-2 flex items-center">
                <span className="mr-2">💑</span> 추천 데이트
              </h3>
              <p className="text-sm">{compatibilityData?.recommendedDate}</p>
            </div>
          </motion.div>

          {/* 하단 버튼 */}
          <motion.div variants={slideInUp} className="text-center mt-8 mb-12">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/compatibility")}
                className="px-8 py-3 bg-white text-[#3B2E7E] rounded-full font-medium shadow-lg hover:bg-opacity-90 transition-all"
              >
                다시 궁합 보기
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-8 py-3 bg-[#3B2E7E] text-white border border-white/30 rounded-full font-medium shadow-lg hover:bg-opacity-90 transition-all"
              >
                결과 공유하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
