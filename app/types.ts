export type ConcernType = '연애' | '직장' | '돈' | '심리' | '인간관계' | '라이프스타일';

export type SubConcernType = {
  [key in ConcernType]: string[];
};

export type ChatStep = 
  | 'INITIAL'                // 초기 상태
  | 'CONCERN_SELECT'         // 고민 유형 선택
  | 'DETAIL_LEVEL_1_SELECT'  // 1단계 세부 고민 선택
  | 'DETAIL_LEVEL_2_SELECT'  // 2단계 세부 고민 선택
  | 'DETAIL_LEVEL_3_SELECT'  // 3단계 세부 고민 선택
  | 'DIRECT_INPUT'           // 직접 입력 모드
  | 'FORTUNE_RESULT';        // 결과 표시

export type InputMode = 'SELECTION' | 'DIRECT_INPUT';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  imageUrl?: string; // 타로 카드 이미지 URL
  options?: string[]; // 선택 옵션이 있는 경우
}

// 4단계 구조를 위한 데이터 타입
export interface DetailedConcernLevel2 {
  [key: string]: string[];
}

export interface DetailedConcernLevel1 {
  [key: string]: {
    level2: DetailedConcernLevel2;
  };
}

export interface DetailedConcern {
  level1: DetailedConcernLevel1;
}

export type DetailedConcerns = Record<ConcernType, DetailedConcern>;

// 사용자 프로필 관련 타입 정의
export type Gender = '남성' | '여성';
export type CalendarType = '양력' | '음력';
export type BirthTime = 
  | '자시(23:00-01:00)' 
  | '축시(01:00-03:00)' 
  | '인시(03:00-05:00)' 
  | '묘시(05:00-07:00)' 
  | '진시(07:00-09:00)' 
  | '사시(09:00-11:00)' 
  | '오시(11:00-13:00)' 
  | '미시(13:00-15:00)' 
  | '신시(15:00-17:00)' 
  | '유시(17:00-19:00)' 
  | '술시(19:00-21:00)' 
  | '해시(21:00-23:00)' 
  | '모름';

export interface UserProfile {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD 형식
  calendarType: CalendarType;
  birthTime: BirthTime;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 앱 네비게이션 타입
export type AppTab = 'home' | 'chat' | 'profile'; 