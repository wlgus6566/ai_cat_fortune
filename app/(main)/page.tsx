'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const { userProfile, isProfileComplete } = useUser();
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 시간에 따른 인사말 설정
    const hours = new Date().getHours();
    let newGreeting;
    
    if (hours >= 5 && hours < 12) {
      newGreeting = '좋은 아침이에요';
    } else if (hours >= 12 && hours < 18) {
      newGreeting = '좋은 오후에요';
    } else {
      newGreeting = '좋은 밤이에요';
    }
    
    setGreeting(newGreeting);
    
    // 현재 날짜 표시
    const today = new Date();
    const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    setDate(formattedDate);
    
    // 로딩 상태 업데이트
    if (isProfileComplete) {
      setTimeout(() => {
        setLoading(false);
      }, 1000); // 간단한 로딩 효과를 위한 지연
    }
  }, [isProfileComplete]);
  
  if (!isProfileComplete) {
    // 프로필이 완성되지 않은 경우 (이미 MainLayout에서 리다이렉트 처리)
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      {/* 헤더 섹션 */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {greeting},
          </h1>
          <h2 className="text-xl font-medium text-purple-700">
            {userProfile?.name}님
          </h2>
          <p className="text-sm text-gray-600 mt-1">{date}</p>
        </div>
        
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-200">
          {userProfile?.profileImageUrl ? (
            <Image 
              src={userProfile.profileImageUrl} 
              alt="프로필 이미지" 
              fill 
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-purple-100 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-purple-500" 
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
          )}
        </div>
      </header>
      
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
            ) : (
              <div className="space-y-3">
                <p className="text-gray-800">
                  아직 오늘의 운세 정보가 준비되지 않았습니다. 
                  곧 이곳에서 당신만을 위한 오늘의 운세를 확인하실 수 있을 거예요.
                </p>
                <p className="text-gray-600 text-sm">
                  * 매일 아침 새로운 운세가 업데이트됩니다.
                </p>
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
              <p className="text-sm text-gray-600">AI와 1:1 운세 상담하기</p>
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
              <p className="text-sm text-gray-600">프로필 정보 변경하기</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
} 