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
  const { userProfile, isAuthenticated, logout } = useUser()
  const t = useTranslations()
  const router = useRouter()
  const [selectedTalisman, setSelectedTalisman] = useState<string | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [talismans, setTalismans] = useState<string[]>([])

  // 로그인 되어있지 않으면 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, router]);

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
        } else {
          // API 결과가 없는 경우 샘플 데이터 사용
          const sampleTalismans = [
            "/images/talisman1.png",
            "/images/talisman2.png",
            "/images/talisman3.png",
          ]
          setTalismans(sampleTalismans)
        }
      } catch (error) {
        console.error('부적 데이터 로딩 중 오류:', error);
        // 에러 시 샘플 데이터 사용
        const sampleTalismans = [
          "/images/talisman1.png",
          "/images/talisman2.png",
          "/images/talisman3.png",
        ]
        setTalismans(sampleTalismans)
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

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
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
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  // 로그인 되어있지 않으면 로딩 상태 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#990dfa]/20 border-t-[#990dfa] rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 animate-ping opacity-20 scale-75 rounded-full bg-[#990dfa]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9] pb-16">
      {/* 배경 장식 요소 */}
      <div className="absolute top-20 left-5 w-24 h-24 opacity-10 z-0">
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
                left: '50%', 
                top: '50%', 
                transform: `rotate(${i * 45}deg) translate(40px) rotate(${i * 45}deg)` 
              }}
            />
          ))}
        </motion.div>
      </div>
      
      <div className="absolute top-40 right-10 text-[#FFD966] opacity-70">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: 90 }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-base"
        >
          ✨
        </motion.div>
      </div>
      
      {/* 헤더 */}
      <PageHeader 
        title={t("settings.pageTitle")}
        className="bg-white shadow-md relative z-10"
        rightElement={
          <div className="flex space-x-2">
            <button onClick={handleGoToSettings} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#3B2E7E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        }
      />
      
      <div className="container mx-auto pb-12 max-w-screen-md">
        <motion.div
          className="mx-4 text-[#3B2E7E]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 프로필 정보 섹션 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="bg-white rounded-3xl overflow-hidden transition-all flex flex-col items-center py-6 px-4 mt-4 shadow-md">
              {userProfile && (
                <>
                  <div className="relative mb-3">
                    {userProfile.profileImageUrl ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                        {/* <Image
                          src={userProfile.profileImageUrl}
                          alt={userProfile.name || t("profile.nameUnknown")}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        /> */}
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-[#EAE1F4] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <button
                      onClick={handleEditProfile}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-[#990dfa] rounded-full flex items-center justify-center shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-bold text-lg text-[#3B2E7E] mb-1 font-heading">
                    {userProfile.name || t("profile.nameUnknown")}
                  </h3>
                </>
              )}
              
              {/* 프로필 정보 */}
              <div className="flex justify-center mt-4 w-full max-w-sm">
                <div className="w-full bg-[#F9F9F9] rounded-xl p-4 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-[#3B2E7E]/70">{t("profile.gender")}</p>
                      <p className="text-sm font-medium text-[#3B2E7E]">
                        {userProfile?.gender ? t(`profile.genderOptions.${userProfile.gender === '여성' ? 'female' : 'male'}`) : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-[#3B2E7E]/70">{t("profile.birthDate")}</p>
                      <p className="text-sm font-medium text-[#3B2E7E]">
                        {userProfile?.birthDate ? userProfile.birthDate : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-[#3B2E7E]/70">{t("profile.calendarType")}</p>
                      <p className="text-sm font-medium text-[#3B2E7E]">
                        {userProfile?.calendarType ? t(`profile.calendarOptions.${userProfile.calendarType === '양력' ? 'solar' : 'lunar'}`) : "-"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-[#3B2E7E]/70">{t("profile.birthTime")}</p>
                      <p className="text-sm font-medium text-[#3B2E7E]">
                        {userProfile?.birthTime || t("profile.birthTimeUnknown")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                className="mt-4 px-5 py-2 bg-[#FC5C65]/90 hover:bg-[#FC5C65] text-white rounded-full text-sm transition-colors shadow-sm hover:shadow font-medium"
              >
                로그아웃
              </button>
            </div>
          </motion.div>
          
          {/* 구독 섹션 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="bg-purple-500 rounded-3xl shadow-md overflow-hidden p-4 text-white">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{t("settings.subscription.title")}</h3>
                  <p className="text-sm text-white/90 mb-3">{t("settings.subscription.description")}</p>
                  <button className="px-5 py-2 bg-white text-[#990dfa] rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all">
                    {t("settings.subscription.benefits")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* 부적 갤러리 미리보기 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="w-8 h-8 mr-3 flex items-center justify-center">✨</span>
                  <span className="font-medium text-[#3B2E7E]">{t("settings.menu.talismanGallery")}</span>
                </div>
                <Link href="/talisman-gallery" className="text-sm text-[#990dfa] font-medium hover:underline">
                  {t("settings.viewMore")}
                </Link>
              </div>
              
              {talismans.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {talismans.map((talismanUrl, index) => (
                    <div
                      key={index}
                      className="border border-[#990dfa]/10 rounded-xl overflow-hidden cursor-pointer relative shadow-sm hover:shadow-md transition-all"
                      onClick={() => handleTalismanClick(talismanUrl)}
                    >
                      <div className="w-full" style={{ aspectRatio: '9/16' }}>
                        <Image
                          src={talismanUrl}
                          alt={`${t("talisman.talismanNumber", { number: index + 1 })}`}
                          width={150}
                          height={260}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          className="hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#3B2E7E]/60">
                  <p>{t("settings.noTalismans")}</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* 메뉴 항목들 */}
          <motion.div className="mb-6" variants={itemVariants}>
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
              <div>
                <Link href="/chat-archive" className="flex items-center justify-between p-4 hover:bg-[#EAE1F4]/30 transition-colors">
                  <div className="flex items-center">
                    <span className="w-8 h-8 mr-3 flex items-center justify-center">💬</span>
                    <span className="text-[#3B2E7E]">{t("settings.menu.chatArchive")}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3B2E7E]/60" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              <div className="border-t border-[#990dfa]/10">
                <Link href="/ai-profile" className="flex items-center justify-between p-4 hover:bg-[#EAE1F4]/30 transition-colors">
                  <div className="flex items-center">
                    <span className="w-8 h-8 mr-3 flex items-center justify-center">🤖</span>
                    <span className="text-[#3B2E7E]">{t("settings.menu.aiProfile")}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3B2E7E]/60" viewBox="0 0 20 20" fill="currentColor">
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
          darkMode={false}
          title={t("talisman.popup.title")}
        />
      )}
    </div>
  )
}

