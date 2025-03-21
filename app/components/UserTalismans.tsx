'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface UserTalismansProps {
  userId: string;
}

export default function UserTalismans({ userId }: UserTalismansProps) {
  const [talismans, setTalismans] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTalismans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/talisman/user?userId=${userId}`);
        
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
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (talismans.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 my-4 text-center">
        <p className="text-gray-500">아직 생성된 부적 이미지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-4">나의 부적 이미지</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {talismans.map((talismanUrl, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-md p-2 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image
                src={talismanUrl}
                alt={`부적 이미지 ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-sm text-gray-500">부적 {index + 1}</span>
              <a 
                href={talismanUrl} 
                download={`talisman-${index + 1}.jpg`}
                target="_blank"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                다운로드
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 