'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import { Gender, CalendarType, BirthTime } from '@/app/types';

// 이름 유효성 검사 함수
const validateName = (name: string): { isValid: boolean; errorMessage: string } => {
  // 빈 값 체크
  if (!name.trim()) {
    return { isValid: false, errorMessage: '이름을 입력해주세요.' };
  }
  
  // 길이 체크 (2글자 이상)
  if (name.trim().length < 2) {
    return { isValid: false, errorMessage: '이름은 2글자 이상이어야 합니다.' };
  }
  
  // 한글/영문만 허용 (자음, 모음 단독 사용 불가)
  const koreanRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!koreanRegex.test(name)) {
    return { isValid: false, errorMessage: '이름은 한글 또는 영문만 입력 가능합니다. (자음, 모음 단독 사용 불가)' };
  }
  
  // 한글 자음/모음만 있는지 체크
  const koreanSingleCharRegex = /[ㄱ-ㅎㅏ-ㅣ]/;
  if (koreanSingleCharRegex.test(name)) {
    return { isValid: false, errorMessage: '완성된 한글만 입력 가능합니다. (자음, 모음 단독 사용 불가)' };
  }
  
  return { isValid: true, errorMessage: '' };
};

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useUser();
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('남성');
  const [birthDate, setBirthDate] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('양력');
  const [birthTime, setBirthTime] = useState<BirthTime>('모름');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  
  // 생년월일 수정을 위한 상태
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
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
  
  // 생년월일 파싱
  const parsedBirthDate = birthDate ? {
    year: new Date(birthDate).getFullYear(),
    month: new Date(birthDate).getMonth() + 1,
    day: new Date(birthDate).getDate()
  } : null;
  
  // 연도 옵션 생성 (1930년부터 현재까지)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => 1930 + i).reverse();
  
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
    '자시(23:00-01:00)', 
    '축시(01:00-03:00)', 
    '인시(03:00-05:00)', 
    '묘시(05:00-07:00)', 
    '진시(07:00-09:00)', 
    '사시(09:00-11:00)', 
    '오시(11:00-13:00)', 
    '미시(13:00-15:00)', 
    '신시(15:00-17:00)', 
    '유시(17:00-19:00)', 
    '술시(19:00-21:00)', 
    '해시(21:00-23:00)',
    '모름'
  ];
  
  // 프로필 ID로 저장된 운세 데이터의 로컬 스토리지 키 생성
  const getFortuneStorageKey = (userId: string) => {
    return `fortune_${userId}_${new Date().toISOString().split('T')[0]}`;
  };
  
  // 저장된 운세 데이터 삭제 (프로필 업데이트시 호출)
  const clearStoredFortune = useCallback(() => {
    if (!userProfile || typeof window === 'undefined') return;
    
    try {
      const key = getFortuneStorageKey(userProfile.id);
      localStorage.removeItem(key);
      console.log('프로필 업데이트에 따라 저장된 운세 데이터를 삭제했습니다.');
    } catch (error) {
      console.error('저장된 운세 데이터 삭제 오류:', error);
    }
  }, [userProfile]);
  
  // 프로필 편집 시작
  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setMessage('');
  };
  
  // 편집 취소
  const handleCancel = () => {
    // 원래 값으로 복구
    if (userProfile) {
      setName(userProfile.name);
      setGender(userProfile.gender);
      setBirthDate(userProfile.birthDate);
      setCalendarType(userProfile.calendarType);
      setBirthTime(userProfile.birthTime);
      setProfileImage(userProfile.profileImageUrl);
      
      // 생년월일 복원
      if (userProfile.birthDate) {
        const date = new Date(userProfile.birthDate);
        setBirthYear(date.getFullYear().toString());
        setBirthMonth((date.getMonth() + 1).toString());
        setBirthDay(date.getDate().toString());
      }
    }
    setIsEditing(false);
    setError('');
    setMessage('');
    setShowDatePicker(false);
  };
  
  // 프로필 이미지 선택 (데모용으로 기본 이미지 사용)
  const handleImageSelection = () => {
    // 실제 구현에서는 파일 업로드 로직이 필요하지만, 
    // 이 예제에서는 간단히 기본 이미지 URL을 사용합니다.
    setProfileImage('/profile_placeholder.png');
  };
  
  // 생년월일 업데이트
  const updateBirthDate = () => {
    // 유효성 검사
    if (!birthYear || !birthMonth || !birthDay) {
      setError('생년월일을 모두 선택해주세요.');
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
      setError('유효하지 않은 날짜입니다.');
      return;
    }
    
    // 생년월일 포맷팅 (YYYY-MM-DD)
    const formattedBirthDate = `${birthYear}-${String(parseInt(birthMonth)).padStart(2, '0')}-${String(parseInt(birthDay)).padStart(2, '0')}`;
    setBirthDate(formattedBirthDate);
    setShowDatePicker(false);
    setError('');
  };
  
  // 프로필 저장
  const handleSave = async () => {
    setError('');
    setMessage('');
    
    // 이름 유효성 검사
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.errorMessage);
      return;
    }
    
    // 생년월일 필수값 검사
    if (!birthDate) {
      setError('생년월일을 선택해주세요.');
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
        profileImageUrl: profileImage
      });
      
      // 저장된 운세 데이터 삭제 (새로운 프로필 정보로 운세를 다시 불러오기 위함)
      clearStoredFortune();
      
      setIsEditing(false);
      setMessage('프로필이 업데이트되었습니다. 운세 정보가 갱신됩니다.');
      
      // 성공 메시지 표시 후 몇 초 후에 사라지게 함
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!userProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">내 프로필</h1>
        <p className="text-sm text-gray-600">프로필 정보를 관리합니다</p>
      </header>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100 mb-6">
        <div className="p-6 space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-purple-200 mb-4">
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
                    className="h-12 w-12 text-gray-400" 
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
            {isEditing && (
              <button
                type="button"
                onClick={handleImageSelection}
                className="py-1 px-3 rounded-lg bg-purple-100 text-purple-700 text-sm border border-purple-300"
              >
                이미지 변경
              </button>
            )}
          </div>
          
          {/* 오류 메시지 */}
          {error && (
            <div className="p-2 rounded-lg text-center bg-red-100 text-red-700">
              {error}
            </div>
          )}
          
          {/* 프로필 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 (2글자 이상, 한글/영문만)"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg text-gray-800">{name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
              {isEditing ? (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setGender('남성')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      gender === '남성' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'
                    }`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('여성')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      gender === '여성' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'
                    }`}
                  >
                    여성
                  </button>
                </div>
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg text-gray-800">{gender}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
              {isEditing ? (
                showDatePicker ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">연도</option>
                        {yearOptions.map(year => (
                          <option key={year} value={year.toString()}>
                            {year}년
                          </option>
                        ))}
                      </select>
                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">월</option>
                        {monthOptions.map(month => (
                          <option key={month} value={month.toString()}>
                            {month}월
                          </option>
                        ))}
                      </select>
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">일</option>
                        {dayOptions.map(day => (
                          <option key={day} value={day.toString()}>
                            {day}일
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="py-1 px-3 rounded-lg bg-gray-100 text-gray-700 text-sm border border-gray-300"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={updateBirthDate}
                        className="py-1 px-3 rounded-lg bg-purple-100 text-purple-700 text-sm border border-purple-300"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="p-2 bg-gray-50 rounded-lg text-gray-800 flex-grow">
                      {parsedBirthDate ? 
                        `${parsedBirthDate.year}년 ${parsedBirthDate.month}월 ${parsedBirthDate.day}일` : 
                        '날짜 정보 없음'
                      }
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(true)}
                      className="ml-2 py-1 px-3 rounded-lg bg-purple-100 text-purple-700 text-sm border border-purple-300"
                    >
                      변경
                    </button>
                  </div>
                )
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg text-gray-800">
                  {parsedBirthDate ? 
                    `${parsedBirthDate.year}년 ${parsedBirthDate.month}월 ${parsedBirthDate.day}일 (${calendarType})` : 
                    '날짜 정보 없음'
                  }
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">양력/음력</label>
              {isEditing ? (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCalendarType('양력')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      calendarType === '양력' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'
                    }`}
                  >
                    양력
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarType('음력')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      calendarType === '음력' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'
                    }`}
                  >
                    음력
                  </button>
                </div>
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg text-gray-800">{calendarType}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">태어난 시간</label>
              {isEditing ? (
                <select
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value as BirthTime)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="p-2 bg-gray-50 rounded-lg text-gray-800">{birthTime}</p>
              )}
            </div>
          </div>
          
          {/* 상태 메시지 */}
          {message && (
            <div className={`p-2 rounded-lg text-center ${
              message.includes('오류') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}
          
          {/* 버튼 */}
          <div className="flex justify-center space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="py-2 px-6 rounded-lg border border-gray-300 text-gray-700"
                  disabled={isSaving}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="py-2 px-6 rounded-lg bg-purple-600 text-white flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      저장 중...
                    </>
                  ) : '저장'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="py-2 px-6 rounded-lg bg-purple-600 text-white"
              >
                편집
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 개발자 정보 */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>AI 사주 상담냥이 v1.0</p>
        <p className="mt-1">© 2023 AI Fortune Teller</p>
      </div>
    </div>
  );
} 