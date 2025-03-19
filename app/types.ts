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
