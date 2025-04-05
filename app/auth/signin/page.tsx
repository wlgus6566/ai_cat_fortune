"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

// 로그인 내용을 담은 컴포넌트
function SignInContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const error = searchParams?.get("error");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("isLoading", isLoading);
    console.log("SignIn Page Params:", {
      callbackUrl,
      error,
      allParams: Object.fromEntries(searchParams?.entries() || []),
    });
  }, [searchParams, callbackUrl, error, isLoading]);

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      console.log(`로그인 시도: ${provider}, 콜백 URL: ${callbackUrl}`);

      // 소셜 로그인 시도
      await signIn(provider, {
        callbackUrl: callbackUrl || "/",
        redirect: true,
      });
    } catch (error) {
      console.error(`로그인 중 오류 발생 (${provider}):`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col justify-end relative">
      {isLoading && (
        <div className="bg-black/70 flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-101">
          <div className="w-12 h-12 border-4 border-[#990dfa]/20 border-t-[#990dfa] rounded-full animate-spin"></div>
        </div>
      )}
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/bg_ear_0.png"
          alt="배경이미지"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 로그인 버튼 */}
      <div className="mb-20 relative w-full max-w-md z-100 flex flex-col items-center gap-4 px-8">
        <button
          onClick={() => handleOAuthSignIn("google")}
          disabled={isLoading}
          className="relative w-full py-3 bg-white rounded-full text-center text-gray-800 font-medium shadow-md flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 48 48"
            className="absolute left-10 top-1/2 -translate-y-1/2"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.5-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.1l6.6 4.8C14.5 15.5 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.6 29.6 4 24 4c-7.4 0-13.7 4.1-17.1 10.1z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.4-5.3C29.9 35.4 27.1 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C10.2 39.6 16.6 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5h-1.9V20H24v8h11.3c-.9 2.6-2.6 4.8-4.8 6.3l6.4 5.3c-.5.5 6.1-4.5 6.1-13.6 0-1.3-.1-2.5-.4-3.5z"
            />
          </svg>

          {t("signInWith", { provider: "Google" })}
        </button>

        <button
          onClick={() => handleOAuthSignIn("kakao")}
          disabled={isLoading}
          className="relative w-full py-3 bg-[#FEE500] rounded-full text-center text-gray-800 font-medium shadow-md flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 300"
            width="20"
            height="20"
            className="absolute left-10 top-1/2 mt-1 -translate-y-1/2"
          >
            <path
              fill="#3C1E1E"
              d="M150 20C80.6 20 25 65.2 25 120c0 35.7 25.6 67.1 64.3 86.2-2.2 8.2-10.1 33.4-12.3 40.9-1.9 6.5 2.4 6.6 5 5.1 2-1.2 32.6-22.6 45.4-31.5 7.2 0.9 14.6 1.4 22.5 1.4 69.4 0 125-45.2 125-100S219.4 20 150 20z"
            />
            <path
              fill="#FFE812"
              d="M99.6 144.5c-2.2 0-3.8-0.5-4.7-1.4-1-1-1.5-2.6-1.4-4.9l0.5-14.3c0.1-4.3 0-7.3-0.3-9.1-0.3-1.8-1.2-2.8-2.7-3.1-1.6-0.3-4.2-0.3-7.8 0-3.1 0.2-5.1-1.5-5.3-4.2-0.2-2.8 1.4-4.7 4.7-5.5 2.5-0.6 7.8-0.9 15.9-0.9 6.3 0 10.4 0.3 12.4 0.8 2.2 0.6 3.3 2.1 3.3 4.5 0 2.4-0.9 4-2.7 4.8-0.6 0.3-1.8 0.5-3.5 0.6-1.8 0.1-3 0.3-3.6 0.5-1.5 0.6-2.3 1.6-2.5 3-0.2 1.3-0.3 4.5-0.3 9.5v13.8c0 2.3-0.6 4-1.8 5.1-1 0.9-2.5 1.3-4.6 1.3zm27.2-0.6c-2.5 0-4.4-0.6-5.7-1.8-1.3-1.2-2-2.9-2-5.1 0-2.1 0.9-5 2.6-8.8l10.4-24.2c0.7-1.5 1.4-2.6 2-3.2 0.8-0.7 1.9-1 3.2-1 1.5 0 2.6 0.3 3.4 1 0.6 0.5 1.3 1.6 2 3.2l10.4 24.2c1.7 3.9 2.6 6.7 2.6 8.8 0 2.2-0.7 3.9-2 5.1-1.3 1.2-3.2 1.8-5.7 1.8-2.6 0-4.5-0.6-5.7-1.8-1.2-1.2-2.1-2.9-2.8-5.2l-0.8-2.5h-9.6l-0.9 2.5c-0.7 2.3-1.6 4-2.8 5.2-1.1 1.2-3 1.8-5.6 1.8zm5.8-15.8h6.3l-3.2-9.2-3.1 9.2zm35.3 15.6c-2.6 0-4.5-0.6-5.8-1.8-1.3-1.2-1.9-2.9-1.9-5.1V99.7c0-2.2 0.6-3.9 1.9-5.1 1.3-1.2 3.2-1.8 5.8-1.8 2.6 0 4.5 0.6 5.8 1.8 1.3 1.2 2 2.9 2 5.1v18.6c0 0.3-0.1 0.8-0.2 1.6-0.1 0.6-0.1 1.1-0.1 1.3 0 0.3 0.1 0.6 0.3 0.8s0.5 0.4 0.9 0.4c0.3 0 0.8-0.1 1.4-0.2l3-0.3c2.5-0.2 4.3 1.1 5.1 3.8 0.7 2.5-0.6 4.4-4.1 5.6-2.3 0.8-5.8 1.2-10.6 1.2zm22.6 0.1c-2.2 0-3.8-0.5-4.8-1.4-1-1-1.5-2.6-1.5-4.9l0.5-14.3c0.1-4.3 0-7.3-0.3-9.1-0.3-1.8-1.2-2.8-2.7-3.1-1.6-0.3-4.2-0.3-7.8 0-3.1 0.2-5.1-1.5-5.3-4.2-0.2-2.8 1.4-4.7 4.7-5.5 2.5-0.6 7.8-0.9 15.9-0.9 6.3 0 10.4 0.3 12.4 0.8 2.2 0.6 3.3 2.1 3.3 4.5 0 2.4-0.9 4-2.7 4.8-0.6 0.3-1.8 0.5-3.5 0.6-1.8 0.1-3 0.3-3.6 0.5-1.5 0.6-2.3 1.6-2.5 3-0.2 1.3-0.3 4.5-0.3 9.5v13.8c0 2.3-0.6 4-1.8 5.1-1 0.9-2.5 1.3-4.6 1.3z"
            />
          </svg>

          {t("signInWith", { provider: "Kakao" })}
        </button>

        {error && (
          <div className="w-full mt-2 p-2 bg-red-100 text-red-800 text-sm rounded-md text-center">
            {error}: {t("errors.default")}
          </div>
        )}
      </div>

      {/* 디버깅 정보 (개발용, 화면에 표시되지 않음) */}
      {process.env.NODE_ENV === "development" && (
        <div className="hidden">
          <p>콜백 URL: {callbackUrl || "없음"}</p>
          <p>환경: {process.env.NODE_ENV}</p>
          <p>
            NextAuth URL:{" "}
            {process.env.NEXT_PUBLIC_NEXTAUTH_URL || "설정되지 않음"}
          </p>
        </div>
      )}
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
