'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/contexts/UserContext';

export default function Home() {
  const { isProfileComplete } = useUser();
  const router = useRouter();

  // 프로필 완성 여부에 따라 적절한 페이지로 리디렉션
  useEffect(() => {
    if (isProfileComplete) {
      router.push('/chat');
    } else {
      router.push('/setup');
    }
  }, [isProfileComplete, router]);

  // 리디렉션 중 로딩 표시
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-purple-600">페이지 이동 중...</p>
      </div>
    </main>
  );
}
