'use client';

import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut({ callbackUrl: '/' });
      } catch (e) {
        setError('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('로그아웃 오류:', e);
      }
    };

    performSignOut();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">로그아웃 중...</h1>
        {error ? (
          <div>
            <p className="text-red-500 text-center mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
} 