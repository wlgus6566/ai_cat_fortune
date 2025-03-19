export type ConcernType = '연애' | '학업' | '취업' | '건강' | '재물';

export type SubConcernType = {
  [key in ConcernType]: string[];
};

export type ChatStep = 
  | 'INITIAL'        // 초기 상태
  | 'CONCERN_SELECT' // 고민 유형 선택
  | 'SUB_CONCERN_SELECT' // 세부 고민 선택
  | 'FORTUNE_RESULT'; // 결과 표시

export interface ChatMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  options?: string[]; // 선택 옵션이 있는 경우
} 