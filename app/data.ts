import { ConcernType, SubConcernType } from './types';

export const CONCERN_TYPES: ConcernType[] = ['연애', '학업', '취업', '건강', '재물'];

export const SUB_CONCERNS: SubConcernType = {
  '연애': ['짝사랑', '이별', '다툼', '결혼', '재회'],
  '학업': ['시험', '성적', '진로', '대학입시', '자격증'],
  '취업': ['면접', '이직', '창업', '퇴사', '승진'],
  '건강': ['다이어트', '만성질환', '수술', '정신건강', '생활습관'],
  '재물': ['투자', '저축', '부동산', '부채', '복권']
}; 