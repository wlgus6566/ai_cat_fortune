"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useTalisman } from "@/app/contexts/TalismanContext";
import PageHeader from "@/app/components/PageHeader";
import { Talisman } from "@/app/type/types";

export default function TalismanGalleryPage() {
  const { userProfile } = useUser();
  const t = useTranslations();
  const [talismans, setTalismans] = useState<Talisman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const { openTalisman } = useTalisman();
  // createdAt을 YYYY-MM-DD 형식으로 변환
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };
  // concern을 해시태그 형태로 변환
  const formatConcernTags = (concernText?: string): React.ReactNode => {
    if (!concernText) return null;

    const uniqueTags = Array.from(
      new Set(
        concernText
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      )
    );

    // 첫 번째와 마지막 태그만 추출
    const tagsToShow =
      uniqueTags.length > 1
        ? [uniqueTags[0], uniqueTags[uniqueTags.length - 1]]
        : uniqueTags;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tagsToShow.map((tag, index) => {
          const isLast = index === tagsToShow.length - 1;
          return (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-2xl ${
                isLast
                  ? darkMode
                    ? "bg-purple-800 text-purple-100"
                    : "bg-purple-100 text-purple-800"
                  : darkMode
                  ? "bg-amber-800 text-amber-100"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              #{tag}
            </span>
          );
        })}
      </div>
    );
  };

  // 다크모드 상태 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("dark_mode_enabled");
      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === "true");
      }
    }
  }, []);

  // 사용자 부적 데이터 가져오기
  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchTalismans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/talisman/user?userId=${userProfile.id}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              "부적 이미지를 불러오는 중 오류가 발생했습니다."
          );
        }

        const data = await response.json();
        console.log("data33333", data);
        setTalismans(data.talismans || []);
      } catch (err) {
        console.error("부적 이미지 로딩 오류:", err);
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalismans();
  }, [userProfile?.id]);

  // 부적 클릭 핸들러 수정 - 이제 Context API를 사용하면서 추가 정보 전달
  const handleTalismanClick = (talisman: Talisman) => {
    console.log(1111, {
      imageUrl: talisman.publicUrl,
      userName: userProfile?.name,
      title: t("talisman.popup.title"),
      darkMode,
      createdAt: formatDate(talisman.createdAt),
      concern: talisman.concern,
      translatedPhrase: talisman.translatedPhrase,
    });
    openTalisman({
      imageUrl: talisman.publicUrl,
      userName: userProfile?.name,
      title: t("talisman.popup.title"),
      darkMode,
      createdAt: formatDate(talisman.createdAt),
      concern: talisman.concern,
      translatedPhrase: talisman.translatedPhrase,
    });
  };

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
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9]"
      }`}
    >
      {/* PageHeader 컴포넌트 추가 */}
      <PageHeader
        title={t("talisman.headerTitle")}
        className={`${
          darkMode
            ? "bg-gray-900 text-white border-gray-800"
            : "bg-white text-gray-800"
        }`}
      />

      <div className="container mx-auto px-4 py-6 max-w-screen-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 설명 섹션 - 왼쪽 정렬로 변경 */}
          <motion.section variants={itemVariants} className={`mb-2`}>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } text-center`}
            >
              {t("talisman.collectionDescription")}
            </p>
          </motion.section>

          {/* 본문 섹션 */}
          <motion.section
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } rounded-lg shadow-md overflow-hidden border mb-6`}
            variants={itemVariants}
          >
            {isLoading ? (
              <div className="min-h-[400px] flex justify-center items-center p-8">
                <div
                  className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                    darkMode ? "border-purple-500" : "border-purple-600"
                  }`}
                ></div>
              </div>
            ) : error ? (
              <div
                className={`${
                  darkMode
                    ? "bg-red-900 border-red-800"
                    : "bg-red-50 border-red-200"
                } border rounded-md p-4 m-4`}
              >
                <p className={`${darkMode ? "text-red-300" : "text-red-500"}`}>
                  {error}
                </p>
              </div>
            ) : talismans.length === 0 ? (
              <motion.div
                className={`min-h-[400px] flex justify-center items-center
                  rounded-md p-6 m-4 text-left`}
                variants={itemVariants}
              >
                <div className="flex items-start">
                  <span
                    className={`text-2xl mr-3 ${
                      darkMode ? "text-yellow-400" : "text-yellow-500"
                    }`}
                  >
                    🔮
                  </span>
                  <div>
                    <p
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } font-medium mb-2`}
                    >
                      {t("talisman.emptyState")}
                    </p>
                    <motion.p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      } text-sm`}
                      variants={itemVariants}
                    >
                      {t("talisman.emptyStateDescription")}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div className="p-4" variants={containerVariants}>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  variants={containerVariants}
                >
                  {talismans.map((talisman, index: number) => (
                    <motion.div
                      key={index}
                      className={`border ${
                        darkMode
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-200 bg-white"
                      } rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => handleTalismanClick(talisman)}
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="relative w-full overflow-hidden rounded-md"
                        style={{ aspectRatio: "4/5" }}
                      >
                        <Image
                          src={talisman.publicUrl}
                          alt={`부적 이미지 ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div
                        className={`p-2 text-left ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {t("talisman.talismanNumber", { number: index + 1 })}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(talisman.createdAt)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatConcernTags(talisman.concern)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
