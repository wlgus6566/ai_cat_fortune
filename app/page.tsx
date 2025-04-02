"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { useSession } from "next-auth/react";

export default function Home() {
  const { isProfileComplete, isAuthenticated, isLoaded } = useUser();
  const { status } = useSession();
  const router = useRouter();

  // 인증 상태 및 프로필 완성 여부에 따라 적절한 페이지로 리디렉션
  useEffect(() => {
    // 사용자 정보 로딩이 완료된 경우에만 리디렉션
    if (!isLoaded) return;

    // 로그인 상태 확인
    if (isAuthenticated) {
      console.log("사용자 인증됨, 프로필 완성 여부:", isProfileComplete);

      // 프로필 완성 여부에 따라 적절한 페이지로 리디렉션
      if (isProfileComplete) {
        router.push("/fortune");
      } else {
        router.push("/setup");
      }
    } else if (status === "unauthenticated") {
      // 인증되지 않은 경우 로그인 페이지로 이동
      console.log("인증되지 않은 사용자, 로그인 페이지로 이동");
      router.push("/auth/signin");
    }
  }, [isProfileComplete, isAuthenticated, isLoaded, router, status]);

  // 리디렉션 중 로딩 표시
  return (
    <main className="flex h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        <p className="mt-4 text-purple-600">페이지 이동 중...</p>
      </div>
    </main>
  );
}
