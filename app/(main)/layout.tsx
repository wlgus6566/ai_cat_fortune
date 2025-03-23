'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, ChatBubbleOvalLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUser } from '@/app/contexts/UserContext';
import { useTranslations } from 'next-intl';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isProfileComplete, userProfile } = useUser();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();
  const t = useTranslations();

  // 페이지 로드 시 초기 isProfileComplete가 false일 때 바로 리다이렉트하지 않고
  // 프로필 데이터 로드가 완료될 때까지 기다립니다.
  useEffect(() => {
    if (isInitialLoad) {
      // 프로필 데이터가 로드된 경우 초기 로드 상태를 false로 변경
      if (userProfile !== null) {
        setIsInitialLoad(false);
      }
      return; // 초기 로드 중에는 리다이렉트하지 않음
    }
    
    // 초기 로드가 완료된 후에 isProfileComplete가 false이면 리다이렉트
    if (isProfileComplete === false) {
      router.push('/profile/edit');
    }
  }, [isProfileComplete, router, isInitialLoad, userProfile]);

  // 프로필이 완성되지 않은 경우 로딩 표시
  if (isInitialLoad || (!isProfileComplete && userProfile === null)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-purple-600">프로필 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-white pb-16">
      <main className="flex-grow">{children}</main>
      
      {/* 하단 네비게이션 바 */}
      <nav className="fixed bottom-0 w-full bg-white shadow-md z-10">
        <div className="max-w-screen-md mx-auto flex justify-around">
          {/* 홈 버튼 */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center p-3 w-1/3 hover:bg-gray-100"
          >
            <HomeIcon className="h-6 w-6 text-gray-500" />
            <span className="text-xs text-gray-500 mt-1">{t('navigation.home')}</span>
          </Link>
          
          {/* 채팅 버튼 */}
          <Link
            href="/chat"
            className="flex flex-col items-center justify-center p-3 w-1/3 hover:bg-gray-100"
          >
            <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-500" />
            <span className="text-xs text-gray-500 mt-1">{t('navigation.chat')}</span>
          </Link>
          
          {/* 프로필 버튼 */}
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center p-3 w-1/3 hover:bg-gray-100"
          >
            <UserIcon className="h-6 w-6 text-gray-500" />
            <span className="text-xs text-gray-500 mt-1">{t('navigation.profile')}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
} 