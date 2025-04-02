"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
// 현재 주석 처리된 코드에서만 사용되지만 향후 필요할 수 있으므로 유지
// eslint-disable-next-line
import Image from "next/image";
import { useCompatibility } from "@/app/context/CompatibilityContext";
import { useUser } from "@/app/contexts/UserContext";
import PageHeader from "@/app/components/PageHeader";
import { toast, Toaster } from "react-hot-toast";
import { Share2 } from "lucide-react";
import ShareModal from "@/app/components/ShareModal";

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

export default function CompatibilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, isLoaded } = useUser();
  const { setState } = useCompatibility();
  const [formData, setFormData] = useState({
    person1: {
      name: "",
      birthdate: "",
      gender: "여" as "남" | "여",
      birthtime: "",
    },
    person2: {
      name: "",
      birthdate: "",
      gender: "남" as "남" | "여",
      birthtime: "",
    },
  });
  const [error, setError] = useState("");
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [shareGuideVisible, setShareGuideVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 카카오 SDK 초기화
  useEffect(() => {
    // 카카오 SDK 스크립트 로드
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.5.0/kakao.min.js";
    // script.integrity =
    //   "sha384-kYPsUbBPlktXsY6/oNHSUDZoTX6+YI51f63jCPENAC7vwVvMUe0JWBZ5t0xk9sUy";
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
      document.body.removeChild(script);
    };
  }, []);

  // URL 파라미터 처리 및 공유 모드 설정
  useEffect(() => {
    const shared = searchParams.get("shared");
    if (shared === "true") {
      const name = searchParams.get("name");
      const birthdate = searchParams.get("birthdate");
      const gender = searchParams.get("gender") as "남" | "여";
      const birthtime = searchParams.get("birthtime");

      if (
        name &&
        birthdate &&
        (gender === "남" || gender === "여") &&
        birthtime
      ) {
        setFormData((prev) => ({
          ...prev,
          person1: {
            name: decodeURIComponent(name),
            birthdate,
            gender,
            birthtime,
          },
        }));
        setIsSharedMode(true);
        setShareGuideVisible(true);

        // 5초 후에 안내 메시지 숨기기
        setTimeout(() => {
          setShareGuideVisible(false);
        }, 5000);
      }
    }
  }, [searchParams]);

  // 사용자 프로필 정보로 폼 데이터 초기화
  useEffect(() => {
    if (userProfile && isLoaded && !isSharedMode) {
      // gender 형식 변환 ("남성"/"여성" -> "남"/"여")
      const gender =
        userProfile.gender === "남성"
          ? "남"
          : userProfile.gender === "여성"
          ? "여"
          : "남"; // 기본값은 남성

      // birthTime 형식 변환
      let birthtime = "12:00"; // 기본값
      if (userProfile.birthTime && userProfile.birthTime !== "모름") {
        // 예: "자시(23:00-01:00)" -> "23:00"
        const timeMatch = userProfile.birthTime.match(
          /\((\d{2}):00-\d{2}:00\)/
        );
        if (timeMatch) {
          birthtime = `${timeMatch[1]}:00`;
        }
      }

      // formData 업데이트
      setFormData((prev) => ({
        ...prev,
        person1: {
          name: userProfile.name || "",
          birthdate: userProfile.birthDate || "",
          gender: gender as "남" | "여",
          birthtime: birthtime,
        },
      }));
    } else if (isSharedMode && userProfile && isLoaded) {
      // 공유 모드에서는 로그인 사용자 정보를 두 번째 사람으로 설정
      const gender =
        userProfile.gender === "남성"
          ? "남"
          : userProfile.gender === "여성"
          ? "여"
          : "남";

      let birthtime = "12:00";
      if (userProfile.birthTime && userProfile.birthTime !== "모름") {
        const timeMatch = userProfile.birthTime.match(
          /\((\d{2}):00-\d{2}:00\)/
        );
        if (timeMatch) {
          birthtime = `${timeMatch[1]}:00`;
        }
      }

      setFormData((prev) => ({
        ...prev,
        person2: {
          name: userProfile.name || "",
          birthdate: userProfile.birthDate || "",
          gender: gender as "남" | "여",
          birthtime: birthtime,
        },
      }));
    }
  }, [userProfile, isLoaded, isSharedMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.person1.name || !formData.person2.name) {
      setError("두 사람의 이름을 모두 입력해주세요.");
      return;
    }

    if (!formData.person1.birthdate || !formData.person2.birthdate) {
      setError("두 사람의 생년월일을 모두 선택해주세요.");
      return;
    }

    if (!formData.person1.birthtime || !formData.person2.birthtime) {
      setError("두 사람의 태어난 시간을 모두 선택해주세요.");
      return;
    }

    // Context 상태 업데이트
    setState(formData);

    // 결과 페이지로 이동
    router.push("/compatibility/result");
  };

  const handleInputChange = (
    person: "person1" | "person2",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value,
      },
    }));
  };

  // 공유 링크 생성 함수
  const generateShareLink = () => {
    const { name, birthdate, gender, birthtime } = formData.person1;

    // 필수 필드 체크
    if (!name || !birthdate || !gender || !birthtime) {
      setError("공유하려면 첫 번째 사람의 정보를 모두 입력해주세요.");
      return "";
    }

    const encodedName = encodeURIComponent(name);
    const baseUrl = window.location.origin;
    return `${baseUrl}/compatibility?name=${encodedName}&birthdate=${birthdate}&gender=${gender}&birthtime=${birthtime}&shared=true`;
  };

  // 링크 복사 기능
  const copyToClipboard = () => {
    const shareUrl = generateShareLink();
    if (!shareUrl) return; // 유효성 검사 실패 시 리턴

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setShowShareModal(false);
        toast.success(
          "공유 링크가 복사되었습니다! 원하는 곳에 붙여넣기 하세요."
        );
      })
      .catch((err) => {
        console.error("링크 복사 실패:", err);
        toast.error("링크 복사에 실패했습니다. 다시 시도해주세요.");
      });
  };

  // 카카오톡 공유하기
  const shareToKakao = () => {
    console.log("Kakao 객체:", window.Kakao);
    if (!window.Kakao || !window.Kakao.Share) {
      toast.error("카카오톡 공유 기능을 불러오는데 실패했습니다.");
      return;
    }

    const shareUrl = generateShareLink();
    if (!shareUrl) return; // 유효성 검사 실패 시 리턴

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "궁합 테스트",
        description: `${formData.person1.name}님의 궁합 테스트에 참여해보세요!`,
        imageUrl: `${window.location.origin}/compatibility-header.png`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "테스트 참여하기",
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  // 공유하기 버튼 클릭 핸들러
  const handleShareClick = () => {
    const { name, birthdate, gender, birthtime } = formData.person1;

    // 필수 필드 체크
    if (!name || !birthdate || !gender || !birthtime) {
      setError("공유하려면 첫 번째 사람의 정보를 모두 입력해주세요.");
      return;
    }

    // 모달 열기
    setShowShareModal(true);
  };

  // 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9]">
      <PageHeader title="궁합보기" className="bg-transparent shadow-none" />

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      {/* 공유하기 모달 */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            onShareKakao={shareToKakao}
            onCopyLink={copyToClipboard}
          />
        )}
      </AnimatePresence>

      <div className="container max-w-md mx-auto px-4 py-6 relative">
        {/* 메인 컨텐츠 */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-xl font-bold text-center text-[#3B2E7E] mb-6 font-gothic"
            variants={itemVariants}
          >
            사주로 보는 너와 나의 궁합
          </motion.h2>

          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded"
              variants={itemVariants}
            >
              {error}
            </motion.div>
          )}

          {shareGuideVisible && isSharedMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700 rounded"
            >
              <p className="font-medium">공유된 링크로 접속하셨습니다!</p>
              <p className="text-sm">
                첫 번째 사람의 정보는 이미 입력되어 있습니다. 당신의 정보만
                입력하면 궁합을 확인할 수 있어요.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* 첫 번째 사람 정보 */}
              <div className="p-4 bg-[#F9F5FF] rounded-xl">
                <h3 className="font-semibold text-[#3B2E7E] mb-4">
                  첫 번째 사람{" "}
                  {isSharedMode && (
                    <span className="text-sm text-[#990dfa]">
                      (공유된 정보)
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={formData.person1.name}
                      onChange={(e) =>
                        handleInputChange("person1", "name", e.target.value)
                      }
                      placeholder="이름"
                      readOnly={isSharedMode}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isSharedMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : "border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      성별
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person1", "gender", "남")
                        }
                        disabled={isSharedMode}
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person1.gender === "남"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        } ${
                          isSharedMode ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person1", "gender", "여")
                        }
                        disabled={isSharedMode}
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person1.gender === "여"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        } ${
                          isSharedMode ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        여성
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={formData.person1.birthdate}
                      onChange={(e) =>
                        handleInputChange(
                          "person1",
                          "birthdate",
                          e.target.value
                        )
                      }
                      readOnly={isSharedMode}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isSharedMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : "border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      태어난 시간
                    </label>
                    <input
                      type="time"
                      value={formData.person1.birthtime}
                      onChange={(e) =>
                        handleInputChange(
                          "person1",
                          "birthtime",
                          e.target.value
                        )
                      }
                      readOnly={isSharedMode}
                      className={`w-full px-4 py-2 rounded-xl border ${
                        isSharedMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : "border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      정확한 시간을 모르시면 12:00으로 입력해주세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 두 번째 사람 정보 */}
              <div className="p-4 bg-[#F9F5FF] rounded-xl">
                <h3 className="font-semibold text-[#3B2E7E] mb-4">
                  두 번째 사람{" "}
                  {isSharedMode && (
                    <span className="text-sm text-[#990dfa]">
                      (당신의 정보)
                    </span>
                  )}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={formData.person2.name}
                      onChange={(e) =>
                        handleInputChange("person2", "name", e.target.value)
                      }
                      placeholder="이름"
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      성별
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person2", "gender", "남")
                        }
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person2.gender === "남"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        }`}
                      >
                        남성
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleInputChange("person2", "gender", "여")
                        }
                        className={`flex-1 py-2 px-4 rounded-xl border ${
                          formData.person2.gender === "여"
                            ? "bg-[#990dfa] text-white border-[#990dfa]"
                            : "border-[#E9E4F0] text-[#3B2E7E]"
                        }`}
                      >
                        여성
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      생년월일
                    </label>
                    <input
                      type="date"
                      value={formData.person2.birthdate}
                      onChange={(e) =>
                        handleInputChange(
                          "person2",
                          "birthdate",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                      태어난 시간
                    </label>
                    <input
                      type="time"
                      value={formData.person2.birthtime}
                      onChange={(e) =>
                        handleInputChange(
                          "person2",
                          "birthtime",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      정확한 시간을 모르시면 12:00으로 입력해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="mt-8" variants={itemVariants}>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-[#990dfa] text-white font-medium hover:bg-[#8A0AE0] transition-colors"
              >
                {isSharedMode ? "공유된 궁합 확인하기" : "궁합 확인하기"}
              </button>

              {!isSharedMode && (
                <button
                  type="button"
                  onClick={handleShareClick}
                  className="w-full mt-4 px-6 py-3 rounded-xl bg-white border border-[#990dfa] text-[#990dfa] font-medium hover:bg-[#F9F5FF] transition-colors flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  공유하고 궁합보기
                </button>
              )}
            </motion.div>
          </form>
        </motion.div>

        {/* 하단 설명 */}
        <motion.div
          className="text-center text-sm text-[#3B2E7E]/70"
          variants={itemVariants}
        >
          <p>
            {isSharedMode
              ? "공유된 정보로 궁합을 확인해보세요. 당신의 정보만 입력하시면 됩니다."
              : "사주 정보를 바탕으로 두 사람의 궁합을 분석해드립니다.\n정확한 정보를 입력할수록 더 정확한 결과를 얻을 수 있어요."}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
