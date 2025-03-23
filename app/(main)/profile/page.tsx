"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import Link from "next/link"
import TalismanPopup from "@/app/components/TalismanPopup"

// 언어 변경을 위한 로컬 스토리지 키
const LANGUAGE_PREFERENCE_KEY = "language_preference"
// 다크모드 설정을 위한 로컬 스토리지 키
const DARK_MODE_KEY = "dark_mode_enabled"

export default function SettingsPage() {
  const { userProfile } = useUser()
  const t = useTranslations()
  const router = useRouter()

  // 현재 선택된 언어 상태
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ko")
  // 다크모드 상태
  const [darkMode, setDarkMode] = useState<boolean>(false)
  // 부적 상태
  const [talismans, setTalismans] = useState<string[]>([])
  const [isLoadingTalismans, setIsLoadingTalismans] = useState(false)
  const [selectedTalisman, setSelectedTalisman] = useState<string | null>(null)
  const [showTalismanPopup, setShowTalismanPopup] = useState(false)

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

  // 사용자 부적 로드
  useEffect(() => {
    if (userProfile?.id) {
      fetchUserTalismans();
    }
  }, [userProfile]);

  // 부적 가져오기
  const fetchUserTalismans = async () => {
    if (!userProfile?.id) return;
    
    try {
      setIsLoadingTalismans(true);
      const response = await fetch(`/api/talisman/user?userId=${userProfile.id}`);
      
      if (!response.ok) {
        throw new Error('부적 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setTalismans(data.talismans || []);
    } catch (error) {
      console.error('부적 로딩 에러:', error);
    } finally {
      setIsLoadingTalismans(false);
    }
  };

  // 부적 썸네일 클릭
  const handleTalismanClick = (imageUrl: string) => {
    setSelectedTalisman(imageUrl);
    setShowTalismanPopup(true);
  };

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

  // 프로필 편집 페이지로 이동
  const handleEditProfile = () => {
    router.push("/profile/edit")
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
    <div className="container mx-auto pb-24 max-w-screen-md">
      {/* 헤더 배너 영역 추가 */}
      <div className="overflow-hidden mb-4 mt-8 mx-4">
        <div className="flex flex-row items-center justify-between">
          <div className="max-w-[80%]">
            <h2 className="text-xl font-bold text-purple-800 mb-2">{userProfile?.name}님과 포춘냥이의<br/>사주 로맨스 시작! 💫🐾</h2>
            <p className="text-purple-600 mb-4 text-sm">오늘도 운명 같은 메시지를 전해드릴게요🔮</p>
          </div>
          <div className="relative w-20 h-20">
            <div className="relative w-full h-full">
              <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* 배경 */}
                <circle cx="100" cy="100" r="90" fill="#FFC0CB" />
                
                {/* 눈 */}
                <circle cx="70" cy="80" r="12" fill="white" />
                <circle cx="130" cy="80" r="12" fill="white" />
                <circle cx="70" cy="80" r="6" fill="black" />
                <circle cx="130" cy="80" r="6" fill="black" />
                
                {/* 수염 */}
                <path d="M40 50L60 65" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M160 50L140 65" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M40 65L60 70" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M160 65L140 70" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M40 80L60 75" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M160 80L140 75" stroke="black" strokeWidth="4" strokeLinecap="round" />
                
                {/* 입 */}
                <path d="M65 115C75 125 125 125 135 115" stroke="black" strokeWidth="4" strokeLinecap="round" />
                
                {/* 코 */}
                <circle cx="100" cy="95" r="6" fill="#FF9999" />
                
                {/* 귀 */}
                <path d="M60 40L40 20" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <path d="M140 40L160 20" stroke="black" strokeWidth="4" strokeLinecap="round" />
                
                {/* 볼 */}
                <circle cx="60" cy="90" r="5" fill="#FFCCCC" />
                <circle cx="140" cy="90" r="5" fill="#FFCCCC" />
                
                {/* 하트 */}
                <path d="M160 130C160 110 140 105 130 115C120 105 100 110 100 130C100 150 130 170 130 170C130 170 160 150 160 130Z" fill="#FF6666" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4">
        <motion.div
          className={`bg-gradient-to-b ${darkMode ? 'from-gray-900 to-gray-800' : 'from-white to-gray-50'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="max-w-screen-md mx-auto" variants={containerVariants} initial="hidden" animate="visible">
            {/* 프로필 정보 섹션 */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md overflow-hidden border transition-all`}>
                <div className={`p-4 flex justify-between  ${darkMode ? 'text-white' : 'text-purple-800'}`}>
                  <h2 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">✨</span>
                    {t("settings.profileSection")}
                  </h2>
                  <button
                      onClick={handleEditProfile}
                      className={`p-2 rounded-full flex items-center justify-center`}
                      title={t("settings.editProfile")}
                    >
                      <span className="text-sm font-medium text-purple-500 underline">수정</span>
                    </button>
                </div>

                {userProfile && (
                  <div className="p-4 relative pt-0">
                
                    
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {userProfile.profileImageUrl ? (
                          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <Image
                              src={userProfile.profileImageUrl || "/placeholder.svg"}
                              alt={userProfile.name || t("profile.nameUnknown")}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-20 h-20 ${darkMode ? 'bg-purple-700' : 'bg-purple-100'} rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
                            <span className="text-2xl">✨</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-purple-900'} mb-1`}>
                          {userProfile.name || t("profile.nameUnknown")}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-purple-700'} mb-2 text-sm`}>
                          {userProfile.gender}, {userProfile.birthDate && new Date(userProfile.birthDate).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-purple-100 text-purple-600'} px-2 py-1 rounded-full inline-block text-xs`}>
                            <span className="mr-1">🌙</span>{" "}
                            {userProfile.birthTime === "모름" ? t("profile.birthTimeUnknown") : userProfile.birthTime}
                          </span>
                          <span className={`text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-purple-100 text-purple-600'} px-2 py-1 rounded-full inline-block text-xs`}>
                            <span className="mr-1">📆</span> {userProfile.calendarType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 부적 갤러리 섹션 */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md overflow-hidden border transition-all`}>
                <div className={`p-4 flex justify-between ${darkMode ? 'text-white' : 'text-purple-800'}`}>
                  <h2 className="text-xl font-semibold flex items-center">
                    <span className="mr-2">✨</span>
                    {t("settings.talismanGallery")}
                  </h2>
                  <Link href="/talisman-gallery">
                    <span className="text-sm font-medium text-purple-500 underline">{t("settings.viewMore")}</span>
                  </Link>
                </div>

                <div className="p-4">
                  {isLoadingTalismans ? (
                    <div className="flex justify-center py-4">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    </div>
                  ) : talismans.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {talismans.slice(0, 3).map((talisman, index) => (
                        <div 
                          key={index} 
                          className={`relative rounded-lg overflow-hidden cursor-pointer border ${darkMode ? 'border-gray-700 hover:border-purple-500' : 'border-purple-100 hover:border-purple-300'} shadow-sm hover:shadow-md transition-all`}
                          onClick={() => handleTalismanClick(talisman)}
                        >
                          <div style={{ paddingBottom: '177.78%' /* 16:9 aspect ratio */ }}>
                            <Image
                              src={talisman}
                              alt="부적 이미지"
                              fill
                              sizes="(max-width: 768px) 33vw, 100px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <p>{t("settings.noTalismans")}</p>
                      <Link href="/fortune">
                        <button className={`mt-3 px-4 py-2 rounded-md ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'} text-white transition`}>
                          {t("settings.viewFortune")}
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 언어 설정 섹션 */}
            <motion.div className="mb-6" variants={itemVariants}>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md overflow-hidden border transition-all`}>
                <div className={`flex justify-between p-4 ${darkMode ? 'text-white' : 'text-purple-800'}`}>
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
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md overflow-hidden border transition-all`}>
                <div className={`p-4 ${darkMode ? 'text-white' : 'text-purple-800'}`}>
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
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md overflow-hidden border transition-all`}>
                <div className={`p-4 ${darkMode ? 'text-white' : 'text-purple-800'}`}>
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
            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md p-6 border`}>
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
              </div>
            </motion.div>

            <motion.div className={`text-center mt-8 ${darkMode ? 'text-purple-400' : 'text-purple-700'} text-sm`} variants={itemVariants}>
              <p>Fortune AI - {t("fortune.updateInfo")}</p>
            </motion.div>
          </motion.div>

          {/* 부적 팝업 */}
          {showTalismanPopup && selectedTalisman && (
            <TalismanPopup 
              imageUrl={selectedTalisman} 
              onClose={() => setShowTalismanPopup(false)}
              darkMode={darkMode}
              userName={userProfile?.name}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

