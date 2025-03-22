'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Link from 'next/link';
import { DailyFortune } from '@/app/lib/openai';

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
        <FortuneScore score={score} label={`${title} 점수`} color={color} />
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
            console.log(`이전 운세 데이터 삭제: ${key}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('이전 운세 데이터 삭제 오류:', error);
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
      console.log('로컬 스토리지에 오늘자 운세 데이터가 있습니다.');
      return fortune;
    }
    
    // 날짜가 다르면 저장된 데이터 삭제
    console.log('저장된 운세 데이터가 오늘 날짜가 아닙니다. 삭제합니다.');
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error('저장된 운세 데이터 불러오기 오류:', error);
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
    console.error('운세 데이터 저장 오류:', error);
  }
};

export default function HomePage() {
  const { userProfile, isProfileComplete } = useUser();
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  
  // 오늘의 운세 데이터 가져오기
  const fetchDailyFortune = useCallback(async (forceRefresh = false) => {
    // 이미 API 호출이 진행 중이면 리턴
    if (isApiCallInProgress) {
      console.log('이미 API 호출이 진행 중입니다.');
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
      console.log('로컬 스토리지에서 오늘의 운세 데이터를 불러왔습니다.');
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
      console.log('API 호출 시작: /api/fortune/daily');
      
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
        throw new Error(responseData.message || '운세 데이터를 가져오는데 실패했습니다.');
      }
      
      const dailyFortune = responseData.data;
      console.log('API 응답 성공: 운세 데이터를 받았습니다.');
      
      // 로컬 스토리지에 운세 데이터 저장
      storeFortune(userProfile.id, dailyFortune);
      
      setFortune(dailyFortune);
      setError(null);
    } catch (error) {
      console.error('오늘의 운세 가져오기 오류:', error);
      setError(error instanceof Error ? error.message : '오늘의 운세를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setIsApiCallInProgress(false); // API 호출 종료
      console.log('API 호출 종료');
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
        console.log('useEffect: 로컬 스토리지에서 오늘의 운세 데이터를 불러왔습니다.');
        setFortune(storedFortune);
        setLoading(false);
        setFetchAttempted(true);
        return;
      }
      
      // 저장된 데이터가 없는 경우에만 API 호출
      console.log('useEffect: 로컬 스토리지에 오늘의 운세 데이터가 없습니다. API를 호출합니다.');
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
        console.log('로컬 스토리지에 오늘 날짜의 운세 데이터가 있습니다. API 호출을 건너뜁니다.');
        setFortune(storedFortune);
        setLoading(false);
        setFetchAttempted(true);
        return;
      }
      
      // 오늘 날짜의 데이터가 없는 경우에만 API 호출
      console.log('로컬 스토리지에 오늘 날짜의 운세 데이터가 없습니다. API를 호출합니다.');
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
      title: '연애운', 
      color: '#e83e8c', 
      icon: '❤️' 
    },
    { 
      key: 'money', 
      title: '금전운', 
      color: '#ffc107', 
      icon: '💰' 
    },
    { 
      key: 'health', 
      title: '건강운', 
      color: '#28a745', 
      icon: '💪' 
    },
    { 
      key: 'social', 
      title: '인간관계', 
      color: '#17a2b8', 
      icon: '👥' 
    }
  ];
  
  return (
    <div className="container max-w-screen-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">오늘의 운세</h1>
        <p className="text-gray-600">
          {userProfile?.name}님을 위한 {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 운세입니다.
        </p>
      </header>
      
      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p className="flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </p>
        </div>
      )}
      
      {/* 오늘의 운세 섹션 */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100">
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">✨</span> 오늘의 운세
            </h3>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">오늘의 운세를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  onClick={handleRefresh}
                >
                  다시 시도
                </button>
              </div>
            ) : fortune ? (
              <div className="space-y-4">
                {/* 전체 운세 점수 */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">전체 운세</h4>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <FortuneScore 
                      score={fortune.overall.score} 
                      label="오늘의 운세 점수" 
                      color="#990dfa" 
                    />
                    <p className="text-gray-700 mt-2">{fortune.overall.description}</p>
                  </div>
                </div>
                
                {/* 카테고리별 운세 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">카테고리별 운세</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categories.map(category => (
                      <CategoryCard 
                        key={category.key}
                        title={category.title}
                        score={fortune.categories[category.key as keyof typeof fortune.categories].score}
                        description={fortune.categories[category.key as keyof typeof fortune.categories].description}
                        icon={category.icon}
                        color={category.color}
                      />
                    ))}
                  </div>
                </div>
                
                {/* 행운의 요소 */}
                <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg mt-4">
                  <div>
                    <p className="text-sm text-gray-600">오늘의 행운 색상</p>
                    <p className="font-medium text-gray-800">
                      <span className="mr-1">🎨</span> {fortune.luckyColor}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">행운의 숫자</p>
                    <p className="font-medium text-gray-800">
                      <span className="mr-1">🔢</span> {fortune.luckyNumber}
                    </p>
                  </div>
                </div>
                
                {/* 오늘의 조언 */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="font-semibold text-gray-800">오늘의 조언</h4>
                  <div className="mt-2 p-3 bg-purple-50 rounded-lg flex">
                    <span className="text-lg mr-2">😺</span>
                    <p className="text-gray-700">{fortune.advice}</p>
                  </div>
                </div>
                
                {/* 마지막 업데이트 시간 표시 */}
                <div className="text-right mt-3">
                  <p className="text-xs text-gray-500">
                    * 운세 정보는 하루에 한 번만 업데이트됩니다
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-600">운세 데이터를 불러올 수 없습니다.</p>
                <button 
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  onClick={handleRefresh}
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 빠른 메뉴 섹션 */}
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">빠른 메뉴</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/chat">
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 transition transform hover:scale-105 hover:shadow-md cursor-pointer">
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
              <h4 className="font-medium text-gray-800">운세 상담</h4>
              <p className="text-sm text-gray-600">포춘냥이와 고민상담하기</p>
            </div>
          </Link>
          
          <Link href="/profile">
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 transition transform hover:scale-105 hover:shadow-md cursor-pointer">
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
              <h4 className="font-medium text-gray-800">내 프로필</h4>
              <p className="text-sm text-gray-600">프로필 정보 / 부적 관리</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
} 