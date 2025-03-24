"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import Link from "next/link"
import PageHeader from "@/app/components/PageHeader"
import TalismanPopup from "@/app/components/TalismanPopup"

export default function ProfilePage() {
  const { userProfile } = useUser()
  const t = useTranslations()
  const router = useRouter()
  const [selectedTalisman, setSelectedTalisman] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [talismans, setTalismans] = useState<string[]>([])

  // 다크모드 상태
  const [darkMode, setDarkMode] = useState<boolean>(false)

  // 컴포넌트 로드 시 다크모드 설정 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDarkMode = localStorage.getItem("dark_mode_enabled")
      if (storedDarkMode !== null) {
        setDarkMode(storedDarkMode === "true")
      }
    }
  }, [])

  // 샘플 부적 이미지 (실제 구현에서는 API 호출로 대체)
  useEffect(() => {
    if (userProfile?.id) {
      // 실제 구현에서는 API에서 사용자의 부적을 가져오는 로직으로 대체
      const sampleTalismans = [
        "/images/talisman1.png",
        "/images/talisman2.png",
        "/images/talisman3.png",
      ]
      setTalismans(sampleTalismans) // 샘플 데이터로 최대 3개만 보여줌
    }
  }, [userProfile?.id])

  // 사용자의 부적 가져오기
  useEffect(() => {
    const fetchTalismans = async () => {
      if (!userProfile?.id) return;
      
      try {
        const response = await fetch(`/api/talisman/user?userId=${userProfile.id}`);
        
        if (!response.ok) {
          console.error('부적 데이터를 불러오는데 실패했습니다');
          return;
        }
        
        const data = await response.json();
        if (data.talismans && data.talismans.length > 0) {
          setTalismans(data.talismans.slice(0, 3)); // 최대 3개만 표시
        }
      } catch (error) {
        console.error('부적 데이터 로딩 중 오류:', error);
      }
    };
    
    fetchTalismans();
  }, [userProfile?.id]);

  // 프로필 편집 페이지로 이동
  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  // 설정 페이지로 이동
  const handleGoToSettings = () => {
    router.push("/settings")
  }

  // 부적 클릭 처리
  const handleTalismanClick = (imageUrl: string) => {
    setSelectedTalisman(imageUrl)
    setShowPopup(true)
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
        title={t("settings.pageTitle")}
        className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}
        rightElement={
          <div className="flex space-x-2">
            <button onClick={handleGoToSettings} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        }
      />
      
      <div className="container mx-auto pb-12 max-w-screen-md">
        <motion.div
          className={`mx-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 프로필 정보 섹션 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden transition-all flex flex-col items-center py-6 px-4 mt-4`}>
              {userProfile && (
                <>
                  <div className="relative mb-3">
                    {userProfile.profileImageUrl ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <Image
                          src={userProfile.profileImageUrl}
                          alt={userProfile.name || t("profile.nameUnknown")}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`w-20 h-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center border-2 border-white shadow-md`}>
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <button
                      onClick={handleEditProfile}
                      className={`absolute bottom-0 right-0 w-7 h-7 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-full flex items-center justify-center shadow-md`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {userProfile.name || t("profile.nameUnknown")} {userProfile.id && <span className="text-gray-400 text-sm">23</span>}
                  </h3>
                </>
              )}
              
              {/* 프로필 정보 */}
              <div className={`flex justify-center mt-4 w-full max-w-sm`}>
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-4`}>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t("profile.gender")}</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {userProfile?.gender ? t(`profile.genderOptions.${userProfile.gender}`) : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t("profile.birthDate")}</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {userProfile?.birthDate ? userProfile.birthDate : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t("profile.calendarType")}</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {userProfile?.calendarType ? t(`profile.calendarOptions.${userProfile.calendarType}`) : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t("profile.birthTime")}</p>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {userProfile?.birthTime || t("profile.birthTimeUnknown")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* 구독 섹션 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-purple-900' : 'bg-purple-600'} rounded-xl shadow-md overflow-hidden p-4 text-white`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t("settings.subscription.title")}</h3>
                  <p className="text-sm text-white/80 mb-3">{t("settings.subscription.description")}</p>
                  <button className={`px-4 py-2 bg-white text-purple-600 rounded-full text-sm font-medium`}>
                    {t("settings.subscription.benefits")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* 부적 갤러리 미리보기 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="w-8 h-8 mr-3 flex items-center justify-center">✨</span>
                  <span className="font-medium">{t("settings.menu.talismanGallery")}</span>
                </div>
                <Link href="/talisman-gallery" className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'} font-medium`}>
                  {t("settings.viewMore")}
                </Link>
              </div>
              
              {talismans.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {talismans.map((talismanUrl, index) => (
                    <div
                      key={index}
                      className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden cursor-pointer relative`}
                      onClick={() => handleTalismanClick(talismanUrl)}
                    >
                      <div className="w-full" style={{ aspectRatio: '9/16' }}>
                        <Image
                          src={talismanUrl}
                          alt={`${t("talisman.talismanNumber", { number: index + 1 })}`}
                          width={150}
                          height={260}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>{t("settings.noTalismans")}</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* 메뉴 항목들 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden`}>
              <div>
                <Link href="/chat-archive" className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 mr-3 flex items-center justify-center">💬</span>
                    <span>{t("settings.menu.chatArchive")}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <Link href="/ai-profile" className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <span className="w-8 h-8 mr-3 flex items-center justify-center">🤖</span>
                    <span>{t("settings.menu.aiProfile")}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 부적 팝업 */}
      {showPopup && selectedTalisman && (
        <TalismanPopup 
          imageUrl={selectedTalisman} 
          onClose={() => setShowPopup(false)}
          darkMode={darkMode}
          title={t("talisman.popup.title")}
        />
      )}
    </div>
  )
}

