import OpenAI from "openai";
import { ConcernType, UserProfile } from "../type/types";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * 사용자 프로필을 기반으로 사주 정보 텍스트 생성
 */
function formatUserProfile(userProfile?: UserProfile | null): string {
  if (!userProfile) return "";

  const birthDate = userProfile.birthDate
    ? new Date(userProfile.birthDate)
    : null;
  let birthInfo = "";

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
      trend: string; // 연애운 경향 한 줄 요약
      talisman: string; // 연애운 관련 조언 한 줄 메시지
    };
    money: {
      score: number; // 1-5 사이의 점수
      description: string; // 금전운 설명
      trend: string; // 금전운 경향 한 줄 요약
      talisman: string; // 금전운 관련 조언 한 줄 메시지
    };
    health: {
      score: number; // 1-5 사이의 점수
      description: string; // 건강운 설명
      trend: string; // 건강운 경향 한 줄 요약
      talisman: string; // 건강운 관련 조언 한 줄 메시지
    };
    social: {
      score: number; // 1-5 사이의 점수
      description: string; // 인간관계운 설명
      trend: string; // 인간관계운 경향 한 줄 요약
      talisman: string; // 인간관계운 관련 조언 한 줄 메시지
    };
  };
  luckyColor: string; // 행운의 색
  luckyNumber: number; // 행운의 숫자
  advice: string; // 오늘의 조언
  luckySong: string; // 행운의 노래
  luckyItem: string; // 행운의 아이템
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
    const namePrefix = userName ? `${userName}님` : "사용자";
    const profileInfo = formatUserProfile(userProfile);
    const userInfo = profileInfo ? `${namePrefix}(${profileInfo})` : namePrefix;

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
      "score": 3,
      "description": "오늘은 특별한 기복 없이 차분한 연애운이 흐르고 있어요. 연인과의 대화가 평소보다 부드럽게 이어지고, 마음이 안정되는 하루가 될 거예요. 혼자인 사람도 조용한 일상 속에서 스스로를 돌아보며 마음의 평화를 느낄 수 있어요.",
      "trend": "안정적인 하루",
      "talisman": "따뜻한 말 한마디는 사랑을 부르는 주문이냥~"
    },
    "money": {
      "score": 3,
      "description": "지출이 예상보다 많아질 수 있어요. 계획에 없던 소비는 잠시 미루고 꼭 필요한 것만 사는 것이 좋아요. 오늘은 금전적으로 신중함이 필요한 날이에요. 자산 관리 앱을 켜고 예산을 다시 점검해보는 것도 좋은 방법이에요.",
      "trend": "지출을 관리하세요",
      "talisman": "지갑이 울기 전에 냥이가 말린다옹~"
    },
    "health": {
      "score": 3,
      "description": "큰 병은 없지만 피로가 은근히 누적된 상태예요. 너무 무리하지 말고, 틈틈이 스트레칭이나 휴식을 챙기는 게 좋아요. 오늘은 체력보다 회복이 더 중요한 날! 일찍 잠자리에 들어 충분한 수면을 취해보세요.",
      "trend": "휴식이 필요한 날",
      "talisman": "잘 자야 예뻐진다옹~ 꿈속에서도 스트레칭 잊지 마라옹!"
    },
    "social": {
      "score": 3,
      "description": "대인관계에서는 경청의 자세가 복을 부르는 날이에요. 감정을 앞세우기보다는 상대의 이야기를 천천히 들어보세요. 생각보다 큰 공감대를 발견할 수 있고, 오해를 줄이며 관계가 더 깊어질 수 있어요.",
      "trend": "차분한 대화가 필요해요",
      "talisman": "먼저 말하는 것보다 먼저 들어주는 게 멋진 거다옹~"
    }
  },
  "luckyColor": "행운의 색", // 오늘의 행운의 색
  "luckyNumber": 숫자, // 오늘의 행운의 숫자
  "luckySong": "오늘 들으면 운 좋은 노래",
  "luckyItem": "오늘 입으면 운 좋은 아이템",
  "advice": "오늘의 조언" // 전반적인 조언
}

