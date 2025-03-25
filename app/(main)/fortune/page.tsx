"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/app/contexts/UserContext";
import Link from "next/link";
import { DailyFortune } from "@/app/lib/openai";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
// 운세 점수 시각화를 위한 컴포넌트
interface FortuneScoreProps {
  score: number;
  maxScore?: number;
  label: string;
  color: string;
}

const FortuneScore: React.FC<FortuneScoreProps> = ({
  score,
  maxScore = 5,
  label,
  color,
}) => {
  // 점수 비율 계산
  const percentage = (score / maxScore) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700 font-subheading">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {score}/{maxScore}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        ></div>
      </div>
    </div>
  );
};

// 카테고리 카드 컴포넌트
interface CategoryCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  description,
  icon,
  color,
}) => {
  return (
    <div className="card-magic p-4 flex flex-col h-full">
      <div className="flex items-center mb-2">
        <div className="text-2xl mr-2" style={{ color }}>
          {icon}
        </div>
        <h4 className="font-medium text-[#3B2E7E]">{title}</h4>
      </div>
      <div className="mb-2">
        <FortuneScore score={score} label={`${title} Score`} color={color} />
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

// 별자리 아이콘 컴포넌트
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#FFD966]">
    <path
      d="M12 2l2.4 7.4h7.6l-6 4.6 2.2 7-6.2-4.4-6.2 4.4 2.2-7-6-4.6h7.6z"
      fill="currentColor"
    />
  </svg>
);

// 로컬 스토리지 관련 함수들
const getStorageKey = (userId: string, day?: string) => {
  const today = day || new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
  return `fortune_${userId}_${today}`;
};

// 모든 이전 운세 데이터 삭제
const clearAllPreviousFortuneData = (userId: string) => {
  if (typeof window === "undefined") return;

  try {
    const today = new Date().toISOString().split("T")[0];

    // localStorage의 모든 키를 확인
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // fortune_ 으로 시작하는 키만 처리
      if (key && key.startsWith(`fortune_${userId}`)) {
        // 날짜 부분 추출
        const keyParts = key.split("_");
        if (keyParts.length >= 3) {
          const keyDate = keyParts[2];

          // 오늘 날짜가 아닌 경우 삭제
          if (keyDate !== today) {
            localStorage.removeItem(key);
            console.log(`Deleted previous fortune data: ${key}`);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error deleting previous fortune data:", error);
  }
};

const getStoredFortune = (userId: string): DailyFortune | null => {
  if (typeof window === "undefined") return null;

  try {
    const key = getStorageKey(userId);
    const storedData = localStorage.getItem(key);

    if (!storedData) return null;

    const { timestamp, fortune } = JSON.parse(storedData);
    const storedDate = new Date(timestamp).toISOString().split("T")[0];
    const todayDate = new Date().toISOString().split("T")[0];

    // 저장된 데이터가 오늘 날짜인 경우에만 사용
    if (storedDate === todayDate) {
      console.log("Today's fortune data exists in local storage.");
      return fortune;
    }

    // 날짜가 다르면 저장된 데이터 삭제
    console.log("Stored fortune data is not from today. Deleting it.");
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error("Error loading stored fortune data:", error);
    return null;
  }
};

const storeFortune = (userId: string, fortune: DailyFortune) => {
  if (typeof window === "undefined") return;

  try {
    const key = getStorageKey(userId);
    const dataToStore = {
      timestamp: new Date().toISOString(),
      fortune: fortune,
    };

    localStorage.setItem(key, JSON.stringify(dataToStore));
  } catch (error) {
    console.error("Error storing fortune data:", error);
  }
};

export default function HomePage() {
  const { userProfile, isProfileComplete } = useUser();
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const [hasViewedFortune, setHasViewedFortune] = useState(false);
  const t = useTranslations("fortune");

  // 오늘의 운세 데이터 가져오기
  const fetchDailyFortune = useCallback(async () => {
    if (isApiCallInProgress || !userProfile) {
      return;
    }

    try {
      setLoading(true);
      setIsApiCallInProgress(true);
      console.log("API call started: /api/fortune/daily");

      const response = await fetch("/api/fortune/daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: userProfile.name,
          userProfile: userProfile,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(responseData.message || "Failed to get fortune data.");
      }

      const dailyFortune = responseData.data;
      console.log("API response success: Received fortune data.");

      // 로컬 스토리지에 운세 데이터 저장
      storeFortune(userProfile.id, dailyFortune);

      setFortune(dailyFortune);
      setHasViewedFortune(true);
      setError(null);
    } catch (error) {
      console.error("Error fetching today's fortune:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while loading today's fortune."
      );
    } finally {
      setLoading(false);
      setIsApiCallInProgress(false);
      console.log("API call ended");
    }
  }, [userProfile, isApiCallInProgress]);

  // 초기 로딩 시 저장된 운세 데이터 확인
  useEffect(() => {
    if (userProfile) {
      const storedFortune = getStoredFortune(userProfile.id);
      if (storedFortune) {
        setFortune(storedFortune);
        setHasViewedFortune(true);
      }
      clearAllPreviousFortuneData(userProfile.id);
    }
  }, [userProfile]);

  if (!isProfileComplete) {
    return null;
  }

  // 운세 보기 전 초기 화면
  if (!hasViewedFortune) {
    return (
      <motion.div
        className="container max-w-screen-md mx-auto px-4 py-6 relative z-1 min-h-screen flex flex-col items-center justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/bg_0.png"
          alt={"배경이미지"}
          fill
          className="object-cover"
          priority
        />
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3B2E7E] mb-4 font-heading">
            {t("headerTitle")}
          </h1>
        </div>

        <div className="relative mb-20">
          {/* 말풍선 */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-6 py-3 shadow-lg">
            <p className="text-[#3B2E7E] text-lg whitespace-nowrap">
              운세볼꺼냥? 🔮
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
          </div>

          {/* 캐릭터 */}
          <motion.div
            className="w-60 h-60 relative"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/cat_origin.png"
              alt="마법사 고양이"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        <motion.button
          className="btn-magic w-full max-w-md py-4 text-lg font-medium"
          onClick={fetchDailyFortune}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "운세를 확인하는 중..." : "오늘의 운세 보기"}
        </motion.button>

        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}
      </motion.div>
    );
  }

  // 각 카테고리별 색상 및 아이콘
  const categories = [
    {
      key: "love",
      title: t("categories.love.title"),
      color: "#e83e8c",
      icon: "❤️",
    },
    {
      key: "money",
      title: t("categories.money.title"),
      color: "#ffc107",
      icon: "💰",
    },
    {
      key: "health",
      title: t("categories.health.title"),
      color: "#28a745",
      icon: "💪",
    },
    {
      key: "social",
      title: t("categories.social.title"),
      color: "#17a2b8",
      icon: "👥",
    },
  ];

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="container max-w-screen-md mx-auto px-4 py-6 relative z-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 배경 장식 요소들 */}
      <div className="absolute top-10 right-5 w-24 h-24 opacity-10 z-0">
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#990dfa] rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: `rotate(${i * 45}deg) translate(40px) rotate(${
                  i * 45
                }deg)`,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* 헤더 배너 영역 */}
      <motion.div
        className="flex flex-row items-center justify-between mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-[70%]">
          <h1 className="text-2xl font-bold text-[#3B2E7E] mb-1 font-heading">
            {t("headerTitle")}
          </h1>
          <p className="text-[#990dfa] text-sm font-medium">
            {userProfile?.name
              ? t("forUser", {
                  name: userProfile.name,
                  date: new Date().toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  }),
                })
              : t("headerTitle")}
          </p>
        </div>
        <motion.div
          className="w-36 h-36 relative"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/cat_3.png"
            alt="마법사 고양이"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>

      {/* 에러 표시 */}
      {error && (
        <motion.div
          className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 shadow-sm border border-red-100"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </p>
        </motion.div>
      )}

      {/* 오늘의 운세 섹션 */}
      <motion.section
        className="mb-8"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="card-magic p-0 overflow-hidden"
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(153, 13, 250, 0.15)",
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-[#990dfa] to-[#7609c1] p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2 flex">
                <StarIcon />
              </span>
              {t("overall")}
            </h3>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-[#990dfa]/20 border-t-[#990dfa] rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 animate-ping opacity-20 scale-75 rounded-full bg-[#990dfa]"></div>
                </div>
                <p className="mt-4 text-[#3B2E7E] font-medium">
                  {t("loading")}
                </p>
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
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <motion.button
                  className="btn-magic btn-shine"
                  onClick={fetchDailyFortune}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("tryAgain")}
                </motion.button>
              </div>
            ) : fortune ? (
              <div className="space-y-5">
                {/* 전체 운세 점수 */}
                <motion.div className="mb-4" variants={itemVariants}>
                  <div className="p-4 bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#3B2E7E]">
                        {t("fortuneScore")}
                      </h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full mx-0.5`}
                          >
                            🔮
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 font-handwriting text-xl leading-relaxed">
                      {fortune.overall.description}
                    </p>
                  </div>
                </motion.div>

                {/* 카테고리별 운세 */}
                <motion.div variants={itemVariants}>
                  <h4 className="font-medium text-[#3B2E7E] mb-3 font-subheading">
                    {t("categoryTitle")}
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.key}
                        variants={itemVariants}
                        custom={index}
                      >
                        <CategoryCard
                          title={category.title}
                          score={
                            fortune.categories[
                              category.key as keyof typeof fortune.categories
                            ].score
                          }
                          description={
                            fortune.categories[
                              category.key as keyof typeof fortune.categories
                            ].description
                          }
                          icon={category.icon}
                          color={category.color}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* 행운의 요소 */}
                <motion.div
                  className="flex justify-between p-4 bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF] rounded-xl"
                  variants={itemVariants}
                >
                  <div className="text-center bg-white px-4 py-3 rounded-lg shadow-sm flex-1 mx-1">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("luckyColor")}
                    </p>
                    <p className="font-medium text-[#3B2E7E] flex items-center justify-center">
                      <span className="mr-1">🎨</span> {fortune.luckyColor}
                    </p>
                  </div>
                  <div className="text-center bg-white px-4 py-3 rounded-lg shadow-sm flex-1 mx-1">
                    <p className="text-xs text-gray-500 mb-1">
                      {t("luckyNumber")}
                    </p>
                    <p className="font-medium text-[#3B2E7E] flex items-center justify-center">
                      <span className="mr-1">🔢</span> {fortune.luckyNumber}
                    </p>
                  </div>
                </motion.div>

                {/* 오늘의 조언 */}
                <motion.div
                  className="pt-3 mt-3 relative"
                  variants={itemVariants}
                >
                  <h4 className="font-medium text-[#3B2E7E] mb-2 font-subheading">
                    {t("advice")}
                  </h4>
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-[#990dfa]/20 magic-bg">
                    <div className="flex">
                      <span className="text-2xl mr-3 flex-shrink-0">😺</span>
                      <p className="text-gray-700 font-handwriting text-xl leading-relaxed">
                        {fortune.advice}
                      </p>
                    </div>
                  </div>

                  {/* 별 장식 */}
                  <div className="absolute -top-1 -right-1 text-[#FFD966]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <StarIcon />
                    </motion.div>
                  </div>
                </motion.div>

                {/* 마지막 업데이트 시간 표시 */}
                <motion.div className="text-right mt-3" variants={itemVariants}>
                  <p className="text-xs text-gray-500">{t("updateInfo")}</p>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-[#3B2E7E] mb-4">{t("error")}</p>
                <motion.button
                  className="btn-magic"
                  onClick={fetchDailyFortune}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("tryAgain")}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.section>

      {/* 빠른 메뉴 섹션 */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-16"
      >
        <h3 className="text-lg font-bold text-[#3B2E7E] mb-4 font-heading">
          {t("quickMenu.title")}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div variants={itemVariants}>
            <Link href="/chat">
              <motion.div
                className="card-magic p-5 h-full cursor-pointer"
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(153, 13, 250, 0.15)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-3 text-[#990dfa] bg-[#F9F5FF] w-12 h-12 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-[#3B2E7E] mb-1 font-subheading">
                  {t("quickMenu.chat.title")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("quickMenu.chat.description")}
                </p>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/profile">
              <motion.div
                className="card-magic p-5 h-full cursor-pointer"
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(153, 13, 250, 0.15)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-3 text-[#990dfa] bg-[#F9F5FF] w-12 h-12 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-medium text-[#3B2E7E] mb-1 font-subheading">
                  {t("quickMenu.profile.title")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("quickMenu.profile.description")}
                </p>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link href="/talisman-gallery">
              <motion.div
                className="card-magic p-5 h-full cursor-pointer"
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  boxShadow: "0 10px 25px -5px rgba(153, 13, 250, 0.15)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-3 text-[#990dfa] bg-[#F9F5FF] w-12 h-12 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                </div>
                <h4 className="font-medium text-[#3B2E7E] mb-1 font-subheading">
                  {t("quickMenu.talisman.title")}
                </h4>
                <p className="text-sm text-gray-600">
                  {t("quickMenu.talisman.description")}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
