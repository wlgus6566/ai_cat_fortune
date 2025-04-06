"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import FortuneChat from "@/app/components/FortuneChat";
import { UserProfile } from "@/app/type/types";
import { Calendar } from "lucide-react";

export default function ChatPage() {
  const { userProfile, isProfileComplete } = useUser();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");

  // 날짜 포맷팅 함수
  const formatDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // 요일 계산
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekDay = weekDays[now.getDay()];

    return `${year}년 ${month}월 ${day}일 ${weekDay}요일`;
  };

  useEffect(() => {
    // 현재 날짜 설정
    setCurrentDate(formatDate());

    // 프로필이 완성된 경우 로딩 상태 업데이트
    if (isProfileComplete) {
      // 간단한 로딩 효과를 위한 지연
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [isProfileComplete]);

  if (!isProfileComplete) {
    // 프로필이 완성되지 않은 경우 (이미 MainLayout에서 리다이렉트 처리)
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // userProfile이 null인 경우 기본값 제공
  const defaultProfile: UserProfile = {
    id: "guest",
    name: "사용자",
    gender: null,
    birthDate: "",
    calendarType: null,
    birthTime: "모름",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="bg-gray-50">
      <header className="fixed top-0 left-0 right-0 w-full h-[81px] z-10 bg-white border-b border-gray-200 py-4 px-4 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">포춘냥이</h1>
        <p className="text-sm text-gray-600">고민을 편하게 말해보라냥😸</p>
      </header>

      <div className="container relative mx-auto pt-[81px] z-0 px-4 py-4 min-h-[calc(100vh-84px)] pb-20 max-w-lg">
        {/* 날짜 표시 UI */}
        <div className="flex items-center justify-center mt-5">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium">{currentDate}</span>
          </div>
        </div>
        <FortuneChat
          userName={userProfile?.name || "사용자"}
          userProfile={userProfile || defaultProfile}
        />
      </div>
    </div>
  );
}
