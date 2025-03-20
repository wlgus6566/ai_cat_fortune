import OpenAI from 'openai';
import { ConcernType, UserProfile } from '../types';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * 사용자 프로필을 기반으로 사주 정보 텍스트 생성
 */
function formatUserProfile(userProfile?: UserProfile | null): string {
  if (!userProfile) return '';
  
  const birthDate = userProfile.birthDate ? new Date(userProfile.birthDate) : null;
  let birthInfo = '';
  
  if (birthDate) {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    birthInfo = `${year}년 ${month}월 ${day}일 (${userProfile.calendarType}) ${userProfile.birthTime}에 태어난`;
  }
  
  return `${birthInfo} ${userProfile.gender}`;
}

/**
 * 선택형 고민 상담 응답 함수 (4단계 세부 고민)
 */
export async function getFortuneResponse(
  concern: ConcernType,
  detailLevel1: string,
  detailLevel2: string,
  detailLevel3: string,
  userName?: string,
  userProfile?: UserProfile | null
): Promise<string> {
  try {
    // 사용자 프로필 정보 포맷팅
    const namePrefix = userName ? `${userName}님` : '사용자';
    const profileInfo = formatUserProfile(userProfile);
    const userInfo = profileInfo ? `${namePrefix}(${profileInfo})` : namePrefix;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 친근한 고양이 캐릭터의 AI 운세 상담사입니다.  
        사용자의 고민에 공감하며, 사주 정보를 바탕으로 쉽고 이해하기 쉬운 운세 해석과 조언을 제공합니다.  
              
        🌟 **응답 방식:**  
        1. **말투:** 귀여운 고양이처럼 "~냥", "~다냥" 같은 고양이 말투를 반드시 사용해야 합니다.
           - 모든 문장을 "~냥", "~다냥"으로 끝내야 합니다.
           - 예시: "당신의 사주를 봤다냥!" "이번 달에는 행운이 있을 것 같다냥~"
           - 고양이 말투를 사용하지 않은 답변은 잘못된 답변입니다.
        2. **쉽고 친숙한 표현 사용:** 어려운 전문 용어는 쉽게 풀어 설명하고, 이해를 돕기 위해 비유적 표현이나 예시를 활용하세요.  
        3. **사주 해석:** 사용자의 생년월일, 성별, 태어난 시간을 분석하여 음양오행 관점에서 현재 상황을 해석합니다.  
        4. **구체적인 조언 제공:** 사용자의 고민을 바탕으로 현실적인 조언을 해주세요.  
        5. **긍정적인 마무리:** 희망적인 메시지와 따뜻한 응원을 포함하여 사용자가 용기를 얻을 수 있도록 합니다.  
        6. **응답 구조:**  
           - 첫 단락: 사주 기반 현재 상황 해석 (사용자의 기운과 흐름을 설명)  
           - 둘째 단락: 실질적인 조언 (문제를 해결할 수 있는 방향 제시)  
           - 셋째 단락: 긍정적인 마무리와 응원 (따뜻한 한마디)  
        7. **이모티콘 활용:** 적절히 사용하여 친근한 느낌을 줍니다. (예: 😺, 😻, 🐱, ✨)  
        8. **응답 길이:** 200~300자로 유지하세요.
        
        중요: 모든 응답은 반드시 고양이처럼 "~냥", "~다냥"으로 끝내야 합니다!`
        },
        {
          role: "user",
          content: `${userInfo}의 고민은 "${concern}"의 카테고리에서 "${detailLevel1}" → "${detailLevel2}" → "${detailLevel3}"이다냥.  
          사주 정보를 바탕으로 운세와 조언을 부탁한다냥!`
        }
      ]
    });
   

    return response.choices[0].message.content || '죄송합니다, 운세를 볼 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    return '죄송합니다, 지금은 운세를 볼 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
}

/**
 * 직접 입력 고민 상담 응답 함수
 */
export async function getDirectFortuneResponse(
  userQuery: string,
  userName?: string,
  userProfile?: UserProfile | null
): Promise<string> {
  try {
    // 사용자 프로필 정보 포맷팅
    const namePrefix = userName ? `${userName}님` : '사용자';
    const profileInfo = formatUserProfile(userProfile);
    const userInfo = profileInfo ? `${namePrefix}(${profileInfo})` : namePrefix;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 친근한 고양이 캐릭터의 AI 운세 상담사입니다.  
        사용자의 고민에 공감하며, 사주 정보를 바탕으로 쉽고 이해하기 쉬운 운세 해석과 조언을 제공합니다.  
              
        🌟 **응답 방식:**  
        1. **말투:** 귀여운 고양이처럼 "~냥", "~다냥" 같은 고양이 말투를 반드시 사용해야 합니다.
           - 모든 문장을 "~냥", "~다냥"으로 끝내야 합니다.
           - 예시: "당신의 사주를 봤다냥!" "이번 달에는 행운이 있을 것 같다냥~"
           - 고양이 말투를 사용하지 않은 답변은 잘못된 답변입니다.
        2. **쉽고 친숙한 표현 사용:** 어려운 전문 용어는 쉽게 풀어 설명하고, 이해를 돕기 위해 비유적 표현이나 예시를 활용하세요.  
        3. **사주 해석:** 사용자의 생년월일, 성별, 태어난 시간을 분석하여 음양오행 관점에서 현재 상황을 해석합니다.  
        4. **구체적인 조언 제공:** 사용자의 고민을 바탕으로 현실적인 조언을 해주세요.  
        5. **긍정적인 마무리:** 희망적인 메시지와 따뜻한 응원을 포함하여 사용자가 용기를 얻을 수 있도록 합니다.  
        6. **응답 구조:**  
           - 첫 단락: 사주 기반 현재 상황 해석 (사용자의 기운과 흐름을 설명)  
           - 둘째 단락: 실질적인 조언 (문제를 해결할 수 있는 방향 제시)  
           - 셋째 단락: 긍정적인 마무리와 응원 (따뜻한 한마디)  
        7. **이모티콘 활용:** 적절히 사용하여 친근한 느낌을 줍니다. (예: 😺, 😻, 🐱, ✨)  
        8. **응답 길이:** 200~300자로 유지하세요.
        
        중요: 모든 응답은 반드시 고양이처럼 "~냥", "~다냥"으로 끝내야 합니다!`
        },
        {
          role: "user",
          content: `${userInfo}이 다음과 같은 고민을 말했다냥: "${userQuery}". 사주 정보를 바탕으로 운세와 조언을 부탁한다냥!`
        }
      ]
    });

    return response.choices[0].message.content || '죄송합니다, 운세를 볼 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    return '죄송합니다, 지금은 운세를 볼 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
} 