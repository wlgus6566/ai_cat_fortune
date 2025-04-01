"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCompatibility } from "@/app/context/CompatibilityContext";
import { CompatibilityResult } from "@/app/lib/openai";
import PageHeader from "@/app/components/PageHeader";
import CircularProgress from "@/app/components/CircularProgress";

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

interface CategoryCardProps {
  title: string;
  score: number;
  children: React.ReactNode;
  delay?: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  children,
  delay = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="mb-4 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md shadow-lg"
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
          <div className="w-10 h-10 rounded-full bg-[#EBDFFF] flex items-center justify-center mr-3">
            <span className="text-[#990dfa] font-bold">{score}</span>
          </div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-white transform transition-transform ${
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4"
          >
            <div className="bg-white/20 p-4 rounded-xl text-white">
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
      <div className="min-h-screen bg-gradient-to-b from-[#3B2E7E] to-[#7057C9] flex flex-col items-center justify-center text-white p-6">
        <motion.div
          className="w-20 h-20 mb-8"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Image
            src="/assets/images/star.png"
            alt="로딩중"
            width={80}
            height={80}
            className="w-full h-full"
          />
        </motion.div>

        <h2 className="text-xl font-bold mb-4 text-center">
          {loadingStage === 1
            ? "사주 정보를 확인하고 있어요..."
            : "두 사람의 인연을 분석중입니다..."}
        </h2>

        <p className="text-lg text-center mb-8">{loadingText}</p>

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
      <div className="min-h-screen bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 max-w-md w-full">
          <div className="text-center mb-6">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
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
            <h2 className="text-xl font-bold text-[#3B2E7E]">
              오류가 발생했습니다
            </h2>
          </div>
          <p className="text-center text-[#3B2E7E]/70 mb-6">{error}</p>
          <button
            onClick={() => router.push("/compatibility")}
            className="w-full px-6 py-3 rounded-xl bg-[#990dfa] text-white font-medium hover:bg-[#8A0AE0] transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3B2E7E] to-[#7057C9] text-white">
      <PageHeader
        title="궁합 결과"
        className="bg-transparent shadow-none text-white"
      />

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* 결과 컨테이너 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* 상단 요소: 제목 및 테마 */}
          <motion.div variants={slideInUp} className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {compatibilityData?.magicTitle || "별빛 아래 운명의 실타래"}
            </h1>
            <p className="text-lg opacity-90">
              <span className="font-semibold">
                {compatibilityData?.compatibilityTheme || "상생의 기운"}
              </span>
            </p>
          </motion.div>

          {/* 점수 요약 카드 */}
          <motion.div
            variants={slideInUp}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="mr-4 text-lg">
                <span className="font-medium">{state.person1.name}</span>
              </div>
              <div className="bg-pink-500 rounded-full p-1">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="ml-4 text-lg">
                <span className="font-medium">{state.person2.name}</span>
              </div>
            </div>

            {/* 원형 차트 */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CircularProgress
                  percentage={compatibilityData?.score || 83}
                  size={120}
                  strokeWidth={12}
                  color="#FF6B9E"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-2xl font-bold">
                    {compatibilityData?.score || 83}
                  </span>
                  <span className="block text-sm">점</span>
                </div>
              </div>
            </div>

            <p className="text-center font-medium text-lg">
              {compatibilityData?.summary ||
                "함께 있을수록 더 빛나는 인연이야, 냥~"}
            </p>
          </motion.div>

          {/* 궁합 세부 카드 */}
          <motion.div variants={slideInUp} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">세부 분석</h2>

            {/* 성격 궁합 */}
            <CategoryCard
              title="성격 궁합"
              score={compatibilityData?.details?.성격궁합?.score || 85}
              delay={0.1}
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
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">{state.person1.name}</h4>
                    <p className="text-sm">
                      오행:{" "}
                      {compatibilityData?.details?.음양오행분석?.user?.오행 ||
                        "목"}
                    </p>
                    <p className="text-sm">
                      음양:{" "}
                      {compatibilityData?.details?.음양오행분석?.user?.음양 ||
                        "양"}
                    </p>
                    <p className="text-sm mt-2">
                      {compatibilityData?.details?.음양오행분석?.user?.설명}
                    </p>
                  </div>

                  <div className="bg-white/20 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">{state.person2.name}</h4>
                    <p className="text-sm">
                      오행:{" "}
                      {compatibilityData?.details?.음양오행분석?.partner
                        ?.오행 || "화"}
                    </p>
                    <p className="text-sm">
                      음양:{" "}
                      {compatibilityData?.details?.음양오행분석?.partner
                        ?.음양 || "양"}
                    </p>
                    <p className="text-sm mt-2">
                      {compatibilityData?.details?.음양오행분석?.partner?.설명}
                    </p>
                  </div>
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
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-8"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🧙‍♂️</span> 전체 조언
            </h3>
            <p className="mb-6">{compatibilityData?.totalAdvice}</p>

            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🐾</span> 고양이의 한마디
            </h3>
            <p className="mb-6">{compatibilityData?.catComment}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-md font-bold mb-2 flex items-center">
                  <span className="mr-2">🎁</span> 행운 아이템
                </h3>
                <p className="text-sm">{compatibilityData?.luckyItem}</p>
              </div>
              <div>
                <h3 className="text-md font-bold mb-2 flex items-center">
                  <span className="mr-2">💑</span> 추천 데이트
                </h3>
                <p className="text-sm">{compatibilityData?.recommendedDate}</p>
              </div>
            </div>
          </motion.div>

          {/* 하단 버튼 */}
          <motion.div variants={slideInUp} className="text-center mt-8">
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
