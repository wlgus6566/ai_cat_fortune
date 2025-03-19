'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile } from '../types';

interface UserContextType {
  userProfile: UserProfile | null;
  isProfileComplete: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  createUserProfile: (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  clearUserProfile: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_PROFILE_KEY = 'ai_fortune_user_profile';

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지에서 사용자 프로필 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error('사용자 프로필을 로드하는 중 오류가 발생했습니다:', error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // 사용자 프로필 저장
  useEffect(() => {
    if (isLoaded && userProfile && typeof window !== 'undefined') {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
    }
  }, [userProfile, isLoaded]);

  // 사용자 프로필 생성
  const createUserProfile = (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    setUserProfile(newProfile);
  };

  // 사용자 프로필 업데이트
  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    setUserProfile(updatedProfile);
  };

  // 사용자 프로필 삭제
  const clearUserProfile = () => {
    setUserProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_PROFILE_KEY);
    }
  };

  // 사용자 프로필 완성 여부 확인
  const isProfileComplete = !!userProfile && !!userProfile.name && !!userProfile.gender && 
    !!userProfile.birthDate && !!userProfile.calendarType && !!userProfile.birthTime;

  const value = {
    userProfile,
    isProfileComplete,
    updateUserProfile,
    createUserProfile,
    clearUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser는 UserProvider 내부에서 사용해야 합니다');
  }
  return context;
} 