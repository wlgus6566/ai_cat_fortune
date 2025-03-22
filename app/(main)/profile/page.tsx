'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import { Gender, CalendarType, BirthTime } from '@/app/types';
import UserTalismans from '@/app/components/UserTalismans';
//import SajuInfo from '@/app/components/SajuInfo';

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
  const getFortuneStorageKey = (userId: string, day?: string) => {
    const today = day || new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    return `fortune_${userId}_${today}`;
  };
  
  // 모든 이전 운세 데이터 삭제
  const clearAllPreviousFortuneData = (userId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // localStorage의 모든 키를 확인
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // fortune_ 으로 시작하는 키만 처리
        if (key && key.startsWith(`fortune_${userId}`)) {
          // 날짜 부분 추출
          const keyParts = key.split('_');
          if (keyParts.length >= 3) {
            const keyDate = keyParts[2];
            
            // 오늘 날짜가 아닌 경우 삭제
            if (keyDate !== today) {
              localStorage.removeItem(key);
              console.log(`이전 운세 데이터 삭제: ${key}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('이전 운세 데이터 삭제 오류:', error);
    }
  };
  
  // 저장된 운세 데이터 삭제 (프로필 업데이트시 호출)
  const clearStoredFortune = useCallback(() => {
    if (!userProfile || typeof window === 'undefined') return;
    
    try {
      // 모든 날짜의 운세 데이터 삭제
      clearAllPreviousFortuneData(userProfile.id);
      
      // 오늘 데이터도 삭제
      const key = getFortuneStorageKey(userProfile.id);
      localStorage.removeItem(key);
      
      console.log('프로필 업데이트에 따라 저장된 운세 데이터를 삭제했습니다.');
    } catch (error) {
      console.error('저장된 운세 데이터 삭제 오류:', error);
    }
  }, [userProfile]);
  
  // 로컬 스토리지에서 오늘의 운세 데이터 가져오기
  useEffect(() => {
    if (!userProfile) return;
    
    try {
      // 이전 날짜의 운세 데이터 모두 삭제
      clearAllPreviousFortuneData(userProfile.id);
      
      const key = getFortuneStorageKey(userProfile.id);
      const storedData = localStorage.getItem(key);
      
      if (storedData) {
        const { timestamp } = JSON.parse(storedData);
        const storedDate = new Date(timestamp).toISOString().split('T')[0];
        const todayDate = new Date().toISOString().split('T')[0];
        
        // 저장된 데이터가 오늘 날짜가 아닌 경우 삭제
        if (storedDate !== todayDate) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('저장된 운세 데이터 불러오기 오류:', error);
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
    <div className="container max-w-2xl mx-auto px-4 py-8">      
      {/* 프로필 카드 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-6">
        {/* 프로필 상단 - 이미지와 이름 */}
        <div className="bg-purple-500 p-6 text-white relative">
          <div className="flex items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md mr-4">
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
                    className="h-10 w-10 text-gray-400" 
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
            <div>
              <h2 className="text-xl font-bold">{isEditing ? '프로필 수정' : userProfile?.name}</h2>
              <p className="text-purple-100">{parsedBirthDate ? `${parsedBirthDate.year}년 ${parsedBirthDate.month}월 ${parsedBirthDate.day}일생` : ''}</p>
            </div>
          </div>
        </div>
        
        {/* 프로필 정보 및 편집 폼 */}
        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-medium">{userProfile?.name}</p>
                </div>
                
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">성별</p>
                  <p className="font-medium">{userProfile?.gender}</p>
                </div>
                
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">생년월일</p>
                  <p className="font-medium">
                    {parsedBirthDate ? 
                      `${parsedBirthDate.year}년 ${parsedBirthDate.month}월 ${parsedBirthDate.day}일 (${userProfile?.calendarType})` : 
                      '-'}
                  </p>
                </div>
                
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-500">태어난 시간</p>
                  <p className="font-medium">{userProfile?.birthTime}</p>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition shadow-sm"
                >
                  내 정보 수정하기
                </button>
              </div>
            </div>
          ) : (
            // 편집 모드 폼
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                {/* 이름 입력 */}
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                {/* 성별 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    성별
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={gender === '남성'}
                        onChange={() => setGender('남성')}
                        className="form-radio h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2">남성</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={gender === '여성'}
                        onChange={() => setGender('여성')}
                        className="form-radio h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2">여성</span>
                    </label>
                  </div>
                </div>
                
                {/* 음력/양력 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    양력/음력
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={calendarType === '양력'}
                        onChange={() => setCalendarType('양력')}
                        className="form-radio h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2">양력</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={calendarType === '음력'}
                        onChange={() => setCalendarType('음력')}
                        className="form-radio h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2">음력</span>
                    </label>
                  </div>
                </div>
                
                {/* 생년월일 선택 */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    생년월일
                  </label>
                  {!showDatePicker ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={birthDate ? new Date(birthDate).toLocaleDateString('ko-KR') : ''}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-pointer"
                        readOnly
                        onClick={() => setShowDatePicker(true)}
                      />
                      <button
                        type="button"
                        className="ml-2 p-2 text-purple-600 hover:text-purple-800"
                        onClick={() => setShowDatePicker(true)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-3 border border-gray-200 rounded-md">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">년</label>
                          <select
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
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
                          <label className="block text-xs text-gray-500 mb-1">월</label>
                          <select
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
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
                          <label className="block text-xs text-gray-500 mb-1">일</label>
                          <select
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
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
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                          onClick={() => setShowDatePicker(false)}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                          onClick={updateBirthDate}
                        >
                          확인
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 태어난 시간 선택 */}
                <div className="sm:col-span-2">
                  <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700 mb-1">
                    태어난 시간
                  </label>
                  <select
                    id="birthTime"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value as BirthTime)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* 사주 정보 섹션 */}
      {/* {userProfile && fortune && fortune.saju && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border border-purple-100 mb-4">
            <h2 className="text-lg font-semibold mb-4 text-purple-800">나의 사주 정보</h2>
            <SajuInfo 
              birthInfo={userProfile ? `${userProfile.birthDate ? new Date(userProfile.birthDate).getFullYear() : ''}년 ${userProfile.birthDate ? new Date(userProfile.birthDate).getMonth() + 1 : ''}월 ${userProfile.birthDate ? new Date(userProfile.birthDate).getDate() : ''}일 ${userProfile.birthTime !== '모름' ? userProfile.birthTime : ''}생` : ''}
              saju={fortune.saju} 
            />
          </div>
        </div>
      )} */}
      {/* 부적 이미지 모음 */}
      {userProfile && <UserTalismans userId={userProfile.id} />}
    </div>
  );
} 