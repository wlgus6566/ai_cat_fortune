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
    rotate: [0, 5, -5, 0],
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
            <div className="bg-white/20 p-4 rounded-xl text-white backdrop-blur-sm border border-white/20">
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

  // 타이핑 애니메이션 텍스트
  const typingText = "고양이 점술사가 사랑의 궁합을 봐줄게냥~ 😺💫";

  // 로딩 애니메이션 내 텍스트
  const [loadingText, setLoadingText] = useState("");
  const [showResultButton, setShowResultButton] = useState(false);

  // 로딩 애니메이션 (점 표시)
  useEffect(() => {
    if (!loading) return;

    const texts = ["읽고 있어", "읽고 있어.", "읽고 있어..", "읽고 있어..."];
    let index = 0;

    const loadingInterval = setInterval(() => {
      setLoadingText(texts[index % texts.length]);
      index++;

      // 3초 후에 결과보기 버튼 표시
      if (index === 12) {
        setShowResultButton(true);
        clearInterval(loadingInterval);
      }
    }, 500);

    return () => {
      clearInterval(loadingInterval);
    };
  }, [loading]);

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

  if (loading) {
    return (
      <div className="min-h-screen font-gothic flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        {/* 배경 장식 요소 */}
        {/* {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white opacity-30"
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
        ))} */}

        <motion.div
          className="w-24 h-24 mb-8 relative"
          animate={{
            rotate: 360,
            y: [0, -10, 0],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            y: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
          <Image
            src="/assets/images/star.png"
            alt="로딩중"
            width={96}
            height={96}
            className="w-full h-full relative z-10"
          />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold mb-6 text-center"
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

        <motion.div
          className="text-lg text-center mb-8 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {loadingText}
        </motion.div>

        {showResultButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-8 py-3 bg-white text-[#3B2E7E] rounded-full font-medium shadow-lg hover:bg-opacity-90 transition-all"
            onClick={() => setLoading(false)}
          >
            결과 보기
          </motion.button>
        )}
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
    <div className="min-h-screen bg-gradient-to-br from-[#3B2E7E] via-[#5D4A9C] to-[#7057C9] text-white relative overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/bg_only_sky.png"
          alt="배경이미지"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* 배경 장식 요소 */}
      {/* {[...Array(15)].map((_, i) => (
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
      ))} */}

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

      <div className="container max-w-md mx-auto px-4 py-6 relative z-10">
        {/* 결과 컨테이너 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* 상단 요소: 제목 및 테마 */}
          <motion.div variants={slideInUp} className="text-center mb-8">
            <motion.div
              className="inline-block mb-4"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-12 w-12 text-yellow-300" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-yellow-200">
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

            {/* 성격 궁합 */}
            <CategoryCard
              title="성격 궁합"
              score={compatibilityData?.details?.성격궁합?.score || 85}
              delay={0.1}
              icon={<Sparkles className="h-6 w-6 text-white" />}
              color="rgba(255, 107, 158, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.성격궁합?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.성격궁합?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 연애 스타일 */}
            <CategoryCard
              title="연애 스타일"
              score={compatibilityData?.details?.연애스타일?.score || 78}
              delay={0.2}
              icon={<Heart className="h-6 w-6 text-white" />}
              color="rgba(255, 77, 128, 0.8)"
            >
              <p className="mb-3">
                {compatibilityData?.details?.연애스타일?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.연애스타일?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 갈등 요소 */}
            <CategoryCard
              title="갈등 요소"
              score={compatibilityData?.details?.갈등요소?.score || 67}
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
                {compatibilityData?.details?.갈등요소?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.갈등요소?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 미래 전망 */}
            <CategoryCard
              title="미래 전망"
              score={compatibilityData?.details?.미래전망?.score || 88}
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
                {compatibilityData?.details?.미래전망?.analysis}
              </p>
              <div className="bg-white/30 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  🐾 {compatibilityData?.details?.미래전망?.tip}
                </p>
              </div>
            </CategoryCard>

            {/* 음양오행 분석 */}
            <CategoryCard
              title="음양오행 분석"
              score={
                compatibilityData?.details?.음양오행분석?.상성?.궁합지수 || 91
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
                <div className="bg-white/20 p-3 rounded-lg border border-white/10">
                  <h4 className="font-medium mb-2">{state.person1.name}</h4>
                  <p className="text-sm">
                    오행:{" "}
                    <span className="font-medium">
                      {compatibilityData?.details?.음양오행분석?.user?.오행 ||
                        "목"}
                    </span>
                  </p>
                  <p className="text-sm">
                    음양:{" "}
                    <span className="font-medium">
                      {compatibilityData?.details?.음양오행분석?.user?.음양 ||
                        "양"}
                    </span>
                  </p>
                  <p className="text-sm mt-2">
                    {compatibilityData?.details?.음양오행분석?.user?.설명}
                  </p>
                </div>

                <div className="mt-2 bg-white/20 p-3 rounded-lg border border-white/10">
                  <h4 className="font-medium mb-2">{state.person2.name}</h4>
                  <p className="text-sm">
                    오행:{" "}
                    <span className="font-medium">
                      {compatibilityData?.details?.음양오행분석?.partner
                        ?.오행 || "화"}
                    </span>
                  </p>
                  <p className="text-sm">
                    음양:{" "}
                    <span className="font-medium">
                      {compatibilityData?.details?.음양오행분석?.partner
                        ?.음양 || "양"}
                    </span>
                  </p>
                  <p className="text-sm mt-2">
                    {compatibilityData?.details?.음양오행분석?.partner?.설명}
                  </p>
                </div>

                <div className="bg-white/30 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">상성 분석</h4>
                  <p className="text-sm mb-2">
                    {compatibilityData?.details?.음양오행분석?.상성?.설명}
                  </p>
                  <p className="text-sm font-medium">
                    🐾{" "}
                    {compatibilityData?.details?.음양오행분석?.상성?.고양이설명}
                  </p>
                </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 p-4 rounded-lg border border-white/10">
                <h3 className="text-md font-bold mb-2 flex items-center">
                  <span className="mr-2">🎁</span> 행운 아이템
                </h3>
                <p className="text-sm">{compatibilityData?.luckyItem}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-lg border border-white/10">
                <h3 className="text-md font-bold mb-2 flex items-center">
                  <span className="mr-2">💑</span> 추천 데이트
                </h3>
                <p className="text-sm">{compatibilityData?.recommendedDate}</p>
              </div>
            </div>
          </motion.div>

          {/* 하단 버튼 */}
          <motion.div variants={slideInUp} className="text-center mt-8 mb-12">
            <button
              onClick={() => router.push("/compatibility")}
              className="px-8 py-3 bg-white text-[#3B2E7E] rounded-full font-medium shadow-lg hover:bg-opacity-90 transition-all"
            >
              다시 궁합 보기
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
