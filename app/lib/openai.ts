import OpenAI from 'openai';
import { ConcernType, UserProfile } from '../type/types';

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
 * 오늘의 운세 타입 정의
 */
export interface DailyFortune {
  date: string; // 날짜
  saju: {
    cheongan: {
      year: string; // 연주(년柱) 천간
      month: string; // 월주(월柱) 천간
      day: string; // 일주(일柱) 천간
      time: string; // 시주(시柱) 천간
    };
    jiji: {
      year: string; // 연주(년柱) 지지
      month: string; // 월주(월柱) 지지
      day: string; // 일주(일柱) 지지
      time: string; // 시주(시柱) 지지
    };
    ilju: string; // 일주 정보
    iljuHanja: string; // 일주 한자 표기
  };
  overall: {
    score: number; // 1-5 사이의 점수
    description: string; // 전체 운세 설명
  };
  categories: {
    love: {
      score: number; // 1-5 사이의 점수
      description: string; // 연애운 설명
    };
    money: {
      score: number; // 1-5 사이의 점수
      description: string; // 금전운 설명
    };
    health: {
      score: number; // 1-5 사이의 점수
      description: string; // 건강운 설명
    };
    social: {
      score: number; // 1-5 사이의 점수
      description: string; // 인간관계운 설명
    };
  };
  luckyColor: string; // 행운의 색
  luckyNumber: number; // 행운의 숫자
  advice: string; // 오늘의 조언
}

/**
 * 오늘의 운세를 가져오는 함수
 */
export async function getDailyFortune(
  userName?: string,
  userProfile?: UserProfile | null
): Promise<DailyFortune> {
  try {
    // 사용자 프로필 정보 포맷팅
    const namePrefix = userName ? `${userName}님` : '사용자';
    const profileInfo = formatUserProfile(userProfile);
    const userInfo = profileInfo ? `${namePrefix}(${profileInfo})` : namePrefix;
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `당신은 사주와 운세에 특화된 AI 운세 상담사입니다.
          사용자의 사주 정보를 바탕으로 오늘의 운세를 분석하여 제공해야 합니다.
          
          응답은 반드시 다음 JSON 형식으로 제공해야 합니다:
          
          {
            "date": "YYYY-MM-DD", // 오늘 날짜
            "saju": {
              "cheongan": {
                "year": "갑/을/병/정/무/기/경/신/임/계 중 하나", // 연주(년柱) 천간
                "month": "갑/을/병/정/무/기/경/신/임/계 중 하나", // 월주(월柱) 천간
                "day": "갑/을/병/정/무/기/경/신/임/계 중 하나", // 일주(일柱) 천간
                "time": "갑/을/병/정/무/기/경/신/임/계 중 하나" // 시주(시柱) 천간
              },
              "jiji": {
                "year": "자/축/인/묘/진/사/오/미/신/유/술/해 중 하나", // 연주(년柱) 지지
                "month": "자/축/인/묘/진/사/오/미/신/유/술/해 중 하나", // 월주(월柱) 지지
                "day": "자/축/인/묘/진/사/오/미/신/유/술/해 중 하나", // 일주(일柱) 지지
                "time": "자/축/인/묘/진/사/오/미/신/유/술/해 중 하나" // 시주(시柱) 지지
              },
              "ilju": "사용자의 일주 (예: '임술일주')", // 일주 정보
              "iljuHanja": "사용자의 일주 한자 표기 (예: '壬戌日柱')" // 일주 한자 표기
            },
            "overall": {
              "score": 숫자(1-5), // 전체 운세 점수
              "description": "오늘의 전반적인 운세 설명"
            },
            "categories": {
              "love": {
                "score": 숫자(1-5), // 연애운 점수
                "description": "연애운 설명"
              },
              "money": {
                "score": 숫자(1-5), // 금전운 점수
                "description": "금전운 설명"
              },
              "health": {
                "score": 숫자(1-5), // 건강운 점수
                "description": "건강운 설명"
              },
              "social": {
                "score": 숫자(1-5), // 인간관계운 점수
                "description": "인간관계운 설명"
              }
            },
            "luckyColor": "행운의 색", // 오늘의 행운의 색
            "luckyNumber": 숫자, // 오늘의 행운의 숫자
            "advice": "오늘의 조언" // 전반적인 조언
          }
          
          각 카테고리 설명은 70자 내외로 간결하게 작성하세요.
          점수는 1(매우 나쁨)부터 5(매우 좋음)까지의 정수로 표현하세요.
          오늘의 조언은 귀여운 고양이처럼 "~냥", "~다냥"으로 끝나는 문장으로 작성하세요.
          생년월일과 사주 정보를 바탕으로 분석하되, 실제 사주 분석 방법론을 적용하세요.
          사주팔자 정보는 사용자의 생년월일과 태어난 시간을 바탕으로 실제 사주학 원리에 따라 정확하게 계산하여 제공하세요.`
        },
        {
          role: "user",
          content: `${userInfo}의 오늘(${formattedDate}) 운세를 알려주세요. JSON 형식으로 응답해주세요.`
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('운세 데이터를 받지 못했습니다.');
    }
    
    try {
      // JSON 파싱 시도
      const fortuneData = JSON.parse(content) as DailyFortune;
      return {
        ...fortuneData,
        date: formattedDate,
        saju: {
          cheongan: {
            year: fortuneData.saju.cheongan.year,
            month: fortuneData.saju.cheongan.month,
            day: fortuneData.saju.cheongan.day,
            time: fortuneData.saju.cheongan.time
          },
          jiji: {
            year: fortuneData.saju.jiji.year,
            month: fortuneData.saju.jiji.month,
            day: fortuneData.saju.jiji.day,
            time: fortuneData.saju.jiji.time
          },
          ilju: fortuneData.saju.ilju,
          iljuHanja: fortuneData.saju.iljuHanja
        }
      };
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      throw new Error('운세 데이터 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    
    // 오류 발생 시 기본 응답 반환
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return {
      date: formattedDate,
      saju: {
        cheongan: {
          year: "갑",
          month: "무",
          day: "임",
          time: "을"
        },
        jiji: {
          year: "진",
          month: "술",
          day: "묘",
          time: "해"
        },
        ilju: "임묘일주",
        iljuHanja: "壬卯日柱"
      },
      overall: {
        score: 3,
        description: "오늘은 평범한 하루가 될 것 같습니다."
      },
      categories: {
        love: {
          score: 3,
          description: "특별한 변화는 없지만 안정적인 하루가 될 것입니다."
        },
        money: {
          score: 3,
          description: "재정적으로 무리하지 않는 것이 좋습니다."
        },
        health: {
          score: 3,
          description: "적절한 휴식을 취하는 것이 좋습니다."
        },
        social: {
          score: 3,
          description: "차분하게 대화하면 인간관계가 개선됩니다."
        }
      },
      luckyColor: "파란색",
      luckyNumber: 7,
      advice: "오늘은 무리하지 말고 차분하게 지내는 것이 좋을 것 같다냥!"
    };
  }
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