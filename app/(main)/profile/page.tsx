'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/app/contexts/UserContext';
import Image from 'next/image';
import { Gender, CalendarType, BirthTime } from '@/app/types';

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useUser();
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('남성');
  const [birthDate, setBirthDate] = useState('');
  const [calendarType, setCalendarType] = useState<CalendarType>('양력');
  const [birthTime, setBirthTime] = useState<BirthTime>('모름');
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // 프로필 정보 로드
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setGender(userProfile.gender);
      setBirthDate(userProfile.birthDate);
      setCalendarType(userProfile.calendarType);
      setBirthTime(userProfile.birthTime);
      setProfileImage(userProfile.profileImageUrl);
    }
  }, [userProfile]);
  
  // 생년월일 파싱
  const parsedBirthDate = birthDate ? {
    year: new Date(birthDate).getFullYear(),
    month: new Date(birthDate).getMonth() + 1,
    day: new Date(birthDate).getDate()
  } : null;
  
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
  
  // 프로필 편집 시작
  const handleEdit = () => {
    setIsEditing(true);
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
    }
    setIsEditing(false);
    setMessage('');
  };
  
  // 프로필 이미지 선택 (데모용으로 기본 이미지 사용)
  const handleImageSelection = () => {
    // 실제 구현에서는 파일 업로드 로직이 필요하지만, 
    // 이 예제에서는 간단히 기본 이미지 URL을 사용합니다.
    setProfileImage('/profile_placeholder.png');
  };
  
  // 프로필 저장
  const handleSave = async () => {
    if (!name.trim()) {
      setMessage('이름을 입력해주세요.');
      return;
    }
    
    setIsSaving(true);
    setMessage('');
    
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
      
      setIsEditing(false);
      setMessage('프로필이 업데이트되었습니다.');
      
      // 성공 메시지 표시 후 몇 초 후에 사라지게 함
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (error) {
      setMessage('프로필 업데이트 중 오류가 발생했습니다.');
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
          
          {/* 프로필 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <div className="flex items-center">
                  <p className="p-2 bg-gray-50 rounded-lg text-gray-800 w-full">
                    {parsedBirthDate ? 
                      `${parsedBirthDate.year}년 ${parsedBirthDate.month}월 ${parsedBirthDate.day}일` : 
                      '날짜 정보 없음'
                    }
                  </p>
                  <span className="mx-2 text-gray-500">•</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setCalendarType('양력')}
                      className={`py-2 px-3 rounded-lg border ${
                        calendarType === '양력' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'
                      }`}
                    >
                      양력
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarType('음력')}
                      className={`py-2 px-3 rounded-lg border ${
                        calendarType === '음력' ? 'bg-purple-100 border-purple-500' : 'border-gray-300'
                      }`}
                    >
                      음력
                    </button>
                  </div>
                </div>
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