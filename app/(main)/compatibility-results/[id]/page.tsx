import { notFound } from "next/navigation";
// import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/app/components/PageHeader";
import FriendCompatibilityResult from "./FriendCompatibilityResult";
import LoveCompatibilityResult from "./LoveCompatibilityResult";
import Link from "next/link";

interface CompatibilityResultData {
  id: number;
  resultType: "love" | "friend";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export default async function CompatibilityResultDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 결과 데이터 가져오기
  let resultData: CompatibilityResultData | null = null;
  let error = "";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/compatibility-results/${params.id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return notFound();
      }
      throw new Error("결과를 가져오는데 실패했습니다.");
    }

    resultData = await response.json();
  } catch (err) {
    console.error("결과 조회 중 오류:", err);
    error = "결과를 불러오는 중 오류가 발생했습니다.";
  }

  // 사람 정보 객체 생성
  const createPersonData = (
    name: string,
    birthdate: string,
    gender: string,
    birthtime: string | null
  ) => {
    return {
      name,
      birthdate,
      gender: gender as "남" | "여",
      birthtime: birthtime || "",
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
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
          // 에러 화면
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
        ) : resultData ? (
          // 결과 상세 화면
          <div>
            <Link
              className="mb-4 px-4 py-2 bg-white rounded-lg shadow-sm flex items-center hover:bg-gray-50 transition-colors"
              href="/compatibility-results"
            >
              <ArrowLeft className="w-5 h-5 mr-2 text-[#990dfa]" />
              <span className="text-[#3B2E7E]">목록으로 돌아가기</span>
            </Link>

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
          // 결과가 없는 경우
          <div className="text-center py-12">
            <p className="text-[#3B2E7E] mb-4">결과를 찾을 수 없습니다.</p>
            <Link
              className="px-4 py-2 bg-[#990dfa] text-white rounded-lg flex items-center mx-auto"
              href="/compatibility-results"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              목록으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
