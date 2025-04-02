"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/app/contexts/UserContext";
import Link from "next/link";
import { DailyFortune } from "@/app/lib/openai";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryPopup from "@/app/components/CategoryPopup";
import { Swiper, SwiperSlide } from "swiper/react";
//import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  Paintbrush,
  MessageCircleHeart,
  ScanFace,
  Zap,
  Hash,
  Gift,
  Music,
  Star,
  BookHeart,
  ChevronRight,
} from "lucide-react";
import WisardCat from "@/app/components/WisardCat";
// 운세 점수 시각화를 위한 컴포넌트
interface FortuneScoreProps {
  score: number;
  maxScore?: number;
  label: string;
  color: string;
}

const FortuneScore: React.FC<FortuneScoreProps> = ({
  score,
  maxScore = 100,
  color,
}) => {
  // 점수 비율 계산
  const percentage = (score / maxScore) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        {/* <span className="text-sm font-medium text-gray-700 font-subheading">
          {label}
        </span> */}
        <span className="text-sm font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="h-3 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        ></motion.div>
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
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  score,
  description,
  icon,
  color,
  onClick,
}) => {
  return (
    <div
      className="card-magic p-4 flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-2xl mr-2" style={{ color }}>
            {icon}
          </span>
          <h4 className="font-medium text-[#3B2E7E]">{title}</h4>
        </div>
        <ChevronRight className="h-5 w-5 text-[#3B2E7E]/60" />
      </div>
      <div className="mb-2">
        <FortuneScore score={score} label={`${title} Score`} color={color} />
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

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
  const router = useRouter();

  // URL 파라미터 확인을 위한 훅 추가
  const searchParams = useSearchParams();
  const shouldShowFortune = searchParams.get("showFortune") === "true";

  // 프로필 완성 여부에 따라 setup 페이지로 리디렉션
  useEffect(() => {
    if (isProfileComplete === false) {
      console.log("프로필이 완성되지 않아 setup 페이지로 이동합니다.");
      router.push("/setup");
    }
  }, [isProfileComplete, router]);

  // 오늘의 운세 데이터 가져오기
  const fetchDailyFortune = useCallback(async () => {
    if (isApiCallInProgress || !userProfile || loading) {
      return;
    }

    // 프로필 완성 여부 확인 - 완성되지 않은 경우 setup 페이지로 리디렉션
    if (!isProfileComplete) {
      console.log("프로필이 완성되지 않아 setup 페이지로 이동합니다.");
      router.push("/setup");
      return;
    }

    // 0.5초 후 말풍선 다시 표시
    setTimeout(() => {
      // setBubbleMessage("운세를 읽고 있다냥...");
      // setShowSpeechBubble(true);

      // 1초 후에 API 호출 시작
      setTimeout(async () => {
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
            throw new Error(
              responseData.message || "Failed to get fortune data."
            );
          }

          const dailyFortune = responseData.data;
          console.log("API response success: Received fortune data.");

          // 로컬 스토리지에 운세 데이터 저장
          storeFortune(userProfile.id, dailyFortune);

          // 페이드 아웃 효과를 위한 지연
          setTimeout(() => {
            setFortune(dailyFortune);
            setHasViewedFortune(true);
            setError(null);
          }, 500);
        } catch (error) {
          console.error("Error fetching today's fortune:", error);
          setError(
            error instanceof Error
              ? error.message
              : "An error occurred while loading today's fortune."
          );
          // 에러 시 기본 상태로 복귀
          // setCatState("origin");
          // setShowSpeechBubble(false);
        } finally {
          setLoading(false);
          setIsApiCallInProgress(false);
          console.log("API call ended");
        }
      }, 1000);
    }, 500);
  }, [userProfile, isApiCallInProgress, loading, isProfileComplete, router]);

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

  // setup 페이지에서 돌아온 경우 자동으로 운세 불러오기
  useEffect(() => {
    if (
      shouldShowFortune &&
      isProfileComplete &&
      userProfile &&
      !fortune &&
      !loading &&
      !isApiCallInProgress
    ) {
      console.log("setup 페이지에서 돌아와 자동으로 운세를 불러옵니다.");
      fetchDailyFortune();
    }
  }, [
    shouldShowFortune,
    isProfileComplete,
    userProfile,
    fortune,
    loading,
    isApiCallInProgress,
    fetchDailyFortune,
  ]);

  // 선택된 카테고리 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // 팝업 닫기 핸들러
  const handleClosePopup = () => {
    setSelectedCategory(null);
  };

  // 운세 보기 전 초기 화면
  if (!hasViewedFortune) {
    return (
      <motion.div
        className="container max-w-screen-md mx-auto px-4 py-6 relative z-1 min-h-screen flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/bg_real_nocat.png"
            alt="배경이미지"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative">
          <WisardCat
            hasViewedFortune={hasViewedFortune}
            forcedMessage="운세를 읽고 있다냥..."
          />
        </div>
        <motion.button
          className={`btn-magic w-full max-w-md py-4 text-lg font-medium relative z-1 ${
            loading ? "btn-magic-loading" : ""
          }`}
          onClick={fetchDailyFortune}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.02 }}
        >
          <span>
            {loading ? "운세를 확인하는 중이다냥...🐾" : "오늘의 운세 보기😽"}
          </span>
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
      {/* 헤더 배너 영역 */}
      <motion.div
        className="flex flex-row items-center justify-between mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-[100px] h-[100px] relative "
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/new_cat_magic.png"
            alt="마법사 고양이"
            fill
            className="w-full h-full object-contain"
          />
        </motion.div>
        <div className="flex-1 pl-10 text-left">
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

          {/* 사주 정보 표시 */}
          {/* {fortune?.saju && (
            <div className="mt-2">
              <p className="text-gray-600 text-sm">
                {userProfile?.birthDate
                  ? `${new Date(userProfile.birthDate).getFullYear()}년 ${
                      new Date(userProfile.birthDate).getMonth() + 1
                    }월 ${new Date(userProfile.birthDate).getDate()}일 ${
                      userProfile?.birthTime?.includes("시")
                        ? userProfile?.birthTime?.substring(0, 2)
                        : ""
                    } 0분생`
                  : ""}
              </p>
              <p className="text-sm mt-1 text-gray-600">
                {fortune.saju.ilju}{" "}
                {userProfile?.gender === "여성" ? "여자" : "남자"}
              </p>
            </div>
          )} */}
        </div>
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
        <div className="bg-white rounded-xl shadow-md p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#990dfa] to-[#7609c1] p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2 flex">
                <Star className="h-5 w-5 text-[#FFD966]" />
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
                    </div>

                    {/* 점수 바 */}
                    <div className="w-full bg-gray-200 rounded-full h-5 mb-3 overflow-hidden">
                      <motion.div
                        className="h-5 bg-gradient-to-r from-[#990dfa] to-[#7609c1] rounded-full flex items-center justify-center text-white text-xs font-medium"
                        initial={{ width: "0%" }}
                        animate={{ width: `${fortune.overall.score}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      >
                        {fortune.overall.score}%
                      </motion.div>
                    </div>

                    <p className="text-gray-700 text-md">
                      {fortune.overall.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-[#3B2E7E] mb-4">{t("error")}</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 bg-white rounded-xl shadow-md p-0 overflow-hidden">
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
                {/* 카테고리별 운세 */}
                <motion.div variants={itemVariants}>
                  <h4 className="font-medium text-[#3B2E7E] mb-3 font-subheading">
                    {t("categoryTitle")}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.key}
                        variants={itemVariants}
                        custom={index}
                      >
                        <CategoryCard
                          title={category.title}
                          score={
                            fortune?.categories?.[
                              category.key as keyof typeof fortune.categories
                            ]?.score || 3
                          }
                          description={
                            fortune?.categories?.[
                              category.key as keyof typeof fortune.categories
                            ]?.talisman || ""
                          }
                          icon={category.icon}
                          color={category.color}
                          onClick={() => handleCategorySelect(category.key)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                {/* 행운의 요소 */}
                <motion.div
                  className="p-4 bg-white rounded-xl shadow-sm border border-[#e6e6e6]"
                  variants={itemVariants}
                >
                  <h4 className="font-medium text-[#3B2E7E] mb-3 font-subheading">
                    {t("luckyElements")}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-[#6366f1] mr-2">
                          <Paintbrush className="h-5 w-5" />
                        </div>
                        <span className="text-gray-500 text-sm">
                          {t("luckyColor")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {fortune.luckyColor}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-[#6366f1] mr-2">
                          <Hash className="h-5 w-5" />
                        </div>
                        <span className="text-gray-500 text-sm">
                          {t("luckyNumber")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {fortune.luckyNumber}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="text-[#6366f1] mr-2">
                          <Gift className="h-5 w-5" />
                        </div>
                        <span className="text-gray-500 text-sm">
                          {t("luckyItem")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {fortune.luckyItem}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center min-w-[130px]">
                        <div className="text-[#6366f1] mr-2">
                          <Music className="h-5 w-5" />
                        </div>
                        <span className="text-gray-500 text-sm">
                          {t("luckySong")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        {fortune.luckySong}
                      </span>
                    </div>
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
                      <p className="text-gray-700 text-md">{fortune.advice}</p>
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
                      <Star className="h-5 w-5 text-[#FFD966]" />
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
        </div>
      </motion.section>

      {/* 슬라이드 섹션 */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <Swiper
          spaceBetween={10}
          slidesPerView={2.2}
          className="swiper-container relative"
        >
          {/* 첫 번째 슬라이드 */}
          <SwiperSlide>
            {/* 첫 번째 카드 */}
            <div className="bg-[#F0EAFF] rounded-2xl p-6 relative overflow-hidden">
              <Link href="/compatibility">
                <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                  <BookHeart className="h-8 w-8 text-[#6366f1]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  사주로 보는
                  <br />
                  궁합
                </h3>
                <p className="text-[#6366f1] text-sm font-medium">
                  내 짝은 어디에?
                </p>
              </Link>
            </div>
          </SwiperSlide>

          {/* 두 번째 슬라이드 */}
          <SwiperSlide>
            {/* 두 번째 카드 */}
            <div className="bg-[#E6F7ED] rounded-2xl p-6 relative overflow-hidden">
              <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                <MessageCircleHeart className="h-8 w-8 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                나를 좋아하는 그 사람
              </h3>
              <p className="text-[#10B981] text-sm font-medium">
                무슨 마음이지?
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="bg-[#FEF3C7] rounded-2xl p-6 relative overflow-hidden">
              <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                <ScanFace className="h-8 w-8 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                2025
                <br />
                친구조합
              </h3>
              <p className="text-[#F59E0B] text-sm font-medium">
                내 친구조합은?
              </p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {/* 네 번째 카드 */}
            <div className="bg-[#FEE2E2] rounded-2xl p-6 relative overflow-hidden">
              <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                <Zap className="h-8 w-8 text-[#EF4444]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Yes or
                <br />
                No
              </h3>
              <p className="text-[#EF4444] text-sm font-medium">
                딱 골라드려요
              </p>
            </div>
          </SwiperSlide>
        </Swiper>
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

      {/* 카테고리 팝업 */}
      {selectedCategory && fortune && (
        <CategoryPopup
          isOpen={!!selectedCategory}
          onClose={handleClosePopup}
          title={
            categories.find((cat) => cat.key === selectedCategory)?.title || ""
          }
          emoji={
            categories.find((cat) => cat.key === selectedCategory)?.icon || ""
          }
          category={
            fortune.categories?.[
              selectedCategory as keyof typeof fortune.categories
            ] || {
              score: 3,
              description: "",
              trend: "",
              talisman: "",
            }
          }
        />
      )}
    </motion.div>
  );
}
