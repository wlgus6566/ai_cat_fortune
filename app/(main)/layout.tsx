'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigation from '@/app/components/navigation/BottomNavigation';
import { useUser } from '@/app/contexts/UserContext';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isProfileComplete } = useUser();
  const router = useRouter();

  // 프로필이 완성되지 않은 경우 설정 페이지로 리다이렉트
  useEffect(() => {
    if (!isProfileComplete) {
      router.push('/setup');
    }
  }, [isProfileComplete, router]);

  // 프로필이 완성되지 않은 경우 로딩 표시
  if (!isProfileComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-purple-600">프로필 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-purple-50 to-white pb-16">
      {children}
      <BottomNavigation />
    </div>
  );
} 