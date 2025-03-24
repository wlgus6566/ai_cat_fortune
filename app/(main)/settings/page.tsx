"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import PageHeader from "@/app/components/PageHeader"

// 언어 변경을 위한 로컬 스토리지 키
const LANGUAGE_PREFERENCE_KEY = "language_preference"
// 다크모드 설정을 위한 로컬 스토리지 키
const DARK_MODE_KEY = "dark_mode_enabled"

export default function SettingsPage() {
  const t = useTranslations()

  // 현재 선택된 언어 상태
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ko")
  // 다크모드 상태
  const [darkMode, setDarkMode] = useState<boolean>(false)

  // 컴포넌트 로드 시 로컬 스토리지에서 설정 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 언어 설정 가져오기
      const storedLanguage = localStorage.getItem(LANGUAGE_PREFERENCE_KEY)
      if (storedLanguage) {
        setSelectedLanguage(storedLanguage)
      }
      
      // 다크모드 설정 가져오기
      const storedDarkMode = localStorage.getItem(DARK_MODE_KEY)
      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === "true")
      }
    }
  }, [])

  // 다크모드 적용
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem(DARK_MODE_KEY, darkMode.toString())
    }
  }, [darkMode])

  // 언어 변경 처리
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value
    setSelectedLanguage(language)

    // 로컬 스토리지에 언어 설정 저장
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language)

    // 페이지 새로고침 (언어 변경 적용을 위해)
    window.location.reload()
  }
  
  // 다크모드 변경 처리
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode)
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
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* 헤더 */}
      <PageHeader 
        title={t("settings.appSettings")}
        className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}
      />
      
      <div className="container mx-auto pb-12 max-w-screen-md">
        <motion.div
          className={`mx-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 언어 설정 섹션 */}
          <motion.div className="mb-6 mt-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md overflow-hidden border transition-all`}>
              <div className={`flex justify-between p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">🌐</span>
                  {t("settings.languageSection")}
                </h2>
                <select 
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  className={`rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="ko">🇰🇷 {t("settings.languages.ko")}</option>
                  <option value="en">🇺🇸 {t("settings.languages.en")}</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* 다크모드 설정 섹션 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md overflow-hidden border transition-all`}>
              <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">🎨</span>
                  {t("settings.appearance")}
                </h2>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{darkMode ? '🌙' : '☀️'}</span>
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t("settings.darkMode")}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("settings.darkModeDescription")}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={darkMode}
                      onChange={handleDarkModeToggle}
                    />
                    <div className={`w-11 h-6 ${darkMode ? 'bg-purple-600 peer-focus:ring-purple-800' : 'bg-gray-200 peer-focus:ring-purple-300'} peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 알림 설정 섹션 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-md overflow-hidden border transition-all`}>
              <div className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">🔮</span>
                  {t("settings.fortuneSettings")}
                </h2>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🔔</span>
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{t("settings.notifications")}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t("settings.notificationsDescription")}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className={`w-11 h-6 ${darkMode ? 'bg-gray-700 peer-checked:bg-purple-600' : 'bg-gray-200 peer-checked:bg-purple-600'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 앱 정보 섹션 */}
          <motion.div className="mt-12 text-center" variants={itemVariants}>
            <div className="flex justify-center mb-3">
              <div className={`w-12 h-12 ${darkMode ? 'bg-purple-700' : 'bg-purple-100'} rounded-full flex items-center justify-center`}>
                <span className="text-xl">🔮</span>
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>Fortune AI</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>버전 1.0.0</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button className={`${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'} text-sm`}>이용약관</button>
              <span className={`${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
              <button className={`${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'} text-sm`}>개인정보처리방침</button>
            </div>
          </motion.div>

          <motion.div className={`text-center mt-8 ${darkMode ? 'text-purple-400' : 'text-purple-700'} text-sm`} variants={itemVariants}>
            <p>Fortune AI - {t("fortune.updateInfo")}</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 