"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, ArrowLeft, Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import PageHeader from "@/app/components/PageHeader";

type CompatibilityResult = {
  id: number;
  resultType: "love" | "friend";
  person1Name: string;
  person2Name: string;
  totalScore: number;
  createdAt: string;
};

export default function ZodiacCompatibilityPage() {
  const router = useRouter();
  const [results, setResults] = useState<CompatibilityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 궁합 결과 데이터 가져오기
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/compatibility-results");

      if (!response.ok) {
        throw new Error("결과를 가져오는 중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("결과 조회 중 오류:", error);
      setError("결과를 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // 궁합 검사 결과 삭제
  async function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("이 결과를 정말 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/compatibility-results/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("결과 삭제 중 오류가 발생했습니다.");
      }

      // 삭제 후 목록 갱신
      setResults(results.filter((result) => result.id !== id));
    } catch (error) {
      console.error("결과 삭제 중 오류:", error);
      setError("결과 삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
      <PageHeader
        title=""
        className="bg-transparent shadow-none border-none relative z-10"
      />

      <div className="container max-w-md mx-auto px-4 pt-4 pb-16">
        {/* 메인 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3B2E7E]">2025 친구 궁합</h1>
        </div>

        {/* 친구 궁합 유형 카드 */}
        <div className="w-full h-full flex justify-center items-center">
          <Image src="/chemy.png" alt="궁합" width={300} height={300} />
        </div>

        {/* 친구/연인 궁합 버튼 */}
        <div className="my-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/friendship-compatibility")}
            className="w-full py-4 px-6 bg-[#990dfa] text-white rounded-full font-medium flex items-center justify-center shadow-md"
          >
            다른 친구랑 궁합 보기
          </motion.button>
        </div>

        {/* 이전 궁합 결과 목록 */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#3B2E7E] mb-4">
            나의 궁합 기록
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 text-[#990dfa] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <Image
              src="/new_cat.png"
              alt="결과 없음"
              width={80}
              height={80}
              className="mx-auto"
            />
            <p className="text-gray-600 mt-4 mb-6">저장된 궁합 결과가 없어요</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/compatibility"
                className="px-6 py-3 bg-white text-[#990dfa] font-medium rounded-full border border-[#990dfa]/30 hover:bg-[#F9F5FF] transition-colors inline-flex items-center justify-center"
              >
                <Heart className="w-4 h-4 mr-2" /> 연인 궁합 보기
              </Link>
              <Link
                href="/friendship-compatibility"
                className="px-6 py-3 bg-white text-[#990dfa] font-medium rounded-full border border-[#990dfa]/30 hover:bg-[#F9F5FF] transition-colors inline-flex items-center justify-center"
              >
                <Star className="w-4 h-4 mr-2" /> 친구 궁합 보기
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <Link
                key={result.id}
                href={`/compatibility-results/${result.id}`}
                className="block"
              >
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#990dfa]/20 hover:shadow-sm transition-all">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 border border-gray-200 overflow-hidden">
                      {result.resultType === "love" ? (
                        <div className="bg-[#FFE0F0] w-full h-full flex items-center justify-center">
                          <span className="text-lg">💜</span>
                        </div>
                      ) : (
                        <div className="bg-[#E0F0FF] w-full h-full flex items-center justify-center">
                          <span className="text-lg">🍎</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="text-md font-medium text-[#3B2E7E]">
                          {result.person1Name}과 {result.person2Name}
                        </h3>
                        <div className="text-[#990dfa] font-medium text-sm">
                          {result.totalScore}점
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(
                          new Date(result.createdAt),
                          "yyyy년 MM월 dd일",
                          {
                            locale: ko,
                          }
                        )}
                        <div
                          className="ml-auto cursor-pointer p-1"
                          onClick={(e) => handleDelete(result.id, e)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400 hover:text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {result.resultType === "love" ? (
                      <span className="bg-[#FFE0F0] text-[#FF4D80] text-xs px-2 py-1 rounded-full">
                        연인 궁합
                      </span>
                    ) : (
                      <span className="bg-[#E0F0FF] text-[#3B82F6] text-xs px-2 py-1 rounded-full">
                        친구 궁합
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      #{result.person1Name}과 {result.person2Name}의 케미
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
