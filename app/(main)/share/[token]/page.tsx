"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Share2 } from "lucide-react";
import PageHeader from "@/app/components/PageHeader";
import LoveCompatibilityResult from "../../compatibility-results/[id]/LoveCompatibilityResult";
import FriendCompatibilityResult from "../../compatibility-results/[id]/FriendCompatibilityResult";
import ShareModal from "@/app/components/ShareModal";
import { toast, Toaster } from "react-hot-toast";

// 카카오 SDK 타입 정의
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
  shareToken: string;
}

// 사람 데이터 생성 함수
const createPersonData = (
  name: string,
  birthdate: string,
  gender: string,
  birthtime: string | null
) => ({
  name,
  birthdate,
  gender,
  birthtime: birthtime || "",
});

export default function SharedCompatibilityResult() {
  const params = useParams();
  const [resultData, setResultData] = useState<CompatibilityResultData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

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

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/share/${params.token}`);
        if (!response.ok) {
          throw new Error("결과를 불러올 수 없습니다.");
        }
        const data = await response.json();
        setResultData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      fetchResult();
    }
  }, [params.token]);

  // 공유 URL 생성 함수
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/share/${params.token}`;
  };

  // 카카오 공유 함수
  const shareToKakao = () => {
    if (!window.Kakao || !resultData) return;

    try {
      // 로컬환경이면 카카오 공유가 제대로 작동하지 않을 수 있음을 알리기
      if (window.location.hostname === "localhost") {
        toast.error(
          "로컬 환경에서는 카카오 공유가 제대로 작동하지 않을 수 있습니다."
        );
      }

      // 공유 URL 생성
      const shareUrl = generateShareUrl();

      // 실제 도메인 사용 (개발 환경에서는 배포된 URL로 변경)
      const webUrl = "https://v0-aifortune-rose.vercel.app";
      const realShareUrl = shareUrl.replace(window.location.origin, webUrl);

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: `${resultData.person1Name}님과 ${resultData.person2Name}님의 ${
            resultData.resultType === "love" ? "연인" : "친구"
          } 궁합`,
          description:
            resultData.resultType === "love"
              ? resultData.resultData.magicTitle
              : resultData.resultData.nickname,
          imageUrl: `${window.location.origin}/chemy.png`,
          link: {
            mobileWebUrl: realShareUrl,
            webUrl: realShareUrl,
          },
        },
        buttons: [
          {
            title: `${
              resultData.resultType === "love" ? "연인" : "친구"
            } 궁합 보기`,
            link: {
              mobileWebUrl: realShareUrl,
              webUrl: realShareUrl,
            },
          },
        ],
      });
    } catch (error) {
      console.error("카카오 공유 에러:", error);
      toast.error(
        "카카오 공유 중 오류가 발생했습니다. 링크 복사를 이용해 주세요."
      );
    }
  };

  // 클립보드에 링크 복사 함수
  const copyToClipboard = () => {
    const shareUrl = generateShareUrl();

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("링크가 복사되었습니다!");
      })
      .catch(() => {
        toast.error("링크 복사에 실패했습니다.");
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#990dfa] mx-auto" />
          <p className="mt-4 text-[#3B2E7E]">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#3B2E7E] mb-4">
            {error || "결과를 찾을 수 없습니다."}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F5FF] to-[#F0EAFF]">
      <Toaster />
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShareKakao={shareToKakao}
          onCopyLink={copyToClipboard}
        />
      )}

      <PageHeader
        title={`${
          resultData.resultType === "love" ? "연인" : "친구"
        } 궁합 결과`}
        className="bg-white shadow-md relative z-10"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6"
      >
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

        {/* 공유 버튼 */}
        <motion.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <button
            onClick={() => setShowShareModal(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#990dfa] to-[#7609c1] text-white font-medium hover:opacity-90 transition-colors flex items-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            친구와 공유하기
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
