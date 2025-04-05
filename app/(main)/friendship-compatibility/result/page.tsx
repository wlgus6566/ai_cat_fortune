"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useFriendCompatibility } from "@/app/context/FriendCompatibilityContext";
import type { FriendCompatibilityResult } from "@/app/lib/openai";
import CircularProgress from "@/app/components/CircularProgress";
import {
  Heart,
  Star,
  Sparkles,
  ArrowLeft,
  Smile,
  Gift,
  Coffee,
  Zap,
  Brain,
  Share2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import ShareModal from "@/app/components/ShareModal";
import PageHeader from "@/app/components/PageHeader";
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

// 별 애니메이션

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
  color = "rgba(153, 13, 250, 0.8)",
  index = 0,
}) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <motion.div
      className="mb-4 rounded-2xl overflow-hidden shadow-sm border border-[#e6e6e6] bg-white"
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
              border: "1px solid rgba(153, 13, 250, 0.2)",
            }}
          >
            {icon || <span className="text-[#3B2E7E] font-bold">{score}</span>}
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
            isOpen ? "bg-[#F9F5FF] rotate-180" : "bg-[#F9F5FF]"
          } border border-[#990dfa]/20`}
        >
          <svg
            className="w-5 h-5 text-[#990dfa]"
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
            <div className="bg-[#F9F5FF] p-4 rounded-xl text-gray-700 border border-[#e6e6e6]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 서버 액션 타입 정의
interface FriendshipData {
  person1: {
    name: string;
    birthdate: string;
    gender: "남" | "여";
    birthtime: string;
  };
  person2: {
    name: string;
    birthdate: string;
    gender: "남" | "여";
    birthtime: string;
  };
}

// 서버 액션 fetch 함수
async function fetchFriendCompatibilityAnalysis(data: FriendshipData) {
  try {
    const response = await fetch("/api/friendship-compatibility", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("API 호출 중 오류가 발생했습니다.");
    }

    return await response.json();
  } catch (error) {
    console.error("API 호출 중 오류:", error);
    throw error;
  }
}

// 점수별 닉네임과 고양이 첨언
const SCORE_NICKNAME_MAP = [
  {
    score: 10,
    nickname: "🐾 다른 세상에서 온 듯한 우리",
    catComment: "다르지만 그래서 더 기억에 남는 조합이라냥.",
  },
  {
    score: 20,
    nickname: "🧩 서로를 아직 배우는 중인 사이",
    catComment: "익숙하진 않아도, 알아가려는 게 중요하다옹~",
  },
  {
    score: 30,
    nickname: "🌱 서서히 싹트는 느린 우정",
    catComment: "시간이 쌓일수록 더 자연스러워지는 관계라냥.",
  },
  {
    score: 40,
    nickname: "🍵 말은 없어도 편안한 온도",
    catComment: "같이 있는 것만으로도 차분해지는 사이다옹.",
  },
  {
    score: 50,
    nickname: "🌤 흐림과 맑음이 공존하는 친구",
    catComment: "완벽하진 않아도 함께 있으면 나쁘지 않다냥.",
  },
  {
    score: 60,
    nickname: "🌙 달처럼 멀지만 정 있는 사이",
    catComment: "항상 가깝진 않아도 마음은 은은히 이어진다냥.",
  },
  {
    score: 70,
    nickname: "🔗 느슨하지만 단단한 연결",
    catComment: "틈이 있어도 그게 오히려 우리를 편하게 해준다냥.",
  },
  {
    score: 80,
    nickname: "🌻 보면 기분 좋아지는 친구",
    catComment: "가끔만 봐도 에너지 받는 그런 관계라옹~",
  },
  {
    score: 90,
    nickname: "🍀 말 안 해도 마음이 닿는 사이",
    catComment: "고양이도 눈빛만 봐도 아는 그런 느낌이라냥!",
  },
  {
    score: 100,
    nickname: "✨ 운명처럼 맞아떨어지는 찐친",
    catComment: "함께 있는 게 가장 자연스러운 친구라옹~",
  },
];

export default function FriendshipCompatibilityResultPage() {
  const router = useRouter();
  const { state } = useFriendCompatibility();
  const [friendCompatibilityData, setFriendCompatibilityData] =
    useState<FriendCompatibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(1); // 3단계 로딩 (1: 초기, 2: 분석중, 3: 완료)
  const [error, setError] = useState("");
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
        return "/friend.png";
      case 2:
        return "/friend2.png";
      case 3:
        return "/friend3.png";
      default:
        return "/friend.png";
    }
  };

  // 로딩 단계에 따른 메시지 반환 함수
  const getLoadingMessage = () => {
    switch (loadingStage) {
      case 1:
        return "사주 살펴보는 중이야옹…🔍🐱";
      case 2:
        return "친구 궁합 분석 중이야옹…📜🐾";
      case 3:
        return "친구 관계 파악 중...🧩";
      default:
        return "사주 살펴보는 중이야옹…🔍🐱";
    }
  };

  // 카카오 SDK 초기화
  useEffect(() => {
    // 카카오 SDK 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js";
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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 친구 궁합 데이터 로드
  useEffect(() => {
    // 로딩 단계를 1,2,3을 순환하도록 설정 (추가)
    const stageTimer = setInterval(() => {
      setLoadingStage((prevStage) => (prevStage >= 3 ? 1 : prevStage + 1));
    }, 2000);
    const loadFriendCompatibilityData = async () => {
      if (!state.person1.name || !state.person2.name) {
        setError("입력된 정보가 없습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }
      // 이미 API를 호출했다면 함수 종료
      if (hasCalledApi.current) return;
      try {
        // API 호출 중임을 표시
        hasCalledApi.current = true;
        // 서버 API 엔드포인트 호출로 변경
        const result = await fetchFriendCompatibilityAnalysis({
          person1: state.person1,
          person2: state.person2,
        });

        setFriendCompatibilityData(result);
        setLoading(false);
      } catch (err) {
        console.error("친구 궁합 분석 중 오류 발생:", err);
        setError("궁합 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
        setLoading(false);
        // 에러 발생 시 다시 API 호출 가능하도록 플래그 초기화
        hasCalledApi.current = false;
      }
    };

    loadFriendCompatibilityData();

    return () => {
      clearInterval(stageTimer);
    };
  }, [state]);

  // 결과 데이터 가져오기
  useEffect(() => {
    // ... existing code ...
  }, [state, router]);

  // 결과 저장 함수를 useCallback으로 감싸기
  const saveFriendCompatibilityResult = useCallback(async () => {
    if (
      !friendCompatibilityData ||
      !state.person1.name ||
      !state.person2.name ||
      resultSaved
    )
      return;

    try {
      setResultSaved(true);
      // 데이터 준비 - 순환 참조 제거를 위해 JSON 변환 처리
      const safeResultData = JSON.parse(
        JSON.stringify(friendCompatibilityData)
      );

      console.log("친구 궁합 저장 요청 데이터:", {
        resultType: "friend",
        person1Name: state.person1.name,
        person2Name: state.person2.name,
      });

      const response = await fetch("/api/compatibility-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함 설정
        body: JSON.stringify({
          resultType: "friend",
          resultData: safeResultData,
          person1Name: state.person1.name,
          person1Birthdate: state.person1.birthdate,
          person1Gender: state.person1.gender,
          person1Birthtime: state.person1.birthtime,
          person2Name: state.person2.name,
          person2Birthdate: state.person2.birthdate,
          person2Gender: state.person2.gender,
          person2Birthtime: state.person2.birthtime,
          totalScore: friendCompatibilityData.totalScore,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("친구 궁합 결과 저장 실패:", responseData);
        return;
      }

      console.log("친구 궁합 결과가 저장되었습니다:", responseData);
      // 저장된 ID 상태에 저장
      setSavedResultId(responseData.id);
    } catch (error) {
      console.error("결과 저장 중 오류:", error);
    }
  }, [friendCompatibilityData, state.person1, state.person2, resultSaved]);

  // 결과가 로드될 때 저장 로직 실행
  useEffect(() => {
    if (friendCompatibilityData && !loading && !error) {
      saveFriendCompatibilityResult();
    }
  }, [friendCompatibilityData, loading, error, saveFriendCompatibilityResult]);

  // 공유 URL 생성 함수 추가
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";

    const baseUrl = window.location.origin;

    // 결과 저장 ID가 있으면 결과 저장 상세 페이지로 링크 생성
    if (savedResultId) {
      return `${baseUrl}/compatibility-results/${savedResultId}?shared=true`;
    }

    // 저장 ID가 없으면 기존 방식으로 친구 궁합 페이지 링크 생성
    const userId = session?.user?.id || "anonymous";
    return `${baseUrl}/friendship-compatibility?userId=${userId}&shared=true`;
  };

  // 카카오 공유 함수 수정
  const shareToKakao = () => {
    console.log("Kakao 객체:", window.Kakao);
    console.log("Kakao 초기화 여부:", window.Kakao?.isInitialized?.());
    console.log("Kakao.Share 객체:", window.Kakao?.Share);
    if (!window.Kakao || !friendCompatibilityData) return;

    try {
      // 로컬환경이면 카카오 공유가 제대로 작동하지 않을 수 있음을 알리기
      if (window.location.hostname === "localhost") {
        toast.error(
          "로컬 환경에서는 카카오 공유가 제대로 작동하지 않을 수 있습니다."
        );
      }

      // 공유 URL 생성
      const shareUrl = generateShareUrl();

      // 실제 도메인 사용 (개발 환경에서는 배포된 URL로 변경)
      const webUrl = "https://v0-aifortune-rose.vercel.app";
      const realShareUrl = shareUrl.replace(window.location.origin, webUrl);

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${state.person1.name}님과 ${state.person2.name}님의 친구 궁합`,
          description: friendCompatibilityData.nickname,
          imageUrl: `${window.location.origin}/chemy.png`,
          link: {
            mobileWebUrl: realShareUrl,
            webUrl: realShareUrl,
          },
        },
        buttons: [
          {
            title: "친구 궁합 보기",
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

  // 클립보드에 링크 복사 함수 수정
  const copyToClipboard = () => {
    const shareUrl = generateShareUrl();

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("링크가 복사되었습니다!");
      })
      .catch(() => {
        toast.error("링크 복사에 실패했습니다.");
      });
  };

  // 점수에 따른 닉네임과 고양이 첨언 가져오기
  const getScoreNickname = (score: number) => {
    // 점수를 10점 단위로 변환 (0~9 -> 10, 10~19 -> 20, ...)
    const normalizedScore = Math.min(Math.ceil(score / 10) * 10, 100);
    const index = normalizedScore / 10 - 1;
    return SCORE_NICKNAME_MAP[index >= 0 ? index : 0];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
      <Toaster />
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShareKakao={shareToKakao}
          onCopyLink={copyToClipboard}
        />
      )}

      {loading ? (
        // 로딩 화면
        <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
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
              width={180}
              height={80}
              className="w-full h-full relative z-10"
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
      ) : error ? (
        // 에러 화면
        <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
          <h2 className="text-xl font-bold text-[#3B2E7E] mb-4">{error}</h2>
          <button
            onClick={() => router.push("/friendship-compatibility")}
            className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#990dfa] to-[#7609c1] text-white font-medium hover:opacity-90 transition-colors flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            다시 입력하기
          </button>
        </div>
      ) : friendCompatibilityData ? (
        // 결과 화면
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-grow"
        >
          {/* 헤더 */}
          <PageHeader
            title="친구 궁합 결과"
            className="bg-white shadow-md relative z-10"
          />

          {/* 결과 컨텐츠 */}
          <div className="container mx-auto px-4 pb-24 relative">
            <div className="mt-10 flex justify-center items-center">
              <Image
                src="/friend3.png"
                alt="친구 궁합 결과"
                width={160}
                height={70}
              />
            </div>
            {/* 닉네임 및 점수 */}
            <motion.div
              className="text-center my-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {friendCompatibilityData && (
                <>
                  <h1 className="text-3xl font-bold text-[#3B2E7E] mb-2">
                    {
                      getScoreNickname(friendCompatibilityData.totalScore)
                        .nickname
                    }
                  </h1>
                  <p className="text-[#990dfa] text-lg mb-4">
                    {
                      getScoreNickname(friendCompatibilityData.totalScore)
                        .catComment
                    }
                  </p>
                </>
              )}
              <div className="flex justify-center relative items-center my-4">
                <CircularProgress
                  percentage={friendCompatibilityData.totalScore}
                  size={200}
                  strokeWidth={15}
                  color="#990dfa"
                  backgroundColor="rgba(153, 13, 250, 0.1)"
                />
                <div className="absolute flex top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-3xl font-bold text-[#3B2E7E]">
                    {friendCompatibilityData?.totalScore || 83}
                  </span>
                  <span className="block text-sm text-[#990dfa] mt-2 ml-2">
                    점
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {friendCompatibilityData.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#990dfa]/10 to-[#7609c1]/10 border border-[#990dfa]/20 text-[#3B2E7E] text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 오행 분석 섹션 */}
            <motion.div
              className="mb-8 p-4 rounded-2xl shadow-sm border border-[#e6e6e6] bg-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-[#3B2E7E] mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-[#990dfa]" />
                음양오행 분석
              </h2>

              {/* 두 사람 정보 카드 */}
              <div className="flex gap-4 mb-6">
                {/* 첫 번째 사람 카드 */}
                <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-[#3B2E7E] mb-2">
                      {friendCompatibilityData.elements.user.name}
                    </h3>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#990dfa]/20">
                      <span className="text-2xl">
                        {
                          friendCompatibilityData.elements.user.element.split(
                            " "
                          )[0]
                        }
                      </span>
                    </div>
                    {/* <p className="text-white text-sm mb-1">
                      {friendCompatibilityData.elements.user.element}
                    </p>
                    <p className="text-white text-sm mb-1">
                      ({friendCompatibilityData.elements.user.yinYang})
                    </p> */}
                    <p className="text-gray-700 text-sm mt-2">
                      {friendCompatibilityData.elements.user.description}
                    </p>
                  </div>
                </div>

                {/* 두 번째 사람 카드 */}
                <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-[#3B2E7E] mb-2">
                      {friendCompatibilityData.elements.partner.name}
                    </h3>
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 border border-[#990dfa]/20">
                      <span className="text-2xl">
                        {
                          friendCompatibilityData.elements.partner.element.split(
                            " "
                          )[0]
                        }
                      </span>
                    </div>
                    {/* <p className="text-white text-sm mb-1">
                      {friendCompatibilityData.elements.partner.element}
                    </p>
                    <p className="text-white text-sm mb-1">
                      ({friendCompatibilityData.elements.partner.yinYang})
                    </p> */}
                    <p className="text-gray-700 text-sm mt-2">
                      {friendCompatibilityData.elements.partner.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 관계 해석 */}
              <div className="p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
                <p className="text-gray-700 text-center">
                  {friendCompatibilityData.elements.relationshipInterpretation}
                </p>
              </div>
            </motion.div>

            {/* 카테고리별 궁합 */}
            <motion.div
              className="mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-bold text-[#3B2E7E] mb-4 flex items-center">
                <Smile className="w-5 h-5 mr-2 text-[#990dfa]" />
                카테고리별 궁합
              </h2>

              {friendCompatibilityData.categories.map((category, index) => (
                <CategoryCard
                  key={index}
                  title={category.title}
                  score={category.score}
                  delay={index * 0.1}
                  icon={
                    index === 0 ? (
                      <Brain className="w-5 h-5 text-[#990dfa]" />
                    ) : index === 1 ? (
                      <Star className="w-5 h-5 text-[#990dfa]" />
                    ) : index === 2 ? (
                      <Coffee className="w-5 h-5 text-[#990dfa]" />
                    ) : index === 3 ? (
                      <Heart className="w-5 h-5 text-[#990dfa]" />
                    ) : (
                      <Zap className="w-5 h-5 text-[#990dfa]" />
                    )
                  }
                  color={`rgba(153, 13, 250, ${0.1 + index * 0.05})`}
                >
                  <div>
                    <p className="text-gray-700 mb-3">{category.analysis}</p>
                    <div className="flex items-start mt-2 text-[#990dfa]">
                      <div className="flex-shrink-0 mr-2 mt-1">🐱</div>
                      <p className="italic text-sm">{category.catComment}</p>
                    </div>
                  </div>
                </CategoryCard>
              ))}
            </motion.div>

            {/* 보너스 섹션 */}
            <motion.div
              className="mb-8 p-4 rounded-2xl shadow-sm border border-[#e6e6e6] bg-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-[#3B2E7E] mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-[#990dfa]" />
                보너스
              </h2>

              <div className="flex flex-col md:flex-row gap-4">
                {/* 행운 아이템 */}
                <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">
                      {friendCompatibilityData.bonus.luckyItem.emoji}
                    </span>
                    <h3 className="text-lg font-medium text-[#3B2E7E]">
                      행운 아이템
                    </h3>
                  </div>
                  <p className="text-[#3B2E7E] font-medium mb-1">
                    {friendCompatibilityData.bonus.luckyItem.label}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {friendCompatibilityData.bonus.luckyItem.description}
                  </p>
                </div>

                {/* 추천 활동 */}
                <div className="flex-1 p-4 rounded-xl bg-[#F9F5FF] border border-[#e6e6e6]">
                  <div className="flex items-center mb-3">
                    <span className="text-xl mr-2">
                      {friendCompatibilityData.bonus.recommendedActivity.emoji}
                    </span>
                    <h3 className="text-lg font-medium text-[#3B2E7E]">
                      추천 활동
                    </h3>
                  </div>
                  <p className="text-[#3B2E7E] font-medium mb-1">
                    {friendCompatibilityData.bonus.recommendedActivity.label}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {
                      friendCompatibilityData.bonus.recommendedActivity
                        .description
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 고양이 최종 멘트 */}
            <motion.div
              className="mb-8 p-6 rounded-2xl bg-white shadow-sm border border-[#e6e6e6] text-center magic-bg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="w-16 h-16 mx-auto mb-4">
                <Image
                  src="/new_cat_magic.png"
                  alt="고양이 마법사"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-700 text-lg italic whitespace-pre-line">
                {friendCompatibilityData.finalCatComment}
              </p>
            </motion.div>

            {/* 공유 버튼 */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <button
                onClick={() => setShowShareModal(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#990dfa] to-[#7609c1] text-white font-medium hover:opacity-90 transition-colors flex items-center"
              >
                <Share2 className="w-5 h-5 mr-2" />
                친구와 공유하기
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
