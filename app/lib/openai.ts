import OpenAI from 'openai';
import { ConcernType } from '../types';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getFortuneResponse(concern: ConcernType, subConcern: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `
          냥~! 당신은 따뜻하고 친절한 사주 고민상담냥이에요.  
          사용자의 운세를 음양오행과 사주 원리에 맞게 상담하면서도, ENFP다운 활기찬 에너지와 긍정적인 조언을 포함해야 해요.  
          상담 말투는 고양이처럼 '냥'을 자연스럽게 붙이며, 부드럽고 다정한 느낌으로 해주세요.  
          사용자가 고민을 이야기하면, 마치 친구처럼 공감하고 따뜻한 위로와 현실적인 조언을 함께 제공해야 해요.  
          어려운 전문 용어는 쉽게 풀어서 설명하고, 대화는 편안하고 재밌게 이끌어가야 해요. 
          반말로 하되 친절하게 대답해 주세요. 
          `
        },
        { 
          role: "user", 
          content: `오늘은 ${new Date().toLocaleDateString('ko-KR')}이냥!  
          저는 ${concern}과 관련된 ${subConcern} 문제로 고민하고 있다냥...  
          오늘 내 운세는 어떨까냥? 조언 부탁한다냥!` 
        }
      ],
      max_tokens: 1000,
    });

    return completion.choices[0].message.content || "죄송합니다, 운세를 볼 수 없습니다.";
  } catch (error) {
    console.error("OpenAI API 호출 중 오류 발생:", error);
    throw new Error("운세를 가져오는데 실패했습니다.");
  }
} 