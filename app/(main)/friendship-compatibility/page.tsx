"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useFriendCompatibility } from "@/app/context/FriendCompatibilityContext";
import { useUser } from "@/app/contexts/UserContext";
import PageHeader from "@/app/components/PageHeader";
import { toast, Toaster } from "react-hot-toast";
import { Share2 } from "lucide-react";
import ShareModal from "@/app/components/ShareModal";
import { UserProfile } from "@/app/type/types";
import Lottie from "lottie-react";
import Link from "next/link";

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

// 사용자 데이터를 폼 데이터 형식으로 변환하는 함수
const mapUserProfileToFormData = (userProfile: UserProfile | null) => {
  if (!userProfile) return null;

  // 성별 변환 (UserProfile의 Gender -> 폼의 "남"/"여")
  let gender: "남" | "여" = "남";
  if (userProfile.gender === "여성") {
    gender = "여";
  } else if (userProfile.gender === "남성") {
    gender = "남";
  }

  // 생년월일 형식 확인
  const birthDate = userProfile.birthDate || "";

  // 태어난 시간 처리
  let birthtime = "";
  if (userProfile.birthTime && userProfile.birthTime !== "모름") {
    const matches = userProfile.birthTime.match(/\((\d{2}):00-/);
    if (matches && matches[1]) {
      birthtime = `${matches[1]}:00`;
    }
  }

  return {
    name: userProfile.name || "",
    birthdate: birthDate,
    gender,
    birthtime,
  };
};

export default function FriendshipCompatibilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile, isLoaded } = useUser();
  const { setState } = useFriendCompatibility();
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

  // 페이지 단계 상태 (1: 첫 번째 사람 정보, 2: 두 번째 사람 정보, 3: 결과)
  const [step, setStep] = useState(1);

  // Person1 추가 상태
  const [birthYear1, setBirthYear1] = useState("");
  const [birthMonth1, setBirthMonth1] = useState("");
  const [birthDay1, setBirthDay1] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [calendarType1, setCalendarType1] = useState<CalendarType>("양력");
  const [koreanBirthTime1, setKoreanBirthTime1] = useState<BirthTime>("모름");

  // Person2 추가 상태
  const [birthYear2, setBirthYear2] = useState("");
  const [birthMonth2, setBirthMonth2] = useState("");
  const [birthDay2, setBirthDay2] = useState("");
  // eslint-disable-next-line no-unused-vars
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

  // Person1 일 옵션
  const dayOptions1 = Array.from(
    { length: getDaysInMonth(birthYear1, birthMonth1) },
    (_, i) => i + 1
  );

  // Person2 일 옵션
  const dayOptions2 = Array.from(
    { length: getDaysInMonth(birthYear2, birthMonth2) },
    (_, i) => i + 1
  );

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
  // eslint-disable-next-line no-unused-vars
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [shareGuideVisible, setShareGuideVisible] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Lottie 애니메이션 객체 참조
  const chatAnimationRef = useRef(null);
  const profileAnimationRef = useRef(null);
  const talismanAnimationRef = useRef(null);

  // Lottie 애니메이션 데이터 상태
  const [chatAnimationData, setChatAnimationData] = useState(null);
  const [profileAnimationData, setProfileAnimationData] = useState(null);
  const [talismanAnimationData, setTalismanAnimationData] = useState(null);

  // Lottie 애니메이션 데이터 로드
  useEffect(() => {
    const loadAnimationData = async () => {
      try {
        const chatResponse = await fetch("/lottie/chat-animation.json");
        const chatData = await chatResponse.json();
        setChatAnimationData(chatData);

        const profileResponse = await fetch("/lottie/profile-animation.json");
        const profileData = await profileResponse.json();
        setProfileAnimationData(profileData);

        const talismanResponse = await fetch("/lottie/talisman-animation.json");
        const talismanData = await talismanResponse.json();
        setTalismanAnimationData(talismanData);
      } catch (error) {
        console.error("Failed to load Lottie animations:", error);
      }
    };

    loadAnimationData();
  }, []);

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

  // 사용자 프로필 기반 초기화
  useEffect(() => {
    if (isLoaded && userProfile) {
      const userData = mapUserProfileToFormData(userProfile);
      if (userData) {
        // 사용자 데이터로 폼 업데이트
        setFormData((prevData) => ({
          ...prevData,
          person1: {
            ...prevData.person1,
            name: userData.name,
            gender: userData.gender,
            birthdate: userData.birthdate,
            birthtime: userData.birthtime,
          },
        }));

        // 생년월일 분리하여 설정
        if (userData.birthdate) {
          const parts = userData.birthdate.split("-");
          if (parts.length === 3) {
            setBirthYear1(parts[0]);
            setBirthMonth1(String(parseInt(parts[1])));
            setBirthDay1(String(parseInt(parts[2])));
          }
        }

        // 시간 설정
        if (userData.birthtime) {
          setKoreanBirthTime1(findClosestBirthTime(userData.birthtime));
        }
      }
    }
  }, [isLoaded, userProfile]);

  // URL 파라미터로부터 공유 데이터 로드
  useEffect(() => {
    if (searchParams && searchParams.has("data")) {
      try {
        setIsSharedMode(true);
        const data = JSON.parse(atob(searchParams.get("data") || ""));
        setFormData(data);

        // Person1 데이터 설정
        if (data.person1.birthdate) {
          const parts = data.person1.birthdate.split("-");
          if (parts.length === 3) {
            setBirthYear1(parts[0]);
            setBirthMonth1(String(parseInt(parts[1])));
            setBirthDay1(String(parseInt(parts[2])));
          }
        }

        // Person1 시간 설정
        if (data.person1.birthtime) {
          setKoreanBirthTime1(findClosestBirthTime(data.person1.birthtime));
        }

        // Person2 데이터 설정
        if (data.person2.birthdate) {
          const parts = data.person2.birthdate.split("-");
          if (parts.length === 3) {
            setBirthYear2(parts[0]);
            setBirthMonth2(String(parseInt(parts[1])));
            setBirthDay2(String(parseInt(parts[2])));
          }
        }

        // Person2 시간 설정
        if (data.person2.birthtime) {
          setKoreanBirthTime2(findClosestBirthTime(data.person2.birthtime));
        }
      } catch (error) {
        console.error("공유 데이터 파싱 에러:", error);
        toast.error("잘못된 공유 링크입니다.");
      }
    }
  }, [searchParams]);

  // 사람1 폼 데이터 업데이트
  const updatePerson1FormData = () => {
    const birthdate = formatBirthdate(birthYear1, birthMonth1, birthDay1);
    let birthtime = "";

    if (koreanBirthTime1 !== "모름") {
      const matches = koreanBirthTime1.match(/\((\d{2}):00-/);
      if (matches && matches[1]) {
        birthtime = `${matches[1]}:00`;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      person1: {
        ...prevData.person1,
        birthdate,
        birthtime,
      },
    }));
  };

  // 사람2 폼 데이터 업데이트
  const updatePerson2FormData = () => {
    const birthdate = formatBirthdate(birthYear2, birthMonth2, birthDay2);
    let birthtime = "";

    if (koreanBirthTime2 !== "모름") {
      const matches = koreanBirthTime2.match(/\((\d{2}):00-/);
      if (matches && matches[1]) {
        birthtime = `${matches[1]}:00`;
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      person2: {
        ...prevData.person2,
        birthdate,
        birthtime,
      },
    }));
  };

  // 생년월일 또는 시간 변경 시 폼 데이터 업데이트
  useEffect(() => {
    updatePerson1FormData();
  }, [birthYear1, birthMonth1, birthDay1, koreanBirthTime1]);

  useEffect(() => {
    updatePerson2FormData();
  }, [birthYear2, birthMonth2, birthDay2, koreanBirthTime2]);

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 데이터 검증
    const validationResult = validateFormData();
    if (!validationResult.isValid) {
      setError(validationResult.errorMessage);
      toast.error(validationResult.errorMessage);
      return;
    }

    // 친구 궁합 데이터 저장
    setState({
      person1: {
        ...formData.person1,
      },
      person2: {
        ...formData.person2,
      },
    });

    // 에러 상태 초기화
    setError("");

    // 단계를 3으로 변경 (결과 단계)
    setStep(3);

    // 결과 페이지로 이동
    router.push("/friendship-compatibility/result");
  };

  // 입력 필드 변경 처리
  const handleInputChange = (
    person: "person1" | "person2",
    field: string,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [person]: {
        ...prevData[person],
        [field]: value,
      },
    }));
  };

  // 공유 링크 생성
  const generateShareLink = () => {
    try {
      const encodedData = btoa(JSON.stringify(formData));
      const baseUrl = window.location.origin;
      return `${baseUrl}/friendship-compatibility?data=${encodedData}`;
    } catch (error) {
      console.error("링크 생성 에러:", error);
      toast.error("링크 생성 중 오류가 발생했습니다.");
      return "";
    }
  };

  // 클립보드에 복사
  const copyToClipboard = () => {
    const shareLink = generateShareLink();
    if (shareLink) {
      navigator.clipboard
        .writeText(shareLink)
        .then(() => {
          toast.success("링크가 클립보드에 복사되었습니다.");
        })
        .catch((error) => {
          console.error("클립보드 복사 실패:", error);
          toast.error("링크 복사에 실패했습니다.");
        });
    }
  };

  // 카카오 공유
  const shareToKakao = () => {
    const shareLink = generateShareLink();
    if (shareLink && window.Kakao && window.Kakao.Share) {
      const shareTitle = `${formData.person1.name}님과 ${formData.person2.name}님의 친구 궁합`;
      const shareDescription = "고양이 운세에서 친구 궁합을 확인해보세요!";

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: shareTitle,
          description: shareDescription,
          imageUrl: `${window.location.origin}/cat_magic.png`,
          link: {
            mobileWebUrl: shareLink,
            webUrl: shareLink,
          },
        },
        buttons: [
          {
            title: "친구 궁합 확인하기",
            link: {
              mobileWebUrl: shareLink,
              webUrl: shareLink,
            },
          },
        ],
      });
    } else {
      toast.error("카카오 공유 초기화에 실패했습니다.");
    }
  };

  // 공유 버튼 클릭 처리
  const handleShareClick = () => {
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen pb-20 bg-purple-50">
      <PageHeader title="2025 친구 궁합" />
      <Toaster position="top-center" />
      <div className="max-w-xl mx-auto px-4 pt-6">
        <AnimatePresence>
          {shareGuideVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-purple-400/20"
            >
              <h3 className="text-lg font-medium text-purple-800 mb-2">
                친구 궁합 링크 공유하기
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                현재 작성 중인 친구 궁합 정보를 공유할 수 있어요. 궁합을 보고
                싶은 친구에게 링크를 보내세요!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  링크 복사하기
                </button>
                <button
                  onClick={shareToKakao}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  카카오로 공유하기
                </button>
                <button
                  onClick={() => setShareGuideVisible(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <Image
                src="/new_cat_book.png"
                alt="고양이 마법사"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          <p className="text-center text-purple-700 mb-6">
            친구와의 케미를 확인해볼까냥? 🐱✨
          </p>

          <form onSubmit={handleSubmit}>
            {/* 첫 번째 사람 정보 */}
            <div className="mb-6 p-5 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-medium text-purple-900 mb-4">
                첫 번째 사람 정보 {userProfile ? "(내 정보)" : ""}
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="person1-name"
                  className="block text-sm font-medium text-purple-700 mb-1"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="person1-name"
                  value={formData.person1.name}
                  onChange={(e) =>
                    handleInputChange("person1", "name", e.target.value)
                  }
                  placeholder="이름을 입력하세요"
                  className="w-full bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-300"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-purple-700">
                    성별
                  </label>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.person1.gender === "남"}
                      onChange={() =>
                        handleInputChange("person1", "gender", "남")
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-full px-6 py-3 rounded-lg text-center transition-colors ${
                        formData.person1.gender === "남"
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-purple-300 text-purple-700"
                      }`}
                    >
                      남성
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.person1.gender === "여"}
                      onChange={() =>
                        handleInputChange("person1", "gender", "여")
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-full px-6 py-3 rounded-lg text-center transition-colors ${
                        formData.person1.gender === "여"
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-purple-300 text-purple-700"
                      }`}
                    >
                      여성
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  생년월일
                </label>
                <div className="flex gap-2">
                  <select
                    value={birthYear1}
                    onChange={(e) => setBirthYear1(e.target.value)}
                    className="flex-1 bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    <option value="">년</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthMonth1}
                    onChange={(e) => setBirthMonth1(e.target.value)}
                    className="flex-1 bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    <option value="">월</option>
                    {monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthDay1}
                    onChange={(e) => setBirthDay1(e.target.value)}
                    className="flex-1 bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    <option value="">일</option>
                    {dayOptions1.map((day) => (
                      <option key={day} value={day}>
                        {day}일
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  태어난 시간
                </label>
                <select
                  value={koreanBirthTime1}
                  onChange={(e) =>
                    setKoreanBirthTime1(e.target.value as BirthTime)
                  }
                  className="w-full bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                >
                  <option value="모름">모름</option>
                  <option value="자시(23:00-01:00)">자시(23:00-01:00)</option>
                  <option value="축시(01:00-03:00)">축시(01:00-03:00)</option>
                  <option value="인시(03:00-05:00)">인시(03:00-05:00)</option>
                  <option value="묘시(05:00-07:00)">묘시(05:00-07:00)</option>
                  <option value="진시(07:00-09:00)">진시(07:00-09:00)</option>
                  <option value="사시(09:00-11:00)">사시(09:00-11:00)</option>
                  <option value="오시(11:00-13:00)">오시(11:00-13:00)</option>
                  <option value="미시(13:00-15:00)">미시(13:00-15:00)</option>
                  <option value="신시(15:00-17:00)">신시(15:00-17:00)</option>
                  <option value="유시(17:00-19:00)">유시(17:00-19:00)</option>
                  <option value="술시(19:00-21:00)">술시(19:00-21:00)</option>
                  <option value="해시(21:00-23:00)">해시(21:00-23:00)</option>
                </select>
                <p className="text-xs text-purple-500 mt-1">
                  모를 경우 &apos;모름&apos;을 선택하세요
                </p>
              </div>
            </div>

            {/* 두 번째 사람 정보 */}
            <div className="mb-6 p-5 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-medium text-purple-900 mb-4">
                두 번째 사람 정보
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="person2-name"
                  className="block text-sm font-medium text-purple-700 mb-1"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="person2-name"
                  value={formData.person2.name}
                  onChange={(e) =>
                    handleInputChange("person2", "name", e.target.value)
                  }
                  placeholder="이름을 입력하세요"
                  className="w-full bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-300"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-purple-700">
                    성별
                  </label>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.person2.gender === "남"}
                      onChange={() =>
                        handleInputChange("person2", "gender", "남")
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-full px-6 py-3 rounded-lg text-center transition-colors ${
                        formData.person2.gender === "남"
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-purple-300 text-purple-700"
                      }`}
                    >
                      남성
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.person2.gender === "여"}
                      onChange={() =>
                        handleInputChange("person2", "gender", "여")
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-full px-6 py-3 rounded-lg text-center transition-colors ${
                        formData.person2.gender === "여"
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-purple-300 text-purple-700"
                      }`}
                    >
                      여성
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  생년월일
                </label>
                <div className="flex gap-2">
                  <select
                    value={birthYear2}
                    onChange={(e) => setBirthYear2(e.target.value)}
                    className="flex-1 bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    <option value="">년</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}년
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthMonth2}
                    onChange={(e) => setBirthMonth2(e.target.value)}
                    className="flex-1 bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    <option value="">월</option>
                    {monthOptions.map((month) => (
                      <option key={month} value={month}>
                        {month}월
                      </option>
                    ))}
                  </select>
                  <select
                    value={birthDay2}
                    onChange={(e) => setBirthDay2(e.target.value)}
                    className="flex-1 bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                  >
                    <option value="">일</option>
                    {dayOptions2.map((day) => (
                      <option key={day} value={day}>
                        {day}일
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-purple-700 mb-1">
                  태어난 시간
                </label>
                <select
                  value={koreanBirthTime2}
                  onChange={(e) =>
                    setKoreanBirthTime2(e.target.value as BirthTime)
                  }
                  className="w-full bg-white border border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
                >
                  <option value="모름">모름</option>
                  <option value="자시(23:00-01:00)">자시(23:00-01:00)</option>
                  <option value="축시(01:00-03:00)">축시(01:00-03:00)</option>
                  <option value="인시(03:00-05:00)">인시(03:00-05:00)</option>
                  <option value="묘시(05:00-07:00)">묘시(05:00-07:00)</option>
                  <option value="진시(07:00-09:00)">진시(07:00-09:00)</option>
                  <option value="사시(09:00-11:00)">사시(09:00-11:00)</option>
                  <option value="오시(11:00-13:00)">오시(11:00-13:00)</option>
                  <option value="미시(13:00-15:00)">미시(13:00-15:00)</option>
                  <option value="신시(15:00-17:00)">신시(15:00-17:00)</option>
                  <option value="유시(17:00-19:00)">유시(17:00-19:00)</option>
                  <option value="술시(19:00-21:00)">술시(19:00-21:00)</option>
                  <option value="해시(21:00-23:00)">해시(21:00-23:00)</option>
                </select>
                <p className="text-xs text-purple-500 mt-1">
                  모를 경우 &apos;모름&apos;을 선택하세요
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 px-6 rounded-xl transition-colors shadow-lg shadow-purple-300/30"
            >
              친구 궁합 확인하기
            </motion.button>
            <button
              type="button"
              onClick={handleShareClick}
              className="w-full mt-4 px-6 py-3 rounded-xl bg-white border border-[#990dfa] text-[#990dfa] font-medium hover:bg-[#F9F5FF] transition-colors flex items-center justify-center"
            >
              <Share2 className="h-5 w-5 mr-2" />
              공유하고 궁합보기
            </button>
            <p className="text-center text-purple-500 text-xs mt-4">
              생년월일과 시간 정보는 정확한 궁합 분석을 위해 사용됩니다.
            </p>
          </form>
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onCopyLink={copyToClipboard}
          onShareKakao={shareToKakao}
        />
      )}

      {/* 퀵 메뉴 영역 */}
      {step === 3 && (
        <div className="flex justify-center mt-8 pt-4 mb-8">
          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link href="/chat">
                <div className="bg-[#F9F5FF] rounded-2xl p-4 flex flex-col items-center hover:bg-[#F0EAFF] transition-colors">
                  <div className="mb-2 text-[#990dfa] w-12 h-12 flex items-center justify-center">
                    {chatAnimationData ? (
                      <Lottie
                        animationData={chatAnimationData}
                        lottieRef={chatAnimationRef}
                        style={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-[#3B2E7E] text-center">
                    궁합챗
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href="/profile">
                <div className="bg-[#F9F5FF] rounded-2xl p-4 flex flex-col items-center hover:bg-[#F0EAFF] transition-colors">
                  <div className="mb-2 text-[#990dfa] w-12 h-12 flex items-center justify-center">
                    {profileAnimationData ? (
                      <Lottie
                        animationData={profileAnimationData}
                        lottieRef={profileAnimationRef}
                        style={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
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
                    )}
                  </div>
                  <span className="text-xs text-[#3B2E7E] text-center">
                    내 정보
                  </span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link href="/talisman-gallery">
                <div className="bg-[#F9F5FF] rounded-2xl p-4 flex flex-col items-center hover:bg-[#F0EAFF] transition-colors">
                  <div className="mb-2 text-[#990dfa] w-12 h-12 flex items-center justify-center">
                    {talismanAnimationData ? (
                      <Lottie
                        animationData={talismanAnimationData}
                        lottieRef={talismanAnimationRef}
                        style={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-[#3B2E7E] text-center">
                    부적
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
