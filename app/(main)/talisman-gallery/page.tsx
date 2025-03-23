'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import TalismanPopup from '@/app/components/TalismanPopup';

export default function TalismanGalleryPage() {
  const { userProfile } = useUser();
  const t = useTranslations();
  const [talismans, setTalismans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTalisman, setSelectedTalisman] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

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
        
        const response = await fetch(`/api/talisman/user?userId=${userProfile.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '부적 이미지를 불러오는 중 오류가 발생했습니다.');
        }
        
        const data = await response.json();
        setTalismans(data.talismans || []);
      } catch (err) {
        console.error('부적 이미지 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalismans();
  }, [userProfile?.id]);

  const handleTalismanClick = (imageUrl: string) => {
    setSelectedTalisman(imageUrl);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedTalisman(null);
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
    <motion.div
      className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="max-w-screen-md mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* 헤더 섹션 */}
        <motion.header className="text-center mb-6" variants={itemVariants}>
          <h1 className={`text-3xl font-bold flex items-center justify-center gap-2 mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-8 w-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            {t('talisman.headerTitle')}
          </h1>
          <p className={`${darkMode ? 'text-purple-300' : 'text-purple-600'} text-center`}>
            {t('talisman.description')}
          </p>
        </motion.header>

        {/* 본문 섹션 */}
        <motion.section
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md overflow-hidden border p-4`}
          variants={itemVariants}
        >
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-purple-500' : 'border-purple-600'}`}></div>
            </div>
          ) : error ? (
            <div className={`${darkMode ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'} border rounded-md p-4 my-4`}>
              <p className={`${darkMode ? 'text-red-300' : 'text-red-500'}`}>{error}</p>
            </div>
          ) : talismans.length === 0 ? (
            <motion.div 
              className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-md p-6 my-4 text-center`}
              variants={itemVariants}
            >
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>아직 생성된 부적 이미지가 없습니다.</p>
              <motion.p 
                className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}
                variants={itemVariants}
              >
                채팅 상담을 통해 행운의 부적을 생성해보세요!
              </motion.p>
            </motion.div>
          ) : (
            <motion.div 
              className="my-4"
              variants={containerVariants}
            >
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                variants={containerVariants}
              >
                {talismans.map((talismanUrl, index) => (
                  <motion.div 
                    key={index} 
                    className={`border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => handleTalismanClick(talismanUrl)}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative w-full overflow-hidden rounded-md" style={{ aspectRatio: '9/16' }}>
                      <Image
                        src={talismanUrl}
                        alt={`부적 이미지 ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </motion.section>

        {/* 설명 섹션 */}
        <motion.section 
          className="mt-6 text-center" 
          variants={itemVariants}
        >
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'} rounded-xl shadow-md p-6 border`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>부적 갤러리 안내</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              AI 운세 상담 후 생성된 행운의 부적을 모아 볼 수 있습니다.
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              부적 이미지를 클릭하면 더 큰 화면으로 확인할 수 있습니다.
            </p>
          </div>
        </motion.section>

        {/* 푸터 */}
        <motion.footer 
          className={`text-center mt-8 ${darkMode ? 'text-purple-400' : 'text-purple-700'} text-sm`}
          variants={itemVariants}
        >
          <p>Fortune AI - {t('fortune.updateInfo')}</p>
        </motion.footer>
      </motion.div>

      {/* 부적 팝업 */}
      {showPopup && selectedTalisman && (
        <TalismanPopup 
          imageUrl={selectedTalisman} 
          onClose={handleClosePopup} 
          title="행운의 부적"
          darkMode={darkMode}
        />
      )}
    </motion.div>
  );
} 