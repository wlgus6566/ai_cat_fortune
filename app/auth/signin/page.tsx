"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function SignInPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("SignIn Page Params:", {
      callbackUrl,
      error,
      allParams: Object.fromEntries(searchParams.entries()),
    });
  }, [searchParams, callbackUrl, error]);

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
      {/* 배경 이미지 */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/bg_ear_0.png"
          alt={t("bgAlt")}
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
          className="w-full py-3 bg-white rounded-full text-center text-gray-800 font-medium shadow-md flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mr-2"></div>
          ) : (
            t("signInWith", { provider: "Google" })
          )}
        </button>

        <button
          onClick={() => handleOAuthSignIn("kakao")}
          disabled={isLoading}
          className="w-full py-3 bg-[#FEE500] rounded-full text-center text-gray-800 font-medium shadow-md flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin mr-2"></div>
          ) : (
            t("signInWith", { provider: "Kakao" })
          )}
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
