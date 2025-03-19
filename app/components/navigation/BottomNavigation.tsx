'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AppTab } from '@/app/types';

export default function BottomNavigation() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  
  useEffect(() => {
    if (pathname === '/') {
      setActiveTab('home');
    } else if (pathname.includes('/chat')) {
      setActiveTab('chat');
    } else if (pathname.includes('/profile')) {
      setActiveTab('profile');
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around">
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center w-1/3 h-full ${activeTab === 'home' ? 'text-purple-600' : 'text-gray-500'}`}
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
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
        <span className="text-xs mt-1">홈</span>
      </Link>
      
      <Link 
        href="/chat" 
        className={`flex flex-col items-center justify-center w-1/3 h-full ${activeTab === 'chat' ? 'text-purple-600' : 'text-gray-500'}`}
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        <span className="text-xs mt-1">상담</span>
      </Link>
      
      <Link 
        href="/profile" 
        className={`flex flex-col items-center justify-center w-1/3 h-full ${activeTab === 'profile' ? 'text-purple-600' : 'text-gray-500'}`}
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
        <span className="text-xs mt-1">프로필</span>
      </Link>
    </nav>
  );
} 