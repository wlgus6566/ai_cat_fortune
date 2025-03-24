'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  rightElement?: ReactNode;
}

/**
 * 왼쪽에 뒤로가기 버튼과 중앙에 타이틀이 있는 페이지 헤더 컴포넌트
 */
export default function PageHeader({ 
  title, 
  showBackButton = true, 
  onBack, 
  className = '',
  rightElement
}: PageHeaderProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // SSR 대응을 위해 마운트 전에는 투명하게 표시
  if (!mounted) {
    return (
      <div
        className={`relative h-14 w-full flex items-center justify-center px-4 opacity-0 ${className}`}
      >
        <div className="w-full h-full"></div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-14 w-full flex items-center justify-center px-4 border-b border-gray-200 ${className}`}
    >
      {showBackButton && (
        <button
          onClick={handleBackClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-700 hover:text-gray-900"
          aria-label="뒤로가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <h1 className="text-xl font-semibold text-center">{title}</h1>
      {rightElement && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
} 