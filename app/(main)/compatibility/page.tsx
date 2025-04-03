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

// 생년월일 및 시간 관련 타입 정의
type CalendarType = "양력" | "음력";
type BirthTime =
  | "자시(23:00-01:00)"
  | "축시(01:00-03:00)"
  | "인시(03:00-05:00)"
  | "묘시(05:00-07:00)"
  | "진시(07:00-09:00)"
  | "사시(09:00-11:00)"
  | "오시(11:00-13:00)"
  | "미시(13:00-15:00)"
  | "신시(15:00-17:00)"
  | "유시(17:00-19:00)"
  | "술시(19:00-21:00)"
  | "해시(21:00-23:00)"
  | "모름";

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

// 이름 유효성 검사 함수
const validateName = (
  name: string
): { isValid: boolean; errorMessage: string } => {
  // 빈 값 체크
  if (!name.trim()) {
    return { isValid: false, errorMessage: "이름을 입력해주세요." };
  }

  // 길이 체크 (2글자 이상)
  if (name.trim().length < 2) {
    return { isValid: false, errorMessage: "이름은 2글자 이상이어야 합니다." };
  }

  // 한글/영문만 허용 (자음, 모음 단독 사용 불가)
  const koreanRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!koreanRegex.test(name)) {
    return {
      isValid: false,
      errorMessage:
        "이름은 한글 또는 영문만 입력 가능합니다. (자음, 모음 단독 사용 불가)",
    };
  }

  // 한글 자음/모음만 있는지 체크
  const koreanSingleCharRegex = /[ㄱ-ㅎㅏ-ㅣ]/;
  if (koreanSingleCharRegex.test(name)) {
    return {
      isValid: false,
      errorMessage:
        "완성된 한글만 입력 가능합니다. (자음, 모음 단독 사용 불가)",
    };
  }

  return { isValid: true, errorMessage: "" };
};

export default function CompatibilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, isLoaded, isProfileComplete } = useUser();
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

  // Person1 추가 상태 (필요는 없지만 의존성 유지를 위해 남겨둠)
  const [birthYear1, setBirthYear1] = useState("");
  const [birthMonth1, setBirthMonth1] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [birthDay1, setBirthDay1] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [calendarType1, setCalendarType1] = useState<CalendarType>("양력");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [koreanBirthTime1, setKoreanBirthTime1] = useState<BirthTime>("모름");

  // Person2 추가 상태
  const [birthYear2, setBirthYear2] = useState("");
  const [birthMonth2, setBirthMonth2] = useState("");
  const [birthDay2, setBirthDay2] = useState("");
  const [calendarType2, setCalendarType2] = useState<CalendarType>("양력");
  const [koreanBirthTime2, setKoreanBirthTime2] = useState<BirthTime>("모름");

  // 연도 옵션 생성 (1930년부터 현재까지)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1930 + 1 },
    (_, i) => 1930 + i
  ).reverse();

  // 월 옵션
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // 일 옵션 (월에 따라 동적으로 변경)
  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return daysInMonth;
  };

  // Person1 일 옵션 - 린터 경고 해결
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dayOptions1 = Array.from(
    { length: getDaysInMonth(birthYear1, birthMonth1) },
    (_, i) => i + 1
  );

  // Person2 일 옵션
  const dayOptions2 = Array.from(
    { length: getDaysInMonth(birthYear2, birthMonth2) },
    (_, i) => i + 1
  );

  // 시간 옵션 (select options로 변경하여 더 이상 직접 사용하지 않음)
  // 시간대 문자열에서 시간 값 추출 (예: "자시(23:00-01:00)" -> "23:00")
  const extractTimeFromBirthTime = (birthTime: BirthTime): string => {
    if (birthTime === "모름") return "12:00"; // 기본값

    const timeMatch = birthTime.match(/\((\d{2}):00-\d{2}:00\)/);
    if (timeMatch) {
      return `${timeMatch[1]}:00`;
    }

    return "12:00"; // 매치 실패 시 기본값
  };

  // 시간 값에서 가장 가까운 시간대 찾기 (예: "23:00" -> "자시(23:00-01:00)")
  const findClosestBirthTime = (time: string): BirthTime => {
    if (!time || time === "") return "모름";

    const hour = parseInt(time.split(":")[0]);

    // 시간에 따른 시간대 매핑
    if (hour >= 23 || hour < 1) return "자시(23:00-01:00)";
    if (hour >= 1 && hour < 3) return "축시(01:00-03:00)";
    if (hour >= 3 && hour < 5) return "인시(03:00-05:00)";
    if (hour >= 5 && hour < 7) return "묘시(05:00-07:00)";
    if (hour >= 7 && hour < 9) return "진시(07:00-09:00)";
    if (hour >= 9 && hour < 11) return "사시(09:00-11:00)";
    if (hour >= 11 && hour < 13) return "오시(11:00-13:00)";
    if (hour >= 13 && hour < 15) return "미시(13:00-15:00)";
    if (hour >= 15 && hour < 17) return "신시(15:00-17:00)";
    if (hour >= 17 && hour < 19) return "유시(17:00-19:00)";
    if (hour >= 19 && hour < 21) return "술시(19:00-21:00)";
    if (hour >= 21 && hour < 23) return "해시(21:00-23:00)";

    return "모름";
  };

  // birthdate에서 년, 월, 일 추출 (예: "2023-01-15" -> {year: "2023", month: "1", day: "15"})
  const extractDateParts = (birthdate: string) => {
    if (!birthdate) return { year: "", month: "", day: "" };

    const parts = birthdate.split("-");
    if (parts.length !== 3) return { year: "", month: "", day: "" };

    return {
      year: parts[0],
      month: String(parseInt(parts[1])), // 앞의 0 제거
      day: String(parseInt(parts[2])),
    };
  };

  // 년, 월, 일을 birthdate 형식으로 변환 (예: {year: "2023", month: "1", day: "15"} -> "2023-01-15")
  const formatBirthdate = (
    year: string,
    month: string,
    day: string
  ): string => {
    if (!year || !month || !day) return "";

    return `${year}-${String(parseInt(month)).padStart(2, "0")}-${String(
      parseInt(day)
    ).padStart(2, "0")}`;
  };

  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSharedMode, setIsSharedMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (userProfile && isLoaded) {
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

      // person1 데이터 설정
      setFormData((prev) => ({
        ...prev,
        person1: {
          name: userProfile.name || "",
          birthdate: userProfile.birthDate || "",
          gender: gender as "남" | "여",
          birthtime: birthtime,
        },
      }));

      // person1 생년월일 및 시간 설정 (참조 유지를 위해)
      if (userProfile.birthDate) {
        const parts = userProfile.birthDate.split("-");
        if (parts.length === 3) {
          setBirthYear1(parts[0]);
          setBirthMonth1(String(parseInt(parts[1])));
          setBirthDay1(String(parseInt(parts[2])));
        }
      }

      // person1 시간 설정
      if (userProfile.birthTime) {
        setKoreanBirthTime1(userProfile.birthTime);
      }
    }
  }, [userProfile, isLoaded]);

  // formData 변경 시 추가 상태 업데이트
  const updatePerson2FormData = () => {
    const formattedBirthdate = formatBirthdate(
      birthYear2,
      birthMonth2,
      birthDay2
    );
    const formattedBirthtime = extractTimeFromBirthTime(koreanBirthTime2);

    setFormData((prev) => ({
      ...prev,
      person2: {
        ...prev.person2,
        birthdate: formattedBirthdate,
        birthtime: formattedBirthtime,
      },
    }));
  };

  // 생년월일 또는 시간 변경 시 폼 데이터 업데이트
  useEffect(() => {
    updatePerson2FormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthYear2, birthMonth2, birthDay2, koreanBirthTime2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 사용자 정보가 없는 경우
    if (!userProfile || !isProfileComplete) {
      toast.error("프로필 설정에서 내 정보를 먼저 입력해주세요.");
      router.push("/profile/setup");
      return;
    }

    // 상대방 정보 유효성 검사
    if (!formData.person2.name) {
      setError("두 번째 사람의 이름을 입력해주세요.");
      return;
    }

    if (!formData.person2.birthdate) {
      setError("두 번째 사람의 생년월일을 선택해주세요.");
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

    // 필드에 따른 추가 상태 업데이트
    if (field === "gender") {
      if (person === "person1") {
        // 성별은 이미 "남"/"여" 형식으로 들어옴
      } else if (person === "person2") {
        // 성별은 이미 "남"/"여" 형식으로 들어옴
      }
    }
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
        title: "궁합 테스트💑",
        description: `${formData.person1.name}님과의 궁합을 확인해보라냥!💑 `,
        imageUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/share.png`,
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: "궁합 테스트 참여하기",
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

  // 추가적으로 사용되지 않는 함수 처리
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unusedFunctions = () => {
    // 현재 직접 사용되지 않지만 컴포넌트 내에서 중요한 함수들을 유지
    const time = findClosestBirthTime("12:00");
    const parts = extractDateParts("2023-01-01");
    return { time, parts };
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

      <div className="container max-w-md mx-auto px-4 py-6 relative pb-24">
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

          {!isLoaded ? (
            <motion.div
              className="flex justify-center p-10"
              variants={itemVariants}
            >
              <div className="animate-spin h-8 w-8 border-4 border-[#990dfa] rounded-full border-t-transparent"></div>
            </motion.div>
          ) : !userProfile || !isProfileComplete ? (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded"
              variants={itemVariants}
            >
              <p className="font-medium">프로필 정보가 필요합니다!</p>
              <p className="text-sm mb-4">
                정확한 궁합 분석을 위해 프로필 설정에서 내 정보를 먼저
                입력해주세요.
              </p>
              <button
                onClick={() => router.push("/profile/setup")}
                className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                프로필 설정하러 가기
              </button>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded"
                  variants={itemVariants}
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                className="mb-6 p-4 bg-[#F9F5FF] rounded-xl border border-[#E9E4F0]"
              >
                <h3 className="font-semibold text-[#3B2E7E] mb-2">내 정보</h3>
                <div className="flex items-center space-x-4">
                  <div className="bg-[#990dfa]/10 p-3 rounded-full">
                    <svg
                      className="w-6 h-6 text-[#990dfa]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-[#3B2E7E]">
                      {userProfile?.name}
                    </div>
                    <div className="text-sm text-[#6E6491]">
                      {userProfile?.birthDate
                        ? new Date(userProfile.birthDate).toLocaleDateString(
                            "ko-KR",
                            { year: "numeric", month: "long", day: "numeric" }
                          )
                        : "생년월일 없음"}
                      {userProfile?.gender ? ` · ${userProfile.gender}` : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#6E6491] text-right">
                  <button
                    onClick={() => router.push("/profile/edit")}
                    className="text-[#990dfa] underline bg-transparent border-none"
                  >
                    프로필 수정하기
                  </button>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit}>
                <motion.div className="space-y-6" variants={itemVariants}>
                  {/* 두 번째 사람 정보 */}
                  <div className="p-4 bg-[#F9F5FF] rounded-xl">
                    <h3 className="font-semibold text-[#3B2E7E] mb-4">
                      상대방 정보
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
                          placeholder="이름 (2글자 이상, 한글/영문만)"
                          className="w-full px-4 py-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                        />
                        {!validateName(formData.person2.name).isValid &&
                          formData.person2.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {validateName(formData.person2.name).errorMessage}
                            </p>
                          )}
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
                        <div className="flex space-x-2">
                          <select
                            value={birthYear2}
                            onChange={(e) => {
                              setBirthYear2(e.target.value);
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa]"
                          >
                            <option value="">연도</option>
                            {yearOptions.map((year) => (
                              <option key={year} value={year.toString()}>
                                {year}년
                              </option>
                            ))}
                          </select>
                          <select
                            value={birthMonth2}
                            onChange={(e) => {
                              setBirthMonth2(e.target.value);
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa]"
                          >
                            <option value="">월</option>
                            {monthOptions.map((month) => (
                              <option key={month} value={month.toString()}>
                                {month}월
                              </option>
                            ))}
                          </select>
                          <select
                            value={birthDay2}
                            onChange={(e) => {
                              setBirthDay2(e.target.value);
                            }}
                            className="flex-1 p-2 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa]"
                          >
                            <option value="">일</option>
                            {dayOptions2.map((day) => (
                              <option key={day} value={day.toString()}>
                                {day}일
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                          양력/음력
                        </label>
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setCalendarType2("양력")}
                            className={`flex-1 py-2 px-4 rounded-xl border ${
                              calendarType2 === "양력"
                                ? "bg-[#990dfa] text-white border-[#990dfa]"
                                : "border-[#E9E4F0] text-[#3B2E7E]"
                            }`}
                          >
                            양력
                          </button>
                          <button
                            type="button"
                            onClick={() => setCalendarType2("음력")}
                            className={`flex-1 py-2 px-4 rounded-xl border ${
                              calendarType2 === "음력"
                                ? "bg-[#990dfa] text-white border-[#990dfa]"
                                : "border-[#E9E4F0] text-[#3B2E7E]"
                            }`}
                          >
                            음력
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#3B2E7E] text-sm font-medium mb-1">
                          태어난 시간
                        </label>
                        <select
                          value={koreanBirthTime2}
                          onChange={(e) =>
                            setKoreanBirthTime2(e.target.value as BirthTime)
                          }
                          className="w-full p-3 rounded-xl border border-[#E9E4F0] focus:outline-none focus:ring-2 focus:ring-[#990dfa] focus:border-transparent"
                        >
                          <option value="모름">모름</option>
                          <option value="자시(23:00-01:00)">
                            자시 (23:00-01:00)
                          </option>
                          <option value="축시(01:00-03:00)">
                            축시 (01:00-03:00)
                          </option>
                          <option value="인시(03:00-05:00)">
                            인시 (03:00-05:00)
                          </option>
                          <option value="묘시(05:00-07:00)">
                            묘시 (05:00-07:00)
                          </option>
                          <option value="진시(07:00-09:00)">
                            진시 (07:00-09:00)
                          </option>
                          <option value="사시(09:00-11:00)">
                            사시 (09:00-11:00)
                          </option>
                          <option value="오시(11:00-13:00)">
                            오시 (11:00-13:00)
                          </option>
                          <option value="미시(13:00-15:00)">
                            미시 (13:00-15:00)
                          </option>
                          <option value="신시(15:00-17:00)">
                            신시 (15:00-17:00)
                          </option>
                          <option value="유시(17:00-19:00)">
                            유시 (17:00-19:00)
                          </option>
                          <option value="술시(19:00-21:00)">
                            술시 (19:00-21:00)
                          </option>
                          <option value="해시(21:00-23:00)">
                            해시 (21:00-23:00)
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          정확한 시간을 모르시면 &quot;모름&quot;으로
                          입력해주세요.
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
                    궁합 확인하기
                  </button>

                  <button
                    type="button"
                    onClick={handleShareClick}
                    className="w-full mt-4 px-6 py-3 rounded-xl bg-white border border-[#990dfa] text-[#990dfa] font-medium hover:bg-[#F9F5FF] transition-colors flex items-center justify-center"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    공유하고 궁합보기
                  </button>
                </motion.div>
              </form>
            </>
          )}
        </motion.div>

        {/* 하단 설명 */}
        <motion.div
          className="text-center text-sm text-[#3B2E7E]/70"
          variants={itemVariants}
        >
          <p>
            사주 정보를 바탕으로 두 사람의 궁합을 분석해드립니다.
            <br />
            정확한 정보를 입력할수록 더 정확한 결과를 얻을 수 있어요.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