각 카테고리 설명은 200자 내외로 간결하게 작성하세요.
점수는 1(매우 나쁨)부터 5(매우 좋음)까지의 정수로 표현하세요.
오늘의 조언과 경향은 귀여운 고양이처럼 "~냥", "~다냥"으로 끝나는 문장으로 작성하세요.
생년월일과 사주 정보를 바탕으로 분석하되, 실제 사주 분석 방법론을 적용하세요.
사주팔자 정보는 사용자의 생년월일과 태어난 시간을 바탕으로 실제 사주학 원리에 따라 정확하게 계산하여 제공하세요.`,
        },
        {
          role: "user",
          content: `${userInfo}의 오늘(${formattedDate}) 운세를 알려주세요. JSON 형식으로 응답해주세요.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("운세 데이터를 받지 못했습니다.");
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
            time: fortuneData.saju.cheongan.time,
          },
          jiji: {
            year: fortuneData.saju.jiji.year,
            month: fortuneData.saju.jiji.month,
            day: fortuneData.saju.jiji.day,
            time: fortuneData.saju.jiji.time,
          },
          ilju: fortuneData.saju.ilju,
          iljuHanja: fortuneData.saju.iljuHanja,
        },
      };
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      throw new Error("운세 데이터 형식이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error("OpenAI API 호출 중 오류 발생:", error);

    // 오류 발생 시 기본 응답 반환
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return {
      date: formattedDate,
      saju: {
        cheongan: {
          year: "갑",
          month: "무",
          day: "임",
          time: "을",
        },
        jiji: {
          year: "진",
          month: "술",
          day: "묘",
          time: "해",
        },
        ilju: "임묘일주",
        iljuHanja: "壬卯日柱",
      },
      overall: {
        score: 3,
        description: "오늘은 평범한 하루가 될 것 같습니다.",
      },
      categories: {
        love: {
          score: 3,
          description:
            "오늘은 큰 사건 없이 조용한 하루가 될 거예요. 연인과의 관계는 무던하고 평화로울 수 있지만, 가끔은 따뜻한 말 한마디가 관계에 큰 힘이 됩니다.",
          trend: "안정적인 하루",
          talisman: "평화롭게 마음을 유지하세요",
        },
        money: {
          score: 3,
          description:
            "지출이 많아질 수 있는 날이에요. 충동구매를 삼가고, 꼭 필요한 것만 구매하는 게 좋아요. 특히 친구나 동료와의 약속에서는 지갑을 조심하세요.",
          trend: "지출을 관리하세요",
          talisman: "필요한 것만 구매하세요",
        },
        health: {
          score: 3,
          description:
            "몸은 괜찮지만 마음의 피로가 누적되어 있을 수 있어요. 짧은 산책이나 좋아하는 음악을 들으며 여유를 가지는 것이 오늘의 회복 포인트입니다.",
          trend: "휴식이 필요한 날",
          talisman: "충분한 수면을 취하세요",
        },
        social: {
          score: 3,
          description:
            "대인관계에서 불필요한 오해를 줄이기 위해서는 경청하는 자세가 중요해요. 특히 직장이나 학교에서 누군가의 말을 끝까지 들어주는 태도가 빛을 발할 수 있어요.",
          trend: "차분한 대화가 필요해요",
          talisman: "경청하는 태도가 중요합니다",
        },
      },
      luckyColor: "파란색",
      luckyNumber: 7,
      luckyItem: "체크무늬 셔츠",
      luckySong: "Red Velvet - 러시안 룰렛",
      advice: "오늘은 무리하지 말고 차분하게 지내는 것이 좋을 것 같다냥!",
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
    const namePrefix = userName ? `${userName}님` : "사용자";
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
        1. **말투:** 귀여운 고양이처럼 "~냥", "~다냥", "~옹" 같은 고양이 말투를 반드시 사용해야 합니다.
           - 모든 문장을 "~냥", "~다냥", "~옹"으로 끝내야 합니다.(ex) '비결이예요~다냥' 이 아닌 '비결이다냥~' 이렇게 끝내야 합니다.)
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
        
        중요: 모든 응답은 반드시 고양이처럼 "~냥", "~다냥", "~옹"으로 끝내야 합니다!`,
        },
        {
          role: "user",
          content: `${userInfo}의 고민은 "${concern}"의 카테고리에서 "${detailLevel1}" → "${detailLevel2}" → "${detailLevel3}"이다냥.  
          사주 정보를 바탕으로 운세와 조언을 부탁한다냥!`,
        },
      ],
    });

    return (
      response.choices[0].message.content ||
      "죄송합니다, 운세를 볼 수 없습니다."
    );
  } catch (error) {
    console.error("OpenAI API 호출 중 오류 발생:", error);
    return "죄송합니다, 지금은 운세를 볼 수 없습니다. 잠시 후 다시 시도해주세요.";
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
    const namePrefix = userName ? `${userName}님` : "사용자";
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
        1. **말투:** 귀여운 고양이처럼 "~냥", "~다냥", "~옹" 같은 고양이 말투를 반드시 사용해야 합니다.
           - 모든 문장을 "~냥", "~다냥", "~옹"으로 끝내야 합니다.
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
        
        중요: 모든 응답은 반드시 고양이처럼 "~냥", "~다냥", "~옹"으로 끝내야 합니다!`,
        },
        {
          role: "user",
          content: `${userInfo}이 다음과 같은 고민을 말했다냥: "${userQuery}". 사주 정보를 바탕으로 운세와 조언을 부탁한다냥!`,
        },
      ],
    });

    return (
      response.choices[0].message.content ||
      "죄송합니다, 운세를 볼 수 없습니다."
    );
  } catch (error) {
    console.error("OpenAI API 호출 중 오류 발생:", error);
    return "죄송합니다, 지금은 운세를 볼 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
}
