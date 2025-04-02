"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

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

export default function FriendshipCompatibilityResultPage() {
  const router = useRouter();
  const { state } = useFriendCompatibility();
  const [friendCompatibilityData, setFriendCompatibilityData] =
    useState<FriendCompatibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingStage, setLoadingStage] = useState(1); // 3단계 로딩 (1: 초기, 2: 분석중, 3: 완료)
  const [showShareModal, setShowShareModal] = useState(false);

  // 로딩 단계에 따른 이미지 반환 함수
  const getLoadingImage = () => {
    switch (loadingStage) {
      case 1:
        return "/new_cat_magic.png";
      case 2:
        return "/new_cat_book.png";
      case 3:
        return "/new_cat_friends.png";
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
    const loadFriendCompatibilityData = async () => {
      if (!state.person1.name || !state.person2.name) {
        setError("입력된 정보가 없습니다. 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      try {
        // 로딩 단계 표시를 위한 타이머 설정
        const timer1 = setTimeout(() => setLoadingStage(2), 1500);
        const timer2 = setTimeout(() => setLoadingStage(3), 3000);

        // 서버 API 엔드포인트 호출로 변경
        const result = await fetchFriendCompatibilityAnalysis({
          person1: state.person1,
          person2: state.person2,
        });

        // 타이머 정리
        clearTimeout(timer1);
        clearTimeout(timer2);

        setFriendCompatibilityData(result);
        setLoading(false);
      } catch (err) {
        console.error("친구 궁합 분석 중 오류 발생:", err);
        setError("궁합 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
        setLoading(false);
      }
    };

    loadFriendCompatibilityData();
  }, [state]);

  // 카카오 공유 함수
  const shareToKakao = () => {
    if (!window.Kakao || !friendCompatibilityData) return;

    // 이미지 URL은 실제 서비스에 맞게 조정 필요
    const imageUrl = `${window.location.origin}/new_cat_friends.png`;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${state.person1.name}님과 ${state.person2.name}님의 친구 궁합`,
        description: friendCompatibilityData.nickname,
        imageUrl: imageUrl,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [
        {
          title: "친구 궁합 보기",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
      ],
    });
  };

  // 클립보드에 링크 복사
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast.success("링크가 복사되었습니다!");
      })
      .catch(() => {
        toast.error("링크 복사에 실패했습니다.");
      });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900">
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
          <div className="w-64 h-64 relative mb-8">
            <Image
              src={getLoadingImage()}
              alt="Loading"
              width={250}
              height={250}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {getLoadingMessage()}
          </h2>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  loadingStage >= i ? "bg-pink-400" : "bg-gray-400"
                }`}
              ></div>
            ))}
          </div>
        </div>
      ) : error ? (
        // 에러 화면
        <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
          <button
            onClick={() => router.push("/friendship-compatibility")}
            className="mt-6 px-6 py-3 rounded-full bg-white/20 text-white font-medium hover:bg-white/30 transition-colors flex items-center"
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
          <div className="sticky top-0 z-10 bg-gradient-to-b from-purple-900/80 to-purple-900/0 backdrop-blur-md">
            <div className="container mx-auto p-4 flex items-center">
              <button
                onClick={() => router.push("/friendship-compatibility")}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="ml-4 text-lg font-medium text-white">
                친구 궁합 결과
              </h1>
            </div>
          </div>

          {/* 결과 컨텐츠 */}
          <div className="container mx-auto px-4 pb-24 relative">
            {/* 배경 별 효과 */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white opacity-70"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 10 + 10}px`,
                }}
                variants={starVariants}
                custom={i}
                animate="animate"
              >
                ✨
              </motion.div>
            ))}

            {/* 닉네임 및 점수 */}
            <motion.div
              className="text-center my-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-white mb-3">
                {friendCompatibilityData.nickname}
              </h1>
              <div className="flex justify-center items-center mb-4">
                <CircularProgress
                  percentage={friendCompatibilityData.totalScore}
                  size={100}
                  strokeWidth={10}
                  color="rgba(255, 107, 158, 0.9)"
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {friendCompatibilityData.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 오행 분석 섹션 */}
            <motion.div
              className="mb-8 p-4 rounded-2xl backdrop-blur-md shadow-lg border border-white/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                음양오행 분석
              </h2>

              {/* 두 사람 정보 카드 */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* 첫 번째 사람 카드 */}
                <div className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {friendCompatibilityData.elements.user.name}
                    </h3>
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">
                        {
                          friendCompatibilityData.elements.user.element.split(
                            " "
                          )[0]
                        }
                      </span>
                    </div>
                    <p className="text-white text-sm mb-1">
                      {friendCompatibilityData.elements.user.element}
                    </p>
                    <p className="text-white text-sm mb-1">
                      ({friendCompatibilityData.elements.user.yinYang})
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      {friendCompatibilityData.elements.user.description}
                    </p>
                  </div>
                </div>

                {/* 관계 화살표 */}
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white">💫</span>
                  </div>
                </div>

                {/* 두 번째 사람 카드 */}
                <div className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">
                      {friendCompatibilityData.elements.partner.name}
                    </h3>
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">
                        {
                          friendCompatibilityData.elements.partner.element.split(
                            " "
                          )[0]
                        }
                      </span>
                    </div>
                    <p className="text-white text-sm mb-1">
                      {friendCompatibilityData.elements.partner.element}
                    </p>
                    <p className="text-white text-sm mb-1">
                      ({friendCompatibilityData.elements.partner.yinYang})
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      {friendCompatibilityData.elements.partner.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* 관계 해석 */}
              <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                <p className="text-white text-center">
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
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Smile className="w-5 h-5 mr-2 text-yellow-300" />
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
                      <Brain className="w-5 h-5 text-white" />
                    ) : index === 1 ? (
                      <Star className="w-5 h-5 text-white" />
                    ) : index === 2 ? (
                      <Coffee className="w-5 h-5 text-white" />
                    ) : index === 3 ? (
                      <Heart className="w-5 h-5 text-white" />
                    ) : (
                      <Zap className="w-5 h-5 text-white" />
                    )
                  }
                  color={`rgba(${180 + index * 20}, ${100 + index * 30}, ${
                    200 - index * 20
                  }, 0.8)`}
                >
                  <div>
                    <p className="text-white mb-3">{category.analysis}</p>
                    <div className="flex items-start mt-2 text-yellow-200">
                      <div className="flex-shrink-0 mr-2 mt-1">🐱</div>
                      <p className="italic text-sm">{category.catComment}</p>
                    </div>
                  </div>
                </CategoryCard>
              ))}
            </motion.div>

            {/* 보너스 섹션 */}
            <motion.div
              className="mb-8 p-4 rounded-2xl backdrop-blur-md shadow-lg border border-white/20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-yellow-300" />
                보너스
              </h2>

              <div className="flex flex-col md:flex-row gap-4">
                {/* 행운 아이템 */}
                <div className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500/30 flex items-center justify-center mr-3">
                      <span className="text-xl">
                        {friendCompatibilityData.bonus.luckyItem.emoji}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      행운 아이템
                    </h3>
                  </div>
                  <p className="text-white font-medium mb-1">
                    {friendCompatibilityData.bonus.luckyItem.label}
                  </p>
                  <p className="text-white/80 text-sm">
                    {friendCompatibilityData.bonus.luckyItem.description}
                  </p>
                </div>

                {/* 추천 활동 */}
                <div className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-3">
                      <span className="text-xl">
                        {
                          friendCompatibilityData.bonus.recommendedActivity
                            .emoji
                        }
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      추천 활동
                    </h3>
                  </div>
                  <p className="text-white font-medium mb-1">
                    {friendCompatibilityData.bonus.recommendedActivity.label}
                  </p>
                  <p className="text-white/80 text-sm">
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
              className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center"
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
              <p className="text-white text-lg italic whitespace-pre-line">
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
                className="px-6 py-3 rounded-full bg-pink-500/80 text-white font-medium hover:bg-pink-500 transition-colors flex items-center"
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
