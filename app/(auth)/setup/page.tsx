"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/app/contexts/UserContext";
import { Gender, CalendarType, BirthTime } from "@/app/type/types";

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

// 검색 파라미터를 사용하는 컴포넌트
function SetupContent() {
  const { isProfileComplete, createUserProfile } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  // callbackUrl이 있으면 사용하고 없으면 fortune 페이지로 설정
  const callbackUrl = searchParams.get("callbackUrl") || "/fortune";

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("남성");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [calendarType, setCalendarType] = useState<CalendarType>("양력");
  const [birthTime, setBirthTime] = useState<BirthTime>("모름");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // 프로필이 이미 완성된 경우 메인 페이지로 리다이렉트
  useEffect(() => {
    if (isProfileComplete) {
      //router.push(callbackUrl);
    }
  }, [isProfileComplete, router, callbackUrl]);

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

  const dayOptions = Array.from(
    { length: getDaysInMonth(birthYear, birthMonth) },
    (_, i) => i + 1
  );

  // 시간 옵션
  const timeOptions: BirthTime[] = [
    "자시(23:00-01:00)",
    "축시(01:00-03:00)",
    "인시(03:00-05:00)",
    "묘시(05:00-07:00)",
    "진시(07:00-09:00)",
    "사시(09:00-11:00)",
    "오시(11:00-13:00)",
    "미시(13:00-15:00)",
    "신시(15:00-17:00)",
    "유시(17:00-19:00)",
    "술시(19:00-21:00)",
    "해시(21:00-23:00)",
    "모름",
  ];

  // 다음 단계로 이동
  const handleNext = () => {
    setError("");

    // 단계별 유효성 검사
    if (step === 1) {
      // 이름 유효성 검사
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        setError(nameValidation.errorMessage);
        return;
      }
    }

    if (step === 2) {
      // 생년월일 필수값 및 유효성 검사
      if (!birthYear || !birthMonth || !birthDay) {
        setError("생년월일을 모두 선택해주세요.");
        return;
      }

      // 생년월일 유효성 검사
      const selectedDate = new Date(
        parseInt(birthYear),
        parseInt(birthMonth) - 1,
        parseInt(birthDay)
      );

      if (
        selectedDate.getFullYear() !== parseInt(birthYear) ||
        selectedDate.getMonth() !== parseInt(birthMonth) - 1 ||
        selectedDate.getDate() !== parseInt(birthDay)
      ) {
        setError("유효하지 않은 날짜입니다.");
        return;
      }
    }

    if (step === 3) {
      // 태어난 시간 필수값 검사
      if (!birthTime) {
        setError("태어난 시간을 선택해주세요.");
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 프로필 이미지 선택 (데모용으로 기본 이미지 사용)
  const handleImageSelection = () => {
    // 실제 구현에서는 파일 업로드 로직이 필요하지만,
    // 이 예제에서는 간단히 기본 이미지 URL을 사용합니다.
    setProfileImage("/profile_placeholder.webp");
  };

  // 프로필 저장
  const handleSubmit = () => {
    // 전체 유효성 검사
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.errorMessage);
      setStep(1);
      return;
    }

    if (!birthYear || !birthMonth || !birthDay) {
      setError("생년월일을 모두 선택해주세요.");
      setStep(2);
      return;
    }

    if (!birthTime) {
      setError("태어난 시간을 선택해주세요.");
      setStep(3);
      return;
    }

    // 생년월일 포맷팅 (YYYY-MM-DD)
    const formattedBirthDate = `${birthYear}-${String(
      parseInt(birthMonth)
    ).padStart(2, "0")}-${String(parseInt(birthDay)).padStart(2, "0")}`;

    // 프로필 생성
    createUserProfile({
      name,
      gender,
      birthDate: formattedBirthDate,
      calendarType,
      birthTime,
      profileImageUrl: profileImage || undefined,
    });

    // 콜백 URL로 이동 (showFortune=true 파라미터 추가)
    // callbackUrl이 /fortune이면 showFortune 파라미터 추가
    const destinationUrl =
      callbackUrl === "/fortune"
        ? `${callbackUrl}?showFortune=true`
        : callbackUrl;

    //router.push(destinationUrl);
  };

  // 단계별 컴포넌트 렌더링
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              이름을 알려주세요
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (2글자 이상, 한글/영문만)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                성별
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setGender("남성")}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    gender === "남성"
                      ? "bg-purple-100 border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender("여성")}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    gender === "여성"
                      ? "bg-purple-100 border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  여성
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              생년월일을 알려주세요 <span className="text-red-500">*</span>
            </h2>
            <div className="flex space-x-2">
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">연도</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}년
                  </option>
                ))}
              </select>
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">월</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month.toString()}>
                    {month}월
                  </option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">일</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day.toString()}>
                    {day}일
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                양력/음력
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCalendarType("양력")}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    calendarType === "양력"
                      ? "bg-purple-100 border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  양력
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarType("음력")}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    calendarType === "음력"
                      ? "bg-purple-100 border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  음력
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              태어난 시간을 알려주세요 <span className="text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setBirthTime(time)}
                  className={`py-2 px-4 rounded-lg border ${
                    birthTime === time
                      ? "bg-purple-100 border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              프로필 이미지 (선택)
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 mb-4">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="프로필 이미지"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
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
                )}
              </div>
              <button
                type="button"
                onClick={handleImageSelection}
                className="py-2 px-4 rounded-lg bg-purple-100 text-purple-700 border border-purple-300"
              >
                이미지 선택
              </button>
              <p className="text-sm text-gray-500 mt-2">
                이미지 설정은 나중에도 가능합니다.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <p className="text-purple-700 text-xs text-center absolute -top-[28px] left-10 w-full">
          당신의 정보는 더 정확한 운세 결과를 위해서만 사용됩니다.
        </p>
        <div className="absolute -top-[88px] left-5 -z-1">
          <Image src="/new_cat_thumb.png" alt="logo" width={70} height={70} />
        </div>
        {/* 진행 표시기 */}
        <div className="mb-6">
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div
              className="absolute top-0 left-0 h-2 bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* 단계별 내용 */}
        <div className="mb-6">{renderStep()}</div>

        {/* 단계별 네비게이션 버튼 */}
        <div
          className={`flex  ${step === 1 ? "justify-end" : "justify-between"}`}
        >
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className={`px-4 py-2 rounded-lg border border-purple-500 ${
                step === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              이전
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {step === 3 ? "완료" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
          로딩 중...
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
