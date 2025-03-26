"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/app/contexts/UserContext";
import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { ChevronRight } from "lucide-react";

// 언어 변경을 위한 로컬 스토리지 키
const LANGUAGE_PREFERENCE_KEY = "language_preference";
// 다크모드 설정을 위한 로컬 스토리지 키
const DARK_MODE_KEY = "dark_mode_enabled";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const { logout } = useUser();

  // 현재 선택된 언어 상태
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ko");
  // 다크모드 상태
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 컴포넌트 로드 시 로컬 스토리지에서 설정 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 언어 설정 가져오기
      const storedLanguage = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage);
      }

      // 다크모드 설정 가져오기
      const storedDarkMode = localStorage.getItem(DARK_MODE_KEY);
      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === "true");
      }
    }
  }, []);

  // 다크모드 적용
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(DARK_MODE_KEY, darkMode.toString());
    }
  }, [darkMode]);

  // 언어 변경 처리
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    window.location.reload();
  };

  // 다크모드 변경 처리
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <PageHeader title={t("title")} />

      <div className="max-w-screen-sm mx-auto pb-20 px-5">
        <div className="space-y-6">
          {/* Language settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                  언어 설정
                </h3>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-purple-50 dark:bg-gray-700 text-purple-900 dark:text-white rounded-lg px-3 py-2 border border-purple-100 dark:border-gray-600"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </motion.div>

          {/* Dark mode settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                  다크 모드
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  화면 모드를 설정합니다
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </motion.div>

          {/* Notification settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                  알림 설정
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  일일 운세, 이벤트 등 알림을 받아보세요
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </motion.div>

          {/* Terms & Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 px-2">
              약관 및 정책
            </h3>
            <Link
              href="/terms"
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-purple-900 dark:text-purple-300">
                  이용약관
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
            <Link
              href="/privacy"
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-purple-900 dark:text-purple-300">
                  개인정보 처리방침
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          </motion.div>

          {/* Logout button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-4"
          >
            <button
              onClick={handleLogout}
              className="w-full py-3 px-5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
            >
              로그아웃
            </button>
          </motion.div>

          {/* Membership withdrawal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-2"
          >
            <button className="w-full py-3 px-5 text-gray-500 hover:text-gray-700 text-sm font-medium rounded-xl transition-colors">
              회원 탈퇴
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
