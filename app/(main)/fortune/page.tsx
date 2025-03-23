'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Link from 'next/link';
import { DailyFortune } from '@/app/lib/openai';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// 운세 점수 시각화를 위한 컴포넌트
interface FortuneScoreProps {
  score: number;
  maxScore?: number;
  label: string;
  color: string;
}

const FortuneScore: React.FC<FortuneScoreProps> = ({ score, maxScore = 5, label, color }) => {
  // 점수 비율 계산
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/{maxScore}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
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

const CategoryCard: React.FC<CategoryCardProps> = ({ title, score, description, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 transition transform hover:shadow-md">
      <div className="flex items-center mb-2">
        <div className="text-2xl mr-2" style={{ color }}>
          {icon}
        </div>
        <h4 className="font-medium text-gray-800">{title}</h4>
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
  const today = day || new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
  return `fortune_${userId}_${today}`;
};

// 모든 이전 운세 데이터 삭제
const clearAllPreviousFortuneData = (userId: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // localStorage의 모든 키를 확인
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // fortune_ 으로 시작하는 키만 처리
      if (key && key.startsWith(`fortune_${userId}`)) {
        // 날짜 부분 추출
        const keyParts = key.split('_');
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
    console.error('Error deleting previous fortune data:', error);
  }
};

const getStoredFortune = (userId: string): DailyFortune | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const key = getStorageKey(userId);
    const storedData = localStorage.getItem(key);
    
    if (!storedData) return null;
    
    const { timestamp, fortune } = JSON.parse(storedData);
    const storedDate = new Date(timestamp).toISOString().split('T')[0];
    const todayDate = new Date().toISOString().split('T')[0];
    
    // 저장된 데이터가 오늘 날짜인 경우에만 사용
    if (storedDate === todayDate) {
      console.log('Today\'s fortune data exists in local storage.');
      return fortune;
    }
    
    // 날짜가 다르면 저장된 데이터 삭제
    console.log('Stored fortune data is not from today. Deleting it.');
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error('Error loading stored fortune data:', error);
    return null;
  }
};

const storeFortune = (userId: string, fortune: DailyFortune) => {
  if (typeof window === 'undefined') return;
  
  try {
    const key = getStorageKey(userId);
    const dataToStore = {
      timestamp: new Date().toISOString(),
      fortune: fortune
    };
    
    localStorage.setItem(key, JSON.stringify(dataToStore));
  } catch (error) {
    console.error('Error storing fortune data:', error);
  }
};

