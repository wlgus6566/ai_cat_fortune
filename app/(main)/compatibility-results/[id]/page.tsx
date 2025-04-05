/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { notFound, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/app/components/PageHeader";
import FriendCompatibilityResult from "./FriendCompatibilityResult";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import LoveCompatibilityResult from "./LoveCompatibilityResult";
import { toast, Toaster } from "react-hot-toast";

interface CompatibilityResultData {
  id: number;
  resultType: "love" | "friend";
  resultData: any;
  person1Name: string;
  person1Birthdate: string;
  person1Gender: string;
  person1Birthtime: string | null;
  person2Name: string;
  person2Birthdate: string;
  person2Gender: string;
  person2Birthtime: string | null;
  totalScore: number;
  createdAt: string;
}

export default function CompatibilityResultDetail() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const isShared = searchParams.get("shared") === "true";

  const [resultData, setResultData] = useState<CompatibilityResultData | null>(
    null
  );
  const [error, setError] = useState("");
  const [showedSharedToast, setShowedSharedToast] = useState(false);

  // 이름에 맞는 조사 추가 함수
  const getParticleSuffix = (name: string) => {
    const lastChar = name.charAt(name.length - 1);
    const uni = lastChar.charCodeAt(0);

    // 한글 유니코드 범위 및 종성 확인
    if (uni >= 44032 && uni <= 55203) {
      // 종성이 있으면 '이', 없으면 '가'
      return (uni - 44032) % 28 > 0 ? "이" : "가";
    }

    // 한글이 아닌 경우 기본값
    return "이";
  };

  const fetchConsultation = useCallback(async () => {
    try {
      const response = await fetch(`/api/compatibility-results/${id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) return notFound();
        throw new Error("결과를 가져오는데 실패했습니다.");
      }

      const data = await response.json();
      setResultData(data);
    } catch (err) {
      console.error("결과 조회 중 오류:", err);
      setError("결과를 불러오는 중 오류가 발생했습니다.");
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchConsultation();
  }, [id, fetchConsultation]);

  // 공유로 접속했을 때 팝업 표시
  useEffect(() => {
    if (isShared && resultData && !showedSharedToast) {
      const particle = getParticleSuffix(resultData.person1Name);
      toast.success(
        `너랑 ${resultData.person1Name}${particle} 궁합결과가 이렇대!`,
        {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#FFF8E1",
            padding: "16px",
            color: "#3B2E7E",
            fontSize: "16px",
            fontWeight: "bold",
            border: "1px solid #FFE082",
            borderRadius: "12px",
          },
          icon: "🎊",
        }
      );
      setShowedSharedToast(true);
    }
  }, [isShared, resultData, showedSharedToast]);

  const createPersonData = (
    name: string,
    birthdate: string,
    gender: string,
    birthtime: string | null
  ) => ({
    name,
    birthdate,
    gender: gender as "남" | "여",
    birthtime: birthtime || "",
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
      <Toaster />
      <PageHeader
        title={
          resultData?.resultType === "love"
            ? "운세 궁합 결과"
            : "친구 궁합 결과"
        }
        className="bg-white shadow-md relative z-10"
      />

      <div className="container mx-auto px-4 pb-24 relative">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xl font-bold text-[#3B2E7E] mb-4">{error}</p>
            <Link
              href="/compatibility-results"
              className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-[#990dfa] to-[#7609c1] text-white font-medium hover:opacity-90 transition-colors flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              목록으로 돌아가기
            </Link>
          </div>
        ) : resultData?.person1Name ? (
          <div>
            {resultData.resultType === "love" ? (
              <LoveCompatibilityResult
                data={resultData.resultData}
                person1={createPersonData(
                  resultData.person1Name,
                  resultData.person1Birthdate,
                  resultData.person1Gender,
                  resultData.person1Birthtime
                )}
                person2={createPersonData(
                  resultData.person2Name,
                  resultData.person2Birthdate,
                  resultData.person2Gender,
                  resultData.person2Birthtime
                )}
              />
            ) : (
              <FriendCompatibilityResult
                data={resultData.resultData}
                person1={createPersonData(
                  resultData.person1Name,
                  resultData.person1Birthdate,
                  resultData.person1Gender,
                  resultData.person1Birthtime
                )}
                person2={createPersonData(
                  resultData.person2Name,
                  resultData.person2Birthdate,
                  resultData.person2Gender,
                  resultData.person2Birthtime
                )}
              />
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
