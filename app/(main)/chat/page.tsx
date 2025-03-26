"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import FortuneChat from "@/app/components/FortuneChat";

export default function ChatPage() {
  const { userProfile, isProfileComplete } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-4 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">포춘냥이</h1>
        <p className="text-sm text-gray-600">고민을 편하게 말해보라냥😸</p>
      </header>

      <div className="container mx-auto px-4 py-4 min-h-[calc(100vh-84px)] pb-20 max-w-md">
        {/* FortuneChat 컴포넌트 불러오기 */}
        <FortuneChat
          userName={userProfile?.name || "사용자"}
          userProfile={userProfile}
        />
      </div>
    </div>
  );
}
