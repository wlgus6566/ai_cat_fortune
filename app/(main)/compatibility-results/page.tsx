"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Star, Heart, Clock, Loader2 } from "lucide-react";
import PageHeader from "@/app/components/PageHeader";

type CompatibilityResult = {
  id: number;
  resultType: "love" | "friend";
  person1Name: string;
  person2Name: string;
  totalScore: number;
  createdAt: string;
};

export default function CompatibilityResultsPage() {
  const [results, setResults] = useState<CompatibilityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "love" | "friend">("all");
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const queryParam = filter !== "all" ? `?type=${filter}` : "";
      const response = await fetch(`/api/compatibility-results${queryParam}`);

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
  }, [filter]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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
        title="궁합 결과 모아보기"
        className="bg-white shadow-md relative z-10"
      />

      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-[#3B2E7E] mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            내 궁합 결과 모음
          </motion.h1>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            나의 모든 궁합 결과를 한눈에 확인하세요
          </motion.p>

          {/* 필터 버튼 */}
          <motion.div
            className="flex justify-center gap-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#990dfa] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("all")}
            >
              전체
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                filter === "love"
                  ? "bg-[#990dfa] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("love")}
            >
              <Heart className="w-4 h-4 mr-1" /> 연인
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                filter === "friend"
                  ? "bg-[#990dfa] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("friend")}
            >
              <Star className="w-4 h-4 mr-1" /> 친구
            </button>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-[#990dfa] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <Image
              src="/new_cat_waiting.png"
              alt="결과 없음"
              width={100}
              height={100}
              className="mx-auto"
            />
            <p className="text-gray-600 mt-4">저장된 궁합 결과가 없습니다.</p>
            <div className="mt-6 flex gap-4 justify-center">
              <Link
                href="/compatibility"
                className="px-4 py-2 bg-[#F9F5FF] text-[#990dfa] font-medium rounded-full border border-[#990dfa]/20 hover:bg-[#F5EBFF] transition-colors flex items-center"
              >
                <Heart className="w-4 h-4 mr-2" /> 연인 궁합 보기
              </Link>
              <Link
                href="/friendship-compatibility"
                className="px-4 py-2 bg-[#F9F5FF] text-[#990dfa] font-medium rounded-full border border-[#990dfa]/20 hover:bg-[#F5EBFF] transition-colors flex items-center"
              >
                <Star className="w-4 h-4 mr-2" /> 친구 궁합 보기
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/compatibility-results/${result.id}`}>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-[#990dfa]/20 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-[#F9F5FF] rounded-full flex items-center justify-center mr-4 border border-[#990dfa]/20">
                          {result.resultType === "love" ? (
                            <Heart className="w-6 h-6 text-[#990dfa]" />
                          ) : (
                            <Star className="w-6 h-6 text-[#990dfa]" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-[#3B2E7E] mb-1">
                            {result.person1Name} ❤️ {result.person2Name}
                          </h3>

                          <div className="flex items-center text-gray-600 text-sm">
                            <div className="flex items-center mr-4">
                              <Clock className="w-4 h-4 mr-1" />
                              {format(
                                new Date(result.createdAt),
                                "yyyy년 M월 d일",
                                { locale: ko }
                              )}
                            </div>

                            <div className="flex items-center">
                              <div className="text-[#990dfa] font-medium flex items-center">
                                {result.totalScore}점
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDelete(result.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label="삭제"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
