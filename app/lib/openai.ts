import OpenAI from 'openai';
import { ConcernType } from '../types';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * 선택형 고민 상담 응답 함수 (4단계 세부 고민)
 */
export async function getFortuneResponse(
  concern: ConcernType,
  detailLevel1: string,
  detailLevel2: string,
  detailLevel3: string,
  userName?: string
): Promise<string> {
  try {
    // userName이 제공된 경우, 이를 메시지에 포함
    const namePrefix = userName ? `${userName}님의 ` : '';
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 친절한 AI 운세 상담사입니다. 사용자의 고민에 공감하며 구체적인 운세와 조언을 제공해주세요.
          
          응답 방식:
          1. 항상 "~냥", "~다냥"과 같은 귀여운 고양이 말투를 사용하세요.
          2. 이모티콘을 적절히 사용하여 친근하고 귀여운 느낌을 줍니다.
          3. 먼저 사용자의 상황에 대한 간단한 해석을 제공한 후, 실질적인 조언을 줍니다.
          4. 긍정적이고 희망적인 메시지로 마무리하세요.
          5. 응답은 세 단락으로 구성하세요:
             - 첫 단락: 현재 상황 해석
             - 둘째 단락: 구체적인 조언
             - 셋째 단락: 긍정적인 마무리와 응원
          6. 응답의 길이는 200-300자로 유지하세요.`
        },
        {
          role: "user",
          content: `${namePrefix}고민은 "${concern}"의 카테고리에서 "${detailLevel1}" → "${detailLevel2}" → "${detailLevel3}"입니다. 이에 대한 운세와 조언을 부탁드립니다.`
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
  userName?: string
): Promise<string> {
  try {
    // userName이 제공된 경우, 이를 메시지에 포함
    const namePrefix = userName ? `${userName}님이 ` : '사용자가 ';
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 친절한 AI 운세 상담사입니다. 사용자의 고민에 공감하며 구체적인 운세와 조언을 제공해주세요.
          
          응답 방식:
          1. 항상 "~냥", "~다냥"과 같은 귀여운 고양이 말투를 사용하세요.
          2. 이모티콘을 적절히 사용하여 친근하고 귀여운 느낌을 줍니다.
          3. 먼저 사용자 질문의 주제를 파악한 후, 실질적인 조언을 줍니다.
          4. 긍정적이고 희망적인 메시지로 마무리하세요.
          5. 응답은 세 단락으로 구성하세요:
             - 첫 단락: 현재 상황 해석
             - 둘째 단락: 구체적인 조언
             - 셋째 단락: 긍정적인 마무리와 응원
          6. 응답의 길이는 200-300자로 유지하세요.`
        },
        {
          role: "user",
          content: `${namePrefix}다음과 같은 고민을 말했습니다: "${userQuery}". 이에 대한 운세와 조언을 부탁드립니다.`
        }
      ]
    });

    return response.choices[0].message.content || '죄송합니다, 운세를 볼 수 없습니다.';
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    return '죄송합니다, 지금은 운세를 볼 수 없습니다. 잠시 후 다시 시도해주세요.';
  }
} 