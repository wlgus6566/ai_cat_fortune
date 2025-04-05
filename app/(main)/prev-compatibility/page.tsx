"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import PageHeader from "@/app/components/PageHeader";

// 호환성 결과 타입 정의
type CompatibilityResult = {
  id: number;
  resultType: "love" | "friend";
  person1Name: string;
  person2Name: string;
  totalScore: number;
  createdAt: string;
};

// 카카오 SDK 타입 정의 추가
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: KakaoShareOptions) => void;
      };
    };
  }
}

// 카카오 공유 옵션 타입
interface KakaoShareOptions {
  objectType: string;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons: {
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }[];
}

export default function PrevCompatibilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<CompatibilityResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카카오 SDK 초기화
  useEffect(() => {
    // 카카오 SDK 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => {
      // Kakao SDK 초기화
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "");
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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

  const goCompatibility = () => {
    const targetPage = searchParams.get("target") || "friendship-compatibility";
    router.push(`/${targetPage}?from=prev`);
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // 궁합 검사 결과 삭제
  // async function handleDelete(id: number, e: React.MouseEvent) {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   if (!confirm("이 결과를 정말 삭제하시겠습니까?")) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/compatibility-results/${id}`, {
  //       method: "DELETE",
  //     });

  //     if (!response.ok) {
  //       throw new Error("결과 삭제 중 오류가 발생했습니다.");
  //     }

  //     // 삭제 후 목록 갱신
  //     setResults(results.filter((result) => result.id !== id));
  //   } catch (error) {
  //     console.error("결과 삭제 중 오류:", error);
  //     setError("결과 삭제 중 오류가 발생했습니다.");
  //   }
  // }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
      <PageHeader
        title=""
        className="bg-transparent shadow-none border-none relative z-10"
      />
      <p className={`text-md text-[#3B2E7E] text-center`}>
        우린 얼마나 찰떡궁합일까? 궁금하지?
        <br />
        너랑 나의 운명, 내가 점쳐줄게옹!
      </p>
      <div className="container max-w-md mx-auto px-4 pt-4 pb-24">
        {/* 친구 궁합 유형 카드 */}
        <div className="w-full h-full flex justify-center items-center">
          <Image src="/chemy.png" alt="궁합" width={200} height={200} />
        </div>

        {/* 친구/연인 궁합 버튼 */}
        <div className="my-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goCompatibility}
            className="w-full py-4 px-6 bg-[#990dfa] text-white rounded-full font-medium flex items-center justify-center shadow-md"
          >
            마법 궁합 보러가기 ✨
          </motion.button>
        </div>

        {/* 이전 궁합 결과 목록 */}
        {results.length !== 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#3B2E7E] mb-4">
              케미 저장소
            </h2>
          </div>
        )}

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
            {/* <Image
              src="/new_cat.png"
              alt="결과 없음"
              width={80}
              height={80}
              className="mx-auto"
            />
            <p className="text-gray-600 mt-4 mb-6">저장된 궁합 결과가 없어요</p> */}

            {/* 가이드 스텝 추가 */}
            <div className="px-4">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-xl font-bold text-[#3B2E7E]">
                  1
                </div>
                <p className="text-left text-gray-700 font-medium">
                  DM, 카카오톡으로 보낸 링크로
                </p>
              </div>

              <div className="flex items-center mb-5">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-xl font-bold text-[#3B2E7E]">
                  2
                </div>
                <p className="text-left text-gray-700 font-medium">
                  친구가 확인하면
                </p>
              </div>

              <div className="flex items-start mb-5">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 text-xl font-bold text-[#3B2E7E]">
                  3
                </div>
                <div className="text-left">
                  <p className="text-gray-700 font-medium">
                    나와 친구와 관계도를 포함해
                  </p>
                  <p className="text-gray-700 font-medium">
                    디테일한 궁합을 확인할 수 있어요! 🎉
                  </p>
                </div>
              </div>
            </div>

            {/* 공유 버튼 */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium text-[#3B2E7E] mb-4">
                친구들에게 궁합 테스트를 공유해보세요!
              </h3>
              <div className="flex justify-center gap-8 mb-4">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/friendship-compatibility`;
                    navigator.clipboard.writeText(url);
                    alert("링크가 복사되었습니다!");
                  }}
                  className="flex flex-col items-center border-none bg-transparent"
                >
                  <div className="bg-[#0070f3] w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-md">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    링크 복사
                  </span>
                </button>

                <button
                  onClick={() => {
                    const url = `${window.location.origin}/friendship-compatibility`;
                    if (window.Kakao && window.Kakao.Share) {
                      console.log("Kakao 객체:", window.Kakao);
                      console.log(
                        "Kakao 초기화 여부:",
                        window.Kakao?.isInitialized?.()
                      );
                      console.log("Kakao.Share 객체:", window.Kakao?.Share);
                      try {
                        // 로컬환경이면 카카오 공유가 제대로 작동하지 않을 수 있음을 알리기
                        if (window.location.hostname === "localhost") {
                          alert(
                            "로컬 환경에서는 카카오 공유가 제대로 작동하지 않을 수 있습니다."
                          );
                        }

                        // 실제 도메인 사용 (개발 환경에서는 배포된 URL로 변경)
                        const webUrl = "https://v0-aifortune-rose.vercel.app";
                        const realUrl = url.replace(
                          window.location.origin,
                          webUrl
                        );

                        console.log("realUrl", realUrl);

                        window.Kakao.Share.sendDefault({
                          objectType: "feed",
                          content: {
                            title: "고양이 운세에서 친구 궁합을 확인해보세요!",
                            description:
                              "너와 나의 케미는 어떨까? 고양이 운세가 알려줄게!",
                            imageUrl: `${window.location.origin}/new_cat_magic.png`,
                            link: {
                              mobileWebUrl: realUrl,
                              webUrl: realUrl,
                            },
                          },
                          buttons: [
                            {
                              title: "친구 궁합 보기",
                              link: {
                                mobileWebUrl: realUrl,
                                webUrl: realUrl,
                              },
                            },
                          ],
                        });
                      } catch (error) {
                        console.error("카카오 공유 에러:", error);
                        alert(
                          "카카오 공유 중 오류가 발생했습니다. 직접 접속해 주세요."
                        );
                      }
                    } else {
                      console.error("Kakao SDK가 초기화되지 않았습니다.");
                      alert("카카오톡 공유 기능을 초기화할 수 없습니다.");
                    }
                  }}
                  className="flex flex-col items-center border-none bg-transparent"
                >
                  <div className="bg-yellow-400 w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-md">
                    <svg
                      className="w-7 h-7 text-black"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 3C7.0374 3 3 6.15827 3 10.0867C3 12.6044 4.7748 14.8144 7.39256 16.0467L6.4714 19.4322C6.39695 19.719 6.70314 19.9438 6.94205 19.7849L10.9047 17.1159C11.265 17.1546 11.6302 17.1735 12 17.1735C16.9626 17.1735 21 14.0152 21 10.0867C21 6.15827 16.9626 3 12 3Z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    카카오톡
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/compatibility-results/${result.id}`}
                className="block"
              >
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#990dfa]/20 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    {result.resultType === "love" ? (
                      <span className="bg-[#FFE0F0] text-[#FF4D80] text-xs px-2 py-1 rounded-full">
                        연인 궁합
                      </span>
                    ) : (
                      <span className="bg-[#E0F0FF] text-[#3B82F6] text-xs px-2 py-1 rounded-full">
                        친구 궁합
                      </span>
                    )}
                  </div>
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
                        {/* <div
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
                        </div> */}
                      </div>
                    </div>
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
