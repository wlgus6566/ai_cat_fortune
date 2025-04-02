"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense } from "react";

// 에러 메시지를 표시하는 컴포넌트 분리
function ErrorContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  console.log(
    "Auth Error Page Params:",
    Object.fromEntries(searchParams.entries())
  );

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "AccessDenied":
        return t("errors.accessDenied");
      case "Callback":
        return t("errors.callback");
      case "OAuthSignin":
        return t("errors.oauthSignin");
      case "OAuthCallback":
        return t("errors.oauthCallback");
      case "SessionRequired":
        return t("errors.sessionRequired");
      default:
        return t("errors.default");
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {t("errorTitle")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {getErrorMessage(error)}
        </p>

        {/* 디버깅 정보 */}
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            {t("errorCode")}: {error || "Unknown"}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/auth/signin"
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {t("tryAgain")}
        </Link>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function AuthErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <Suspense fallback={<p>로딩 중...</p>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