export default function HomePage() {
  const { userProfile, isProfileComplete } = useUser();
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const t = useTranslations('fortune');
  
  // 오늘의 운세 데이터 가져오기
  const fetchDailyFortune = useCallback(async (forceRefresh = false) => {
    // 이미 API 호출이 진행 중이면 리턴
    if (isApiCallInProgress) {
      console.log('API call is already in progress.');
      return;
    }
    
    if (!isProfileComplete || !userProfile || (fetchAttempted && !forceRefresh)) {
      return;
    }
    
    // 이전 날짜의 운세 데이터 모두 삭제
    if (userProfile) {
      clearAllPreviousFortuneData(userProfile.id);
    }
    
    // 로컬 스토리지에서 오늘 운세 데이터 가져오기 시도
    const storedFortune = getStoredFortune(userProfile.id);
    if (storedFortune) {
      console.log('Loaded today\'s fortune data from local storage.');
      setFortune(storedFortune);
      setLoading(false);
      setFetchAttempted(true);
      return;
    }
    
    // 오늘 날짜의 데이터가 없는 경우에만 API 호출
    try {
      setLoading(true);
      setFetchAttempted(true);
      setIsApiCallInProgress(true); // API 호출 시작
      console.log('API call started: /api/fortune/daily');
      
      const response = await fetch('/api/fortune/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: userProfile.name,
          userProfile: userProfile
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok || responseData.error) {
        throw new Error(responseData.message || 'Failed to get fortune data.');
      }
      
      const dailyFortune = responseData.data;
      console.log('API response success: Received fortune data.');
      
      // 로컬 스토리지에 운세 데이터 저장
      storeFortune(userProfile.id, dailyFortune);
      
      setFortune(dailyFortune);
      setError(null);
    } catch (error) {
      console.error('Error fetching today\'s fortune:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while loading today\'s fortune.');
    } finally {
      setLoading(false);
      setIsApiCallInProgress(false); // API 호출 종료
      console.log('API call ended');
    }
  }, [isProfileComplete, userProfile, fetchAttempted, isApiCallInProgress]);
  
  // 초기 데이터 로딩 로직
  useEffect(() => {
    if (isProfileComplete && userProfile && !isApiCallInProgress) {
      // 이미 fortune 데이터가 있으면 API 호출하지 않음
      if (fortune) {
        return;
      }
      
      // 로컬 스토리지에서 오늘 운세 데이터 가져오기 시도
      const storedFortune = getStoredFortune(userProfile.id);
      if (storedFortune) {
        console.log('useEffect: Loaded today\'s fortune data from local storage.');
        setFortune(storedFortune);
        setLoading(false);
        setFetchAttempted(true);
        return;
      }
      
      // 저장된 데이터가 없는 경우에만 API 호출
      console.log('useEffect: No fortune data for today in local storage. Calling API.');
      fetchDailyFortune(false);
    }
  }, [isProfileComplete, userProfile, fortune, isApiCallInProgress, fetchDailyFortune]);
  
  // 이전 날짜 데이터 정리
  useEffect(() => {
    if (userProfile) {
      clearAllPreviousFortuneData(userProfile.id);
    }
  }, [userProfile]);
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    // 이미 API 호출이 진행 중이면 리턴
    if (isApiCallInProgress) {
      return;
    }
    
    // 오늘 날짜의 데이터가 있는지 확인
    if (userProfile) {
      const storedFortune = getStoredFortune(userProfile.id);
      
      // 오늘 날짜의 데이터가 있으면 그 데이터를 사용
      if (storedFortune) {
        console.log('Today\'s fortune data exists in local storage. Skipping API call.');
        setFortune(storedFortune);
        setLoading(false);
        setFetchAttempted(true);
        return;
      }
      
      // 오늘 날짜의 데이터가 없는 경우에만 API 호출
      console.log('No fortune data for today in local storage. Calling API.');
      setFetchAttempted(false);
      setLoading(true);
      fetchDailyFortune(true); // 강제 새로고침
    }
  };
  
  if (!isProfileComplete) {
    // 프로필이 완성되지 않은 경우 (이미 MainLayout에서 리다이렉트 처리)
    return null;
  }
  
  // 각 카테고리별 색상 및 아이콘
  const categories = [
    { 
      key: 'love', 
      title: t('categories.love.title'), 
      color: '#e83e8c', 
      icon: '❤️' 
    },
    { 
      key: 'money', 
      title: t('categories.money.title'), 
      color: '#ffc107', 
      icon: '💰' 
    },
    { 
      key: 'health', 
      title: t('categories.health.title'), 
      color: '#28a745', 
      icon: '💪' 
    },
    { 
      key: 'social', 
      title: t('categories.social.title'), 
      color: '#17a2b8', 
      icon: '👥' 
    }
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
      className="container max-w-screen-md mx-auto px-4 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
        {/* 헤더 배너 영역 추가 */}
        <div className="flex flex-row items-center justify-between">
          <div className="max-w-[80%]">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">오늘의 운세 💫🐾</h2>
            <p className="text-purple-600 mb-4 text-sm">오늘도 운명 같은 메시지를 전해드릴게요🔮</p>
          </div>
          {/* <div className="relative w-20 h-20">
            <div className="relative w-full h-full">
              <Image src="/cat_1.png" alt="프로필 배너" fill className="object-cover" />
            </div>
          </div> */}
      </div>
      {/* 에러 표시 */}
      {error && (
        <motion.div 
          className="bg-red-50 text-red-700 p-4 rounded-lg mb-6"
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
          className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100"
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">✨</span> {t('forUser', { name: userProfile?.name || 'User', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) })}
            </h3>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">{t('loading')}</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
                <motion.button 
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('tryAgain')}
                </motion.button>
              </div>
            ) : fortune ? (
              <div className="space-y-4">
                {/* 전체 운세 점수 */}
                <motion.div 
                  className="mb-4"
                  variants={itemVariants}
                >
                  <h4 className="font-semibold text-gray-800 mb-2">{t('overall')}</h4>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <FortuneScore 
                      score={fortune.overall.score} 
                      label={t('fortuneScore')} 
                      color="#990dfa" 
                    />
                    <p className="text-gray-700 mt-2">{fortune.overall.description}</p>
                  </div>
                </motion.div>
                
                {/* 카테고리별 운세 */}
                <motion.div variants={itemVariants}>
                  <h4 className="font-semibold text-gray-800 mb-2">{t('categoryTitle')}</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.key}
                        variants={itemVariants}
                        custom={index}
                      >
                        <CategoryCard
                          title={category.title}
                          score={fortune.categories[category.key as keyof typeof fortune.categories].score}
                          description={fortune.categories[category.key as keyof typeof fortune.categories].description}
                          icon={category.icon}
                          color={category.color}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* 행운의 요소 */}
                <motion.div 
                  className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg mt-4"
                  variants={itemVariants}
                >
                  <div>
                    <p className="text-sm text-gray-600">{t('luckyColor')}</p>
                    <p className="font-medium text-gray-800">
                      <span className="mr-1">🎨</span> {fortune.luckyColor}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('luckyNumber')}</p>
                    <p className="font-medium text-gray-800">
                      <span className="mr-1">🔢</span> {fortune.luckyNumber}
                    </p>
                  </div>
                </motion.div>
                
                {/* 오늘의 조언 */}
                <motion.div 
                  className="border-t border-gray-200 pt-3 mt-3"
                  variants={itemVariants}
                >
                  <h4 className="font-semibold text-gray-800">{t('advice')}</h4>
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg flex">
                    <span className="text-lg mr-2">😺</span>
                    <p className="text-gray-700">{fortune.advice}</p>
                  </div>
                </motion.div>
                
                {/* 마지막 업데이트 시간 표시 */}
                <motion.div 
                  className="text-right mt-3"
                  variants={itemVariants}
                >
                  <p className="text-xs text-gray-500">
                    {t('updateInfo')}
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-600">{t('error')}</p>
                <motion.button 
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('tryAgain')}
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
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('quickMenu.title')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div variants={itemVariants}>
            <Link href="/chat">
              <motion.div 
                className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 h-full cursor-pointer"
                whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 text-purple-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
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
                <h4 className="font-medium text-gray-800">{t('quickMenu.chat.title')}</h4>
                <p className="text-sm text-gray-600">{t('quickMenu.chat.description')}</p>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/profile">
              <motion.div 
                className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 h-full cursor-pointer"
                whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 text-purple-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
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
                <h4 className="font-medium text-gray-800">{t('quickMenu.profile.title')}</h4>
                <p className="text-sm text-gray-600">{t('quickMenu.profile.description')}</p>
              </motion.div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/talisman-gallery">
              <motion.div 
                className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 h-full cursor-pointer"
                whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 text-purple-600">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
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
                </div>
                <h4 className="font-medium text-gray-800">{t('quickMenu.talisman.title')}</h4>
                <p className="text-sm text-gray-600">{t('quickMenu.talisman.description')}</p>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}   