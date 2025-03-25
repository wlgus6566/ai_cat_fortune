"use client";

import { useState } from "react";
import { useUser } from "@/app/contexts/UserContext";

interface TestResult {
  success: boolean;
  message?: string;
  imageUrl?: string;
  storedImageUrl?: string;
  error?: string;
}

export default function TestTalismanPage() {
  const { userProfile, isLoaded: isLoading } = useUser();
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 테스트 API 호출
  const runTest = async () => {
    setIsTestRunning(true);
    setError(null);

    try {
      // 테스트 API 호출
      const response = await fetch("/api/test-talisman-storage");
      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error("테스트 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsTestRunning(false);
    }
  };

  // 부적 생성 API 호출
  const generateTalisman = async () => {
    if (!userProfile) {
      setError("사용자 프로필이 없습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    setIsTestRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/replicate/talisman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concern: "테스트 부적, 행운",
          userName: userProfile.name || "테스트 사용자",
          userId: userProfile.id,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("부적 생성 실패:", err);
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      );
    } finally {
      setIsTestRunning(false);
    }
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">부적 이미지 저장 테스트</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">부적 이미지 저장 테스트</h1>

      {/* 사용자 정보 표시 */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">사용자 정보</h2>
        {userProfile ? (
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(userProfile, null, 2)}
          </pre>
        ) : (
          <p className="text-red-500">
            로그인하지 않았습니다. 로그인 후 다시 시도해주세요.
          </p>
        )}
      </div>

      {/* 테스트 버튼 */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={runTest}
          disabled={isTestRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTestRunning ? "테스트 중..." : "기본 이미지로 테스트"}
        </button>

        <button
          onClick={generateTalisman}
          disabled={isTestRunning || !userProfile}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isTestRunning ? "생성 중..." : "부적 이미지 생성 테스트"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-900 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error}</p>
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">테스트 결과</h2>

          <div className="p-4 bg-gray-100 rounded-lg mb-4">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          {/* 이미지 표시 */}
          {(result.imageUrl || result.storedImageUrl) && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">부적 이미지</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.imageUrl && (
                  <div>
                    <p className="mb-1 text-sm">원본 이미지:</p>
                    <img
                      src={result.imageUrl}
                      alt="원본 부적"
                      className="max-w-full h-auto border rounded"
                    />
                  </div>
                )}

                {result.storedImageUrl && (
                  <div>
                    <p className="mb-1 text-sm">저장된 이미지:</p>
                    <img
                      src={result.storedImageUrl}
                      alt="저장된 부적"
                      className="max-w-full h-auto border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
