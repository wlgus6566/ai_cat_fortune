"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import { Gender, CalendarType, BirthTime } from "@/app/type/types";
import { useTranslations } from "next-intl";
import Image from "next/image";
import PageHeader from "@/app/components/PageHeader";

// 이름 유효성 검사 함수
const validateName = (
  name: string
): { isValid: boolean; errorMessage: string } => {
  // 빈 값 체크
  if (!name.trim()) {
    return { isValid: false, errorMessage: "nameValidation.required" };
  }

  // 길이 체크 (2글자 이상)
  if (name.trim().length < 2) {
    return { isValid: false, errorMessage: "nameValidation.tooShort" };
  }

  // 한글/영문만 허용 (자음, 모음 단독 사용 불가)
  const koreanRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!koreanRegex.test(name)) {
    return { isValid: false, errorMessage: "nameValidation.invalidFormat" };
  }

  // 한글 자음/모음만 있는지 체크
  const koreanSingleCharRegex = /[ㄱ-ㅎㅏ-ㅣ]/;
  if (koreanSingleCharRegex.test(name)) {
    return {
      isValid: false,
      errorMessage: "nameValidation.incompleteCharacter",
    };
  }

  return { isValid: true, errorMessage: "" };
};

export default function ProfileEditPage() {
  const { userProfile, updateUserProfile, clearUserProfile } = useUser();
  const router = useRouter();
  const t = useTranslations("profile");

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("남성");
  const [birthDate, setBirthDate] = useState("");
  const [calendarType, setCalendarType] = useState<CalendarType>("양력");
  const [birthTime, setBirthTime] = useState<BirthTime>("모름");
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 생년월일 수정을 위한 상태
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 파일 업로드 참조 생성
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 정보 로드
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setGender(userProfile.gender);
      setBirthDate(userProfile.birthDate);
      setCalendarType(userProfile.calendarType);
      setBirthTime(userProfile.birthTime);
      setProfileImage(userProfile.profileImageUrl);

      // 생년월일 파싱
      if (userProfile.birthDate) {
        const date = new Date(userProfile.birthDate);
        setBirthYear(date.getFullYear().toString());
        setBirthMonth((date.getMonth() + 1).toString());
        setBirthDay(date.getDate().toString());
      }
    }
  }, [userProfile]);

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

  // 저장된 운세 데이터 삭제 (프로필 업데이트시 호출)
  const clearStoredFortune = () => {
    if (!userProfile || typeof window === "undefined") return;

    try {
      // 키 패턴
      const keyPattern = `fortune_${userProfile.id}`;

      // localStorage의 모든 키를 확인
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // fortune_ 으로 시작하는 키만 처리
        if (key && key.startsWith(keyPattern)) {
          localStorage.removeItem(key);
        }
      }

      console.log("프로필 업데이트에 따라 저장된 운세 데이터를 삭제했습니다.");
    } catch (error) {
      console.error("저장된 운세 데이터 삭제 오류:", error);
    }
  };

  // 편집 취소
  const handleCancel = () => {
    router.back();
  };

  // 프로필 삭제 시작
  const handleStartDelete = () => {
    setShowDeleteConfirm(true);
  };

  // 프로필 삭제 취소
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // 프로필 삭제 확인
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await clearUserProfile();
      router.push("/profile");
    } catch (error) {
      console.error("프로필 삭제 중 오류가 발생했습니다:", error);
      setError(t("deleteError"));
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // 생년월일 업데이트
  const updateBirthDate = () => {
    // 유효성 검사
    if (!birthYear || !birthMonth || !birthDay) {
      setError(t("dateValidation.required"));
      return;
    }

    // 날짜 유효성 검사
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
      setError(t("dateValidation.invalid"));
      return;
    }

    // 미래 날짜 체크
    const today = new Date();
    if (selectedDate > today) {
      setError(t("dateValidation.future"));
      return;
    }

    // 생년월일 포맷팅 (YYYY-MM-DD)
    const formattedBirthDate = `${birthYear}-${String(
      parseInt(birthMonth)
    ).padStart(2, "0")}-${String(parseInt(birthDay)).padStart(2, "0")}`;
    setBirthDate(formattedBirthDate);
    setShowDatePicker(false);
    setError("");
  };

  // 프로필 저장
  const handleSave = async () => {
    setError("");
    setMessage("");

    // 이름 유효성 검사
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setError(t(nameValidation.errorMessage));
      return;
    }

    // 생년월일 필수값 검사
    if (!birthDate) {
      setError(t("dateValidation.required"));
      return;
    }

    setIsSaving(true);

    try {
      // 프로필 업데이트
      await updateUserProfile({
        name,
        gender,
        birthDate,
        calendarType,
        birthTime,
        profileImageUrl: profileImage,
      });

      // 저장된 운세 데이터 삭제 (새로운 프로필 정보로 운세를 다시 불러오기 위함)
      clearStoredFortune();

      setMessage(t("saveSuccess"));

      // 성공 메시지 표시 후 몇 초 후에 설정 페이지로 돌아감
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      setError(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  // 프로필 이미지 업로드 처리
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError(t("imageError.size"));
      return;
    }

    // 이미지 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      setError(t("imageError.type"));
      return;
    }

    setIsUploadingImage(true);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string);
        setIsUploadingImage(false);
        setMessage(t("imageSuccess"));
        setTimeout(() => setMessage(""), 2000);
      }
    };
    reader.onerror = () => {
      setError(t("imageError.upload"));
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // 프로필 이미지 삭제
  const handleRemoveProfileImage = () => {
    setProfileImage(undefined);

    // 파일 인풋 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 프로필 이미지 선택 창 열기
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAE1F4] to-[#F9F9F9] pb-16">
      {/* 헤더 */}
      <PageHeader
        title={t("pageTitle")}
        onBack={handleCancel}
        className="bg-white shadow-md relative z-10"
      />

      <div className="container mx-auto max-w-screen-md">
        <div className="p-4">
          {message && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border-l-4 border-green-500 flex items-center">
              <span className="text-xl mr-2">✓</span>
              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border-l-4 border-red-500 flex items-center">
              <span className="text-xl mr-2">✗</span>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6">
            <div className="bg-purple-50 p-5 rounded-lg">
              <label className="block text-sm font-medium text-purple-800 mb-3">
                <span className="text-purple-600 mr-1">📷</span>{" "}
                {t("profileImage")}
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div
                  className="relative rounded-full overflow-hidden border-4 border-purple-200 w-32 h-32 bg-white flex items-center justify-center shadow-md hover:border-purple-300 transition-all cursor-pointer"
                  onClick={openFileSelector}
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={t("profileImage")}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-4xl text-purple-300 mb-1">✨</span>
                      <span className="text-xs text-purple-400">
                        {t("addImage")}
                      </span>
                    </div>
                  )}

                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-purple-300 rounded-full border-t-purple-500"></div>
                    </div>
                  )}

                  <div className="absolute bottom-0 right-0 bg-purple-500 p-1 rounded-full shadow-md transform translate-x-1 translate-y-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={openFileSelector}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("changeImage")}
                  </button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t("removeImage")}
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />

                <p className="text-xs text-gray-500">{t("imageHelp")}</p>
              </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-purple-800 mb-2"
              >
                <span className="text-purple-600 mr-1">✨</span> {t("name")}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                placeholder="이름을 입력해주세요"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-5 rounded-lg">
                <label className="block text-sm font-medium text-purple-800 mb-3">
                  <span className="text-purple-600 mr-1">♀♂</span> {t("gender")}
                </label>
                <div className="flex space-x-4">
                  <label
                    className={`inline-flex items-center p-3 rounded-lg border cursor-pointer hover:bg-purple-100 transition-colors ${
                      gender === "남성"
                        ? "bg-purple-100 border-purple-500"
                        : "bg-white border-purple-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "남성"}
                      onChange={() => setGender("남성")}
                      className="form-radio h-4 w-4 text-purple-600 hidden"
                    />
                    <span className="text-purple-900">
                      {t("genderOptions.male")}
                    </span>
                  </label>
                  <label
                    className={`inline-flex items-center p-3 rounded-lg border cursor-pointer hover:bg-purple-100 transition-colors ${
                      gender === "여성"
                        ? "bg-purple-100 border-purple-500"
                        : "bg-white border-purple-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === "여성"}
                      onChange={() => setGender("여성")}
                      className="form-radio h-4 w-4 text-purple-600 hidden"
                    />
                    <span className="text-purple-900">
                      {t("genderOptions.female")}
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg">
                <label className="block text-sm font-medium text-purple-800 mb-3">
                  <span className="text-purple-600 mr-1">☀</span>{" "}
                  {t("calendarType")}
                </label>
                <div className="flex space-x-4">
                  <label
                    className={`inline-flex items-center p-3 rounded-lg border cursor-pointer hover:bg-purple-100 transition-colors ${
                      calendarType === "양력"
                        ? "bg-purple-100 border-purple-500"
                        : "bg-white border-purple-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="calendar"
                      checked={calendarType === "양력"}
                      onChange={() => setCalendarType("양력")}
                      className="form-radio h-4 w-4 text-purple-600 hidden"
                    />
                    <span className="text-purple-900">
                      {t("calendarOptions.solar")}
                    </span>
                  </label>
                  <label
                    className={`inline-flex items-center p-3 rounded-lg border cursor-pointer hover:bg-purple-100 transition-colors ${
                      calendarType === "음력"
                        ? "bg-purple-100 border-purple-500"
                        : "bg-white border-purple-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="calendar"
                      checked={calendarType === "음력"}
                      onChange={() => setCalendarType("음력")}
                      className="form-radio h-4 w-4 text-purple-600 hidden"
                    />
                    <span className="text-purple-900">
                      {t("calendarOptions.lunar")}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg">
              <label className="block text-sm font-medium text-purple-800 mb-3">
                <span className="text-purple-600 mr-1">🌟</span>{" "}
                {t("birthDate")}
              </label>
              {!showDatePicker ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={
                      birthDate ? new Date(birthDate).toLocaleDateString() : ""
                    }
                    className="flex-1 px-4 py-3 border border-purple-300 rounded-lg shadow-sm bg-white cursor-pointer"
                    readOnly
                    onClick={() => setShowDatePicker(true)}
                    placeholder="생년월일을 선택해주세요"
                  />
                  <button
                    type="button"
                    className="ml-2 p-3 text-purple-600 hover:text-purple-800 bg-white rounded-full border border-purple-300 shadow-sm hover:bg-purple-50 transition-colors"
                    onClick={() => setShowDatePicker(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-white shadow-sm">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-purple-600 mb-1 font-medium">
                        년
                      </label>
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                      >
                        <option value="">선택</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-purple-600 mb-1 font-medium">
                        월
                      </label>
                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                      >
                        <option value="">선택</option>
                        {monthOptions.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-purple-600 mb-1 font-medium">
                        일
                      </label>
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                      >
                        <option value="">선택</option>
                        {dayOptions.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm border border-purple-300 rounded-lg hover:bg-purple-50 text-purple-800"
                      onClick={() => setShowDatePicker(false)}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      onClick={updateBirthDate}
                    >
                      {t("save")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-purple-50 p-5 rounded-lg">
              <label
                htmlFor="birthTime"
                className="block text-sm font-medium text-purple-800 mb-3"
              >
                <span className="text-purple-600 mr-1">🕐</span>{" "}
                {t("birthTime")}
              </label>
              <select
                id="birthTime"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value as BirthTime)}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time === "모름" ? t("birthTimeUnknown") : time}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="mx-8 text-center mb-4 ">
          <button
            onClick={handleStartDelete}
            className="w-full py-3 px-6 rounded-xl border border-red-300 text-red-600 font-medium"
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? t("deleting") : t("delete")}
          </button>
          <p className="my-8 text-purple-700 text-xs">
            {t("profileDataUsage")}
          </p>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t border-gray-100 z-20">
        <div className="container mx-auto max-w-md flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-600 font-medium"
            disabled={isSaving || isDeleting}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-3 px-6 rounded-xl text-white font-medium ${
              isSaving ? "bg-purple-400" : "bg-purple-600"
            }`}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? "저장 중..." : t("save")}
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {t("deleteConfirmTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("deleteConfirmMessage")}</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-600 font-medium"
                disabled={isDeleting}
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`flex-1 py-2 px-4 rounded-lg text-white font-medium ${
                  isDeleting ? "bg-red-400" : "bg-red-600"
                }`}
                disabled={isDeleting}
              >
                {isDeleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
