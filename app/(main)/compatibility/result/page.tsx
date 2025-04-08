"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCompatibility } from "@/app/context/CompatibilityContext";
import type { CompatibilityResult } from "@/app/lib/openai";
import CircularProgress from "@/app/components/CircularProgress";
import { Heart, Star, Sparkles } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import ShareModal from "@/app/components/ShareModal";
import PageHeader from "@/app/components/PageHeader";
import Lottie from "lottie-react";
import { useSession } from "next-auth/react";

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
  index?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  children,
  delay = 0,
  icon,
  index = 0,
  color = "rgba(255, 107, 158, 0.8)",
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-[#e6e6e6] bg-white"
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
              border: "1px solid rgba(153, 13, 250, 0.2)",
            }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#3B2E7E]">{title}</h3>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative w-4 h-4 mr-1">
                  <Star
                    className={`w-4 h-4 ${
                      i < Math.round(score / 20)
                        ? "text-[#FFD966] fill-[#FFD966]"
                        : "text-gray-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-[#f7f7f7] border border-[#990dfa]/20"
              : "bg-[#f7f7f7] border border-[#990dfa]/20"
          }`}
        >
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 text-[#990dfa] ${
              isOpen ? "rotate-180" : ""
            }`}
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
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="bg-[#F9F5FF] p-4 rounded-xl text-gray-700 border border-[#e6e6e6]">
            {children}
          </div>
        </div>
      )}
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
  const [resultSaved, setResultSaved] = useState(false);
  const { data: session } = useSession();
  const [savedResultId, setSavedResultId] = useState<number | null>(null); // 저장된 결과 ID
  // API 호출 여부를 추적하는 ref 추가
  const hasCalledApi = useRef(false);

  // 로딩 단계에 따른 이미지 반환 함수
  const getLoadingImage = () => {
    switch (loadingStage) {
      case 1:
        return "/new_cat_magic.png";
      case 2:
        return "/new_cat_book.png";
      case 3:
        return "/new_cat_love.png";
      default:
        return "/new_cat_magic.png";
    }
  };

  // 로딩 단계에 따른 메시지 반환 함수
  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 1:
        return "사주 살펴보는 중이야옹…🔍🐱";
      case 2:
        return "궁합 마무리 중이야옹…📜🐾";
      case 3:
        return "운명 정리하는 중…💌🔮";
      default:
        return "사주 살펴보는 중이야옹…🔍🐱";
    }
  };

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

  const [heartAnimationData, setHeartAnimationData] = useState<object | null>(
    null
  );

  // Lottie 애니메이션 로딩
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const heartResponse = await fetch("/lottie/heart2.json");
        const heartData = await heartResponse.json();
        setHeartAnimationData(heartData);
      } catch (error) {
        console.error("Failed to load Lottie animations:", error);
      }
    };

    loadAnimations();
  }, []);

  // useCallback으로 감싸서 메모이제이션
  const fetchCompatibility = useCallback(async () => {
    // 이미 API를 호출했다면 함수 종료
    if (hasCalledApi.current) return;

    try {
      // API 호출 중임을 표시
      hasCalledApi.current = true;

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
        throw new Error(errorData.error || "궁합 분석 중 오류가 발생했습니다.");
      }

      const result = await response.json();
      setCompatibilityData(result);

      // 데이터가 로드된 후 로딩 중지
      setLoading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "궁합 분석 중 오류가 발생했습니다.";
      setError(errorMessage);
      setLoading(false);

      // 에러 발생 시 다시 API 호출 가능하도록 플래그 초기화
      hasCalledApi.current = false;
    }
  }, [state.person1, state.person2]);

  useEffect(() => {
    // 사용자가 입력 데이터 없이 직접 URL 접근했을 경우 리다이렉트
    if (!state.person1.name || !state.person2.name) {
      router.push("/compatibility");
      return;
    }

    // 로딩 단계를 1,2,3을 순환하도록 설정 (추가)
    const stageTimer = setInterval(() => {
      setLoadingStage((prevStage) => (prevStage >= 3 ? 1 : prevStage + 1));
    }, 2000);

    // API 호출로 궁합 분석
    fetchCompatibility();

    // 클린업 함수에서 인터벌 정리
    return () => {
      clearInterval(stageTimer);
    };
  }, [state, router, fetchCompatibility]);

  // useCallback으로 감싸서 메모이제이션
  const saveCompatibilityResult = useCallback(async () => {
    if (!compatibilityData || resultSaved) return;

    try {
      setResultSaved(true);
      const response = await fetch("/api/compatibility-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resultType: "love",
          resultData: compatibilityData,
          person1Name: state.person1.name,
          person1Birthdate: state.person1.birthdate,
          person1Gender: state.person1.gender,
          person1Birthtime: state.person1.birthtime,
          person2Name: state.person2.name,
          person2Birthdate: state.person2.birthdate,
          person2Gender: state.person2.gender,
          person2Birthtime: state.person2.birthtime,
          totalScore: compatibilityData.score,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "결과 저장에 실패했습니다.");
      }

      const responseData = await response.json();
      console.log("저장된 결과:", responseData);

      // 저장된 ID 상태에 저장
      setSavedResultId(responseData.id);

      // API 응답의 resultData에서 shareToken 추출
      const savedShareToken =
        responseData.shareToken ||
        (responseData.resultData && responseData.resultData.shareToken);

      console.log("서버에서 받은 shareToken:", savedShareToken);

      // compatibilityData 상태 업데이트
      if (savedShareToken) {
        setCompatibilityData((prevData) => {
          if (!prevData) return null;
          console.log("compatibilityData 업데이트:", {
            ...prevData,
            shareToken: savedShareToken,
          });
          return {
            ...prevData,
            shareToken: savedShareToken,
          };
        });
      } else {
        console.warn("서버에서 shareToken을 받지 못했습니다");
      }
    } catch (error) {
      console.error("결과 저장 중 오류 발생:", error);
    }
  }, [compatibilityData, resultSaved, state.person1, state.person2]);

  // compatibilityData가 변경될 때만 결과 저장 로직 실행
  useEffect(() => {
    if (compatibilityData && !loading && !error && !resultSaved) {
      saveCompatibilityResult();
    }
  }, [compatibilityData, loading, error, saveCompatibilityResult, resultSaved]);

  // 공유 URL 생성 함수 수정
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";

    const baseUrl = window.location.origin;

    // shareToken 확인 및 로깅
    console.log("현재 compatibilityData:", compatibilityData);
    console.log("공유 토큰:", compatibilityData?.shareToken);

    // shareToken이 있는 경우 /share/[token] 형식의 URL 생성
    if (compatibilityData?.shareToken) {
      const shareUrl = `${baseUrl}/share/${compatibilityData.shareToken}`;
      console.log("생성된 공유 URL:", shareUrl);
      return shareUrl;
    }

    // shareToken이 없으면 기존 방식으로 궁합 페이지 링크 생성
    console.log("shareToken이 없어 기본 URL 생성");
    const userId = session?.user?.id || "anonymous";
    return `${baseUrl}/compatibility?userId=${userId}&shared=true`;
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
    if (!window.Kakao || !window.Kakao.Share || !compatibilityData) {
      toast.error("카카오톡 공유 기능을 불러오는데 실패했습니다.");
      return;
    }

    // 공유 URL 미리 확인
    const shareUrl = generateShareUrl();
    console.log("카카오 공유 전 생성된 URL:", shareUrl);

    try {
      // 로컬환경이면 카카오 공유가 제대로 작동하지 않을 수 있음을 알리기
      if (window.location.hostname === "localhost") {
        toast.error(
          "로컬 환경에서는 카카오 공유가 제대로 작동하지 않을 수 있습니다."
        );
      }

      // 실제 도메인 사용 (개발 환경에서는 배포된 URL로 변경)
      const webUrl = "https://v0-aifortune-rose.vercel.app";
      const realShareUrl = shareUrl.replace(window.location.origin, webUrl);
      console.log("최종 공유 URL:", realShareUrl);

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${state.person1.name}님과 ${state.person2.name}님의 궁합 결과`,
          description: compatibilityData.magicTitle,
          imageUrl: `${window.location.origin}/chemy.png`,
          link: {
            mobileWebUrl: realShareUrl,
            webUrl: realShareUrl,
          },
        },
        buttons: [
          {
            title: "궁합 확인하기",
            link: {
              mobileWebUrl: realShareUrl,
              webUrl: realShareUrl,
            },
          },
        ],
      });
    } catch (error) {
      console.error("카카오 공유 에러:", error);
      toast.error(
        "카카오 공유 중 오류가 발생했습니다. 링크 복사를 이용해 주세요."
      );
    }
  };

  // 오행에 따른 이모티콘 반환 함수
  const getElementEmoji = (element?: string) => {
    switch (element) {
      case "목":
      case "나무":
        return "🌿"; // 나무, 식물
      case "화":
      case "불":
        return "🔥"; // 불
      case "토":
        return "🏔️"; // 땅, 산
      case "금":
        return "💎"; // 보석, 금속
      case "수":
      case "물":
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

  if (loading && !compatibilityData?.magicTitle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
        {/* Toaster for notifications */}
        <Toaster position="bottom-center" />

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

        <div className="flex flex-col items-center justify-center flex-grow p-6 text-center min-h-screen">
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
            <Image
              src={getLoadingImage()}
              alt="로딩중"
              width={80}
              height={120}
              className="w-full h-full relative z-10 -rotate-12"
            />
          </motion.div>

          <motion.h2
            className="text-lg font-gothic font-bold mb-6 text-center text-[#3B2E7E]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={loadingStage} // 메시지 변경시 애니메이션 다시 실행
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            {getLoadingMessage()}
          </motion.h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
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

        <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 max-w-md w-full border border-[#e6e6e6]">
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
            <h2 className="text-xl font-bold text-[#3B2E7E]">
              오류가 발생했습니다
            </h2>
          </div>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/compatibility")}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#990dfa] to-[#7609c1] text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
      {/* Toaster for notifications */}
      <Toaster position="bottom-center" />

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

      {/* 커스텀 헤더 */}
      <PageHeader
        title="궁합 결과"
        className="bg-white shadow-md relative z-10"
      />
      <div className="container max-w-md mx-auto px-4 py-6 relative z-10 pb-28">
        {/* 결과 컨테이너 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* 상단 요소: 제목 및 테마 */}
          <motion.div variants={slideInUp} className="text-center mt-8 mb-32">
            <h1 className="text-2xl font-bold mb-4 px-8 font-gothic text-[#3B2E7E] word-break-keep">
              {compatibilityData?.magicTitle || "너와 나, 우주가 허락한 궁합"}
            </h1>
            <p className="text-lg opacity-90 bg-[#990dfa]/10 inline-block px-4 py-1 rounded-full text-[#990dfa]">
              <span className="font-semibold">
                {compatibilityData?.compatibilityTheme || "상생의 기운"}
              </span>
            </p>
          </motion.div>

          {/* 점수 요약 카드 */}
          <motion.div
            variants={slideInUp}
            className="bg-white relative rounded-2xl p-6 mb-8 border border-[#e6e6e6] shadow-sm"
          >
            <div className="absolute -top-[123px] left-1/2 -translate-x-1/2 -z-1">
              <Image
                src="/new_cat_thumb.png"
                alt="logo"
                width={100}
                height={100}
              />
              {heartAnimationData && (
                <Lottie
                  animationData={heartAnimationData}
                  style={{
                    width: 30,
                    height: 30,
                    position: "absolute",
                    right: "-20%",
                    top: "50%",
                  }}
                />
              )}
            </div>
            {/* 원형 차트 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 rounded-full opacity-20 blur-xl"
                  style={{
                    background:
                      "linear-gradient(135deg,rgb(255, 190, 229),rgb(255, 187, 215))",
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
                  size={150}
                  strokeWidth={10}
                  color="rgb(255, 0, 0)"
                />
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <span className="text-3xl font-bold text-purple-700">
                    {compatibilityData?.score || 83}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="mr-4 text-2xl">
                <span className="font-medium text-[#3B2E7E]">
                  {state.person1.name}
                </span>
              </div>
              <motion.div
                className="bg-gradient-to-br from-[red] to-[red] rounded-full p-2"
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
              <div className="ml-4 text-2xl">
                <span className="font-medium text-[#3B2E7E]">
                  {state.person2.name}
                </span>
              </div>
            </div>

            <p className="text-center font-medium text-md text-[#3B2E7E]">
              {compatibilityData?.summary ||
                "함께 있을수록 더 빛나는 인연이다냥~"}
            </p>
          </motion.div>

          {/* 음양오행 분석 섹션 - 별도 섹션으로 추출 */}
          <motion.div variants={slideInUp} className="mb-24">
            <div className="text-left mb-6">
              <h2 className="text-xl font-bold text-[#3B2E7E]">
                음양오행 분석
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                음양오행은 우주와 만물의 기운을 설명하는 동양 철학으로, 두
                사람의 에너지가 어떻게 상호작용하는지 보여줍니다
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#e6e6e6] shadow-sm overflow-hidden relative">
              {/* 배경 장식 */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#990dfa]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#7609c1]/10 rounded-full blur-3xl"></div>

              {/* 두 사람의 오행 정보 */}
              <div className="flex flex-col md:flex-row gap-4 relative z-10 p-4">
                {/* 첫 번째 사람 카드 */}
                <div className="flex-1 bg-[#e8eaff] rounded-xl p-3 border border-[#e6e6e6] relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-xl">
                      {getElementEmoji(
                        compatibilityData?.details?.yinYangAnalysis?.user
                          ?.element
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-[#3B2E7E]">
                      {state.person1.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <span className="block text-xs text-gray-500">오행</span>
                      <span className="block text-lg font-bold text-[#3B2E7E]">
                        {getElementEmoji(
                          compatibilityData?.details?.yinYangAnalysis?.user
                            ?.element
                        )}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.user
                          ?.element || "목"}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <span className="block text-xs text-gray-500">음양</span>
                      <span className="block text-lg font-bold text-[#3B2E7E]">
                        {compatibilityData?.details?.yinYangAnalysis?.user
                          ?.yinYang === "음"
                          ? "☽"
                          : "☀️"}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.user
                          ?.yinYang || "양"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="font-dodamdodam text-sm text-gray-700">
                      &ldquo;
                      {
                        compatibilityData?.details?.yinYangAnalysis?.user
                          ?.description
                      }
                      &rdquo;
                    </p>
                  </div>
                </div>

                {/* 중앙 상생/상극 관계 표시 */}
                <div className="hidden md:flex flex-col items-center justify-center relative min-w-[100px]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#990dfa]/20 to-[#7609c1]/20 flex items-center justify-center z-10">
                    <div className="text-2xl text-[#990dfa]">
                      {getCompatibilitySymbol(
                        compatibilityData?.details?.yinYangAnalysis?.user
                          ?.element,
                        compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.element
                      )}
                    </div>
                  </div>
                  <div className="absolute w-[2px] h-full bg-gradient-to-b from-[#990dfa]/20 via-[#7609c1]/40 to-[#990dfa]/20"></div>
                </div>

                {/* 두 번째 사람 카드 */}
                <div className="flex-1 bg-[#dceaf5] rounded-xl p-5 border border-[#e6e6e6] relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-xl">
                      {getElementEmoji(
                        compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.element
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-[#3B2E7E]">
                      {state.person2.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <span className="block text-xs text-gray-500">오행</span>
                      <span className="block text-lg font-bold text-[#3B2E7E]">
                        {getElementEmoji(
                          compatibilityData?.details?.yinYangAnalysis?.partner
                            ?.element
                        )}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.element || "화"}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <span className="block text-xs text-gray-500">음양</span>
                      <span className="block text-lg font-bold text-[#3B2E7E]">
                        {compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.yinYang === "음"
                          ? "☽"
                          : "☀️"}{" "}
                        {compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.yinYang || "양"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="font-dodamdodam text-sm text-gray-700">
                      &ldquo;
                      {
                        compatibilityData?.details?.yinYangAnalysis?.partner
                          ?.description
                      }
                      &rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* 상성 분석 결과 */}
              <div className="mt-2 p-5 bg-[#F9F5FF] m-4 rounded-xl border border-[#e6e6e6]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center text-[#3B2E7E]">
                    <span className="mr-2">✨</span> 상성 분석
                  </h3>
                  <div className="bg-white rounded-full px-3 py-1 text-sm text-[#990dfa]">
                    점수:{" "}
                    <span className="font-bold">
                      {compatibilityData?.details?.yinYangAnalysis
                        ?.compatibility?.compatibilityScore || 91}
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-sm text-gray-700">
                  {
                    compatibilityData?.details?.yinYangAnalysis?.compatibility
                      ?.description
                  }
                </p>

                <div className="bg-white rounded-lg p-4 flex items-center">
                  <span className="text-lg mr-2">🐾</span>
                  <p className="text-sm font-dodamdodam text-[#990dfa]">
                    {
                      compatibilityData?.details?.yinYangAnalysis?.compatibility
                        ?.catComment
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 세부 분석 카드들 */}
          <motion.div variants={slideInUp} className="space-y-4">
            <h2 className="text-xl font-bold mb-4 flex items-center text-[#3B2E7E]">
              <Star className="h-5 w-5 text-[#990dfa] mr-2 fill-[#990dfa]" />
              세부 분석
            </h2>
            {/* 성격 궁합 */}
            <CategoryCard
              title="성격 궁합"
              score={
                compatibilityData?.details?.personalityCompatibility?.score ||
                85
              }
              delay={0.1}
              icon={<Sparkles className="h-6 w-6 text-white" />}
              color="rgba(153, 13, 250, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.personalityCompatibility?.analysis}
              </p>
              <div className="bg-[#990dfa]/10 p-3 rounded-lg border border-[#990dfa]/20">
                <p className="text-sm font-dodamdodam font-medium text-[#3B2E7E]">
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
              <div className="bg-[#FF4D80]/10 p-3 rounded-lg border border-[#FF4D80]/20">
                <p className="text-sm font-dodamdodam font-medium text-[#3B2E7E]">
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
              <div className="bg-[#FF9F40]/10 p-3 rounded-lg border border-[#FF9F40]/20">
                <p className="text-sm font-dodamdodam font-medium text-[#3B2E7E]">
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
              <div className="bg-[#48BB78]/10 p-3 rounded-lg border border-[#48BB78]/20">
                <p className="text-sm font-dodamdodam font-medium text-[#3B2E7E]">
                  🐾 {compatibilityData?.details?.futurePerspective?.tip}
                </p>
              </div>
            </CategoryCard>
          </motion.div>

          {/* 하단 콘텐츠 */}
          <motion.div
            variants={slideInUp}
            className="bg-white rounded-2xl p-6 mt-8 border border-[#e6e6e6] shadow-sm"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center text-[#3B2E7E]">
              <span className="mr-2">🧙‍♂️</span> 전체 조언
            </h3>
            <p className="mb-6 leading-relaxed text-gray-700">
              {compatibilityData?.totalAdvice}
            </p>

            <div className="bg-[#F9F5FF] p-4 rounded-lg border border-[#e6e6e6]">
              <h3 className="text-md font-bold mb-2 flex items-center text-[#3B2E7E]">
                <span className="mr-2">🎁</span> 행운 아이템
              </h3>
              <p className="text-sm text-gray-700">
                {compatibilityData?.luckyItem}
              </p>
            </div>
            <div className="mt-2 bg-[#F9F5FF] p-4 rounded-lg border border-[#e6e6e6]">
              <h3 className="text-md font-bold mb-2 flex items-center text-[#3B2E7E]">
                <span className="mr-2">💑</span> 추천 데이트
              </h3>
              <p className="text-sm text-gray-700">
                {compatibilityData?.recommendedDate}
              </p>
            </div>
          </motion.div>
          <motion.div
            variants={slideInUp}
            className="relative text-center mt-8 mb-12 h-[250px]"
          >
            <motion.div
              className="absolute left-10 max-w-[300px] transform -translate-x-1/2 bg-[#FFF7EA] border-[3px] border-[#FFD5A8] rounded-full px-6 py-3 shadow-xl z-10"
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
            >
              <div className="relative">
                <p className="text-[#3B2E7E] text-md text-center font-semibold">
                  {compatibilityData?.catComment}
                </p>
                <div
                  className="absolute -bottom-5 left-1/3 transform -translate-x-1/2 
              w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] 
              border-l-transparent border-r-transparent border-t-[#FFF7EA]"
                ></div>
              </div>
              <span className="mt-5 absolute left-10">
                <Image
                  src="/new_cat.png"
                  alt="냥냥이"
                  width={100}
                  height={100}
                  className=""
                />
              </span>
            </motion.div>
          </motion.div>

          {/* 하단 버튼 */}
          <motion.div variants={slideInUp} className="text-center mt-8 mb-12">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/compatibility")}
                className="px-8 py-3 bg-white text-[#990dfa] border border-[#990dfa] rounded-full font-medium shadow-sm hover:bg-[#F9F5FF] transition-all"
              >
                다시 궁합 보기
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#990dfa] to-[#7609c1] text-white rounded-full font-medium shadow-sm hover:opacity-90 transition-all"
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
