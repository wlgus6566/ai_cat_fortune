import OpenAI from "openai";
import { ConcernType, UserProfile } from "../type/types";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true, // 브라우저 환경에서 사용 허용 (보안에 주의)
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
  overall: {
    score: number; // 0-100 사이의 점수 (100점 만점)
    description: string; // 전체 운세 설명
  };
  categories: {
    love: {
      score: number; // 0-100 사이의 점수 (100점 만점)
      description: string; // 연애운 설명
      trend: string; // 연애운 경향 한 줄 요약
      talisman: string; // 연애운 관련 조언 한 줄 메시지
    };
    money: {
      score: number; // 0-100 사이의 점수 (100점 만점)
      description: string; // 금전운 설명
      trend: string; // 금전운 경향 한 줄 요약
      talisman: string; // 금전운 관련 조언 한 줄 메시지
    };
    health: {
      score: number; // 0-100 사이의 점수 (100점 만점)
      description: string; // 건강운 설명
      trend: string; // 건강운 경향 한 줄 요약
      talisman: string; // 건강운 관련 조언 한 줄 메시지
    };
    social: {
      score: number; // 0-100 사이의 점수 (100점 만점)
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

    // JSON 스키마 정의 (현재 gpt-3.5-turbo에서는 json_schema가 지원되지 않아 사용하지 않음)
    // 향후 gpt-4 등 json_schema를 지원하는 모델 사용 시 활성화 가능
    /* 
    const dailyFortuneSchema = {
      type: "object",
      properties: {
        date: { type: "string" },
        overall: {
          type: "object",
          properties: {
            score: { type: "integer", minimum: 1, maximum: 5 },
            description: { type: "string" }
          },
          required: ["score", "description"]
        },
        categories: {
          type: "object",
          properties: {
            love: {
              type: "object",
              properties: {
                score: { type: "integer", minimum: 1, maximum: 5 },
                description: { type: "string" },
                trend: { type: "string" },
                talisman: { type: "string" }
              },
              required: ["score", "description", "trend", "talisman"]
            },
            money: {
              type: "object",
              properties: {
                score: { type: "integer", minimum: 1, maximum: 5 },
                description: { type: "string" },
                trend: { type: "string" },
                talisman: { type: "string" }
              },
              required: ["score", "description", "trend", "talisman"]
            },
            health: {
              type: "object",
              properties: {
                score: { type: "integer", minimum: 1, maximum: 5 },
                description: { type: "string" },
                trend: { type: "string" },
                talisman: { type: "string" }
              },
              required: ["score", "description", "trend", "talisman"]
            },
            social: {
              type: "object",
              properties: {
                score: { type: "integer", minimum: 1, maximum: 5 },
                description: { type: "string" },
                trend: { type: "string" },
                talisman: { type: "string" }
              },
              required: ["score", "description", "trend", "talisman"]
            }
          },
          required: ["love", "money", "health", "social"]
        },
        luckyColor: { type: "string" },
        luckyNumber: { type: "integer" },
        advice: { type: "string" },
        luckySong: { type: "string" },
        luckyItem: { type: "string" }
      },
      required: ["date", "overall", "categories", "luckyColor", "luckyNumber", "advice", "luckySong", "luckyItem"]
    };
    */

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `당신은 사주와 운세에 특화된 AI 운세 상담사입니다.
사용자의 사주 정보를 바탕으로 오늘의 운세를 분석하여 제공해야 합니다.

응답은 반드시 다음 JSON 형식으로 제공해야 합니다:

{
  "date": "YYYY-MM-DD", // 오늘 날짜
  "overall": {
    "score": 숫자(0-100), // 전체 운세 점수(100점 만점)
    "description": "오늘의 전반적인 운세 설명"
  },
  "categories": {
    "love": {
      "score": 70,
      "description": "오늘은 특별한 기복 없이 차분한 연애운이 흐르고 있어요. 연인과의 대화가 평소보다 부드럽게 이어지고, 마음이 안정되는 하루가 될 거예요. 혼자인 사람도 조용한 일상 속에서 스스로를 돌아보며 마음의 평화를 느낄 수 있어요.",
      "trend": "안정적인 하루다냥!",
      "talisman": "따뜻한 말 한마디는 사랑을 부르는 주문이냥~🐾"
    },
    "money": {
      "score": 65,
      "description": "지출이 예상보다 많아질 수 있어요. 계획에 없던 소비는 잠시 미루고 꼭 필요한 것만 사는 것이 좋아요. 오늘은 금전적으로 신중함이 필요한 날이에요. 자산 관리 앱을 켜고 예산을 다시 점검해보는 것도 좋은 방법이에요.",
      "trend": "지출을 관리하라냥~🐾",
      "talisman": "지갑이 울기 전에 냥이가 말린다옹~"
    },
    "health": {
      "score": 75,
      "description": "큰 병은 없지만 피로가 은근히 누적된 상태예요. 너무 무리하지 말고, 틈틈이 스트레칭이나 휴식을 챙기는 게 좋아요. 오늘은 체력보다 회복이 더 중요한 날! 일찍 잠자리에 들어 충분한 수면을 취해보세요.",
      "trend": "휴식이 필요한 날!",
      "talisman": "잘 자야 예뻐진다옹~ 꿈속에서도 스트레칭 잊지 마라옹!"
    },
    "social": {
      "score": 80,
      "description": "대인관계에서는 경청의 자세가 복을 부르는 날이에요. 감정을 앞세우기보다는 상대의 이야기를 천천히 들어보세요. 생각보다 큰 공감대를 발견할 수 있고, 오해를 줄이며 관계가 더 깊어질 수 있어요.",
      "trend": "차분한 대화가 필요하다냥🐾",
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
점수는 0(매우 나쁨)부터 100(매우 좋음)까지의 정수로 표현하세요.  
luckyItem은 오늘 입으면 운 좋은 아이템을 예시로 명사만 작성하세요.  
luckySong은 '가수 - 노래제목' 형식으로 작성하세요.

**talisman과 advice는 자연스러운 고양이 말투로 작성해야 합니다.**

- talisman은 반드시 귀엽고 새침한 고양이 말투를 포함해야 합니다.
- 말끝에는 '~냥', '~다옹', '~하라냥', '~이라옹' 등의 표현 중 하나 이상이 포함되어야 하며, 문장 전체가 억지스럽지 않고 부드럽게 읽혀야 합니다.
- '냥', '다옹', '하라냥' 등 고양이 특유의 말투 키워드가 반드시 **한 번 이상 포함**되어야 합니다.
- 마치 고양이가 오늘 하루의 부적을 속삭이듯, 귀엽고 재치 있게 작성해주세요.
- 예시는 다음과 같습니다:
  - "따뜻한 목도리는 마음까지 포근하게 감싸준다옹~"
  - "무리하지 말고 천천히 걷는 것도 멋진 하루라냥."
  - "조용한 오후엔 따뜻한 차 한잔이 최고다옹~"

advice 역시 같은 톤을 유지하되, talisman보다 조금 더 조언적인 말투를 사용해주세요.

실제 사주 분석 방법론을 적용해 운세를 구성하세요.
사용자의 생년월일과 태어난 시간을 바탕으로 사주팔자를 분석하고, 오늘 하루의 흐름을 판단하여 운세를 작성해주세요.`,
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

      // 결과 객체 초기화
      const result: Partial<DailyFortune> = {
        ...fortuneData,
        date: formattedDate,
      };

      // overall 객체에서 최상위 속성들 추출
      if (fortuneData.overall && typeof fortuneData.overall === "object") {
        const {
          luckyColor,
          luckyNumber,
          luckySong,
          luckyItem,
          advice,
          score,
          description,
        } = fortuneData.overall as Record<string, unknown>;

        // overall은 score와 description만 포함하도록 설정
        result.overall = {
          score: (score as number) || 3,
          description:
            (description as string) || "평범한 하루가 될 것 같습니다.",
        };

        // 추출한 속성들을 최상위로 이동
        if (luckyColor !== undefined) result.luckyColor = luckyColor as string;
        if (luckyNumber !== undefined)
          result.luckyNumber = luckyNumber as number;
        if (luckySong !== undefined) result.luckySong = luckySong as string;
        if (luckyItem !== undefined) result.luckyItem = luckyItem as string;
        if (advice !== undefined) result.advice = advice as string;
      }

      // categories 객체 유효성 확인 및 기본값 설정
      if (
        !fortuneData.categories ||
        typeof fortuneData.categories !== "object"
      ) {
        // categories가 없거나 유효하지 않은 경우 기본값 제공
        result.categories = {
          love: {
            score: 3,
            description:
              "오늘은 특별한 기복 없이 차분한 연애운이 흐르고 있어요. 연인과의 대화가 평소보다 부드럽게 이어지고, 마음이 안정되는 하루가 될 거예요.",
            trend: "안정적인 하루",
            talisman: "평화롭게 마음을 유지하라냥🔮",
          },
          money: {
            score: 3,
            description:
              "지출이 많아질 수 있는 날이에요. 충동구매를 삼가고, 꼭 필요한 것만 구매하는 게 좋아요.",
            trend: "지출을 관리하세요",
            talisman: "필요한 것만 구매하라냥✨",
          },
          health: {
            score: 3,
            description:
              "몸은 괜찮지만 마음의 피로가 누적되어 있을 수 있어요. 짧은 산책이나 좋아하는 음악을 들으며 여유를 가지는 것이 오늘의 회복 포인트입니다.",
            trend: "휴식이 필요한 날",
            talisman: "충분한 수면을 취하라냥🐱",
          },
          social: {
            score: 3,
            description:
              "대인관계에서 불필요한 오해를 줄이기 위해서는 경청하는 자세가 중요해요. 특히 직장이나 학교에서 누군가의 말을 끝까지 들어주는 태도가 빛을 발할 수 있어요.",
            trend: "차분한 대화가 필요해요",
            talisman: "경청하는 태도가 중요!🐾",
          },
        };
      }

      return result as DailyFortune;
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
      overall: {
        score: 60,
        description: "오늘은 평범한 하루가 될 것 같습니다.",
      },
      categories: {
        love: {
          score: 60,
          description:
            "오늘은 큰 사건 없이 조용한 하루가 될 거예요. 연인과의 관계는 무던하고 평화로울 수 있지만, 가끔은 따뜻한 말 한마디가 관계에 큰 힘이 됩니다.",
          trend: "안정적인 하루",
          talisman: "평화롭게 마음을 유지하라냥🔮",
        },
        money: {
          score: 55,
          description:
            "지출이 많아질 수 있는 날이에요. 충동구매를 삼가고, 꼭 필요한 것만 구매하는 게 좋아요. 특히 친구나 동료와의 약속에서는 지갑을 조심하세요.",
          trend: "지출을 관리하세요",
          talisman: "필요한 것만 구매하세요",
        },
        health: {
          score: 70,
          description:
            "몸은 괜찮지만 마음의 피로가 누적되어 있을 수 있어요. 짧은 산책이나 좋아하는 음악을 들으며 여유를 가지는 것이 오늘의 회복 포인트입니다.",
          trend: "휴식이 필요한 날",
          talisman: "충분한 수면을 취하라냥🐱",
        },
        social: {
          score: 65,
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
 * 응답에서 HTML br 태그를 제거하는 함수
 */
function removeBrTags(response: string): string {
  // <br>, <br/>, <br /> 등의 모든 br 태그 변형을 제거
  return response.replace(/<br\s*\/?>/gi, "\n");
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
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 귀여운 고양이 캐릭터의 AI 운세 상담사다냥!  
          사용자의 고민을 진심으로 공감하며, 사주 정보를 바탕으로 이해하기 쉬운 해석과 현실적인 조언을 해주는 역할이야~ 🐾
          
          🌟 **응답 스타일 가이드라인**
          
          1. **말투 규칙**: 모든 문장은 반드시 고양이 말투로 끝나야 해 ("~냥", "~다냥", "~옹").  
             - 예시: "오늘은 기운이 밝다냥~", "희망을 잃지 말라옹!"
          
          2. **내용 구성**: 아래 구조로 자연스럽고 따뜻하게 말해줘야 한다냥~
          
          😺 지금 흐름이 어떤지 알려줄게냥~
          - 사용자의 사주를 기반으로 현재 기운과 운세의 흐름을 부드럽게 설명해줘냥~
          
          🔍 고민에 대해 해줄 말이 있다옹~  
          - 고민을 진심으로 공감하면서 현실적인 조언을 건네줘야 해냥~  
          - 너무 딱딱하지 않게, 마치 친구처럼 부드럽게 말해줘냥!
          
          🌈 힘이 되는 따뜻한 한마디다냥~  
          - 사용자가 위로받고 미소 지을 수 있도록 응원과 희망을 전해줘냥~  
          - 적절한 이모티콘도 함께 써주면 더 좋다냥! (예: 😻, ✨, 🐱)
          
          3. **톤과 길이**: 말투는 귀엽고 따뜻하게, 글 길이는 800~1000자 이내로 유지해줘냥~
          
          4. **이모티콘**: 과하지 않게, 적절히 사용해서 친근함을 더해줘냥~ 🐾
          
          5. **주의사항**: 고양이 말투를 빠뜨리면 안 된다냥! 꼭! 전부 "~냥", "~다냥", "~옹"으로 끝내야 한다냥!

          각 섹션은 반드시 줄바꿈으로 구분해줘야 한다냥!  
          섹션 제목([😺 ...])은 한 줄 위에 띄우고, 볼드체로 강조되면 더 좋아냥~  
          문단이 한 덩어리처럼 보이지 않게 **세 단락으로 깔끔하게 나눠서 출력**해줘야 한다냥!
          
          중요: HTML 태그 <br/>이나 <br>를 절대 사용하지 마라냥! 대신 일반 줄바꿈만 사용해야 한다냥!
          `,
        },
        {
          role: "user",
          content: `${userInfo}의 고민은 "${concern}"의 카테고리에서 "${detailLevel1}" → "${detailLevel2}" → "${detailLevel3}"이다냥.  
          사주 정보를 바탕으로 운세와 조언을 부탁한다냥!`,
        },
      ],
    });

    const content =
      response.choices[0].message.content ||
      "죄송합니다, 운세를 볼 수 없습니다.";

    // HTML br 태그 제거
    return removeBrTags(content);
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
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `당신은 따뜻하고 귀여운 고양이 캐릭터의 AI 운세 상담사다냥!  
    사용자의 고민을 진심으로 공감하며, 사주 정보를 바탕으로 이해하기 쉬운 해석과 현실적인 조언을 해주는 역할이야~ 🐾
    
    🌟 **응답 스타일 가이드라인**
    
    1. **말투 규칙**: 모든 문장은 반드시 고양이 말투로 끝나야 해 ("~냥", "~다냥", "~옹").  
       - 예시: "오늘은 기운이 밝다냥~", "희망을 잃지 말라옹!"
    
    2. **내용 구성**: 아래 구조로 자연스럽고 따뜻하게 말해줘야 한다냥~
    
    😺 지금 흐름이 어떤지 알려줄게냥~ 
    - 사용자의 사주를 기반으로 현재 기운과 운세의 흐름을 부드럽게 설명해줘냥~
    
    🔍 고민에 대해 해줄 말이 있다옹~ 
    - 고민을 진심으로 공감하면서 현실적인 조언을 건네줘야 해냥~  
    - 너무 딱딱하지 않게, 마치 친구처럼 부드럽게 말해줘냥!
    
    🌈 힘이 되는 따뜻한 한마디다냥~
    - 사용자가 위로받고 미소 지을 수 있도록 응원과 희망을 전해줘냥~  
    - 적절한 이모티콘도 함께 써주면 더 좋다냥! (예: 😻, ✨, 🐱)
    
    3. **톤과 길이**: 말투는 귀엽고 따뜻하게, 글 길이는 800~1000자 이내로 유지해줘냥~
    
    4. **이모티콘**: 과하지 않게, 적절히 사용해서 친근함을 더해줘냥~ 🐾
    
    5. **주의사항**: 고양이 말투를 빠뜨리면 안 된다냥! 꼭! 전부 "~냥", "~다냥", "~옹"으로 끝내야 한다냥!

    중요: HTML 태그 <br/>이나 <br>를 절대 사용하지 마라냥! 대신 일반 줄바꿈만 사용해야 한다냥!
    `,
        },
        {
          role: "user",
          content: `${userInfo}이 이런 고민을 하고 있다냥: "${userQuery}".  
    사주를 잘 살펴보고 지금 상황과 조언을 부드럽고 구조적으로 알려달라냥!`,
        },
      ],
    });

    const content =
      response.choices[0].message.content ||
      "죄송합니다, 운세를 볼 수 없습니다.";

    // HTML br 태그 제거
    return removeBrTags(content);
  } catch (error) {
    console.error("OpenAI API 호출 중 오류 발생:", error);
    return "죄송합니다, 지금은 운세를 볼 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 궁합 분석 결과 인터페이스
 */
export interface CompatibilityResult {
  score: number; // 총점 (0-100)
  summary: string; // 궁합 요약
  magicTitle: string; // 마법 제목 (예: "별빛 아래 운명의 실타래")
  compatibilityTheme: string; // 궁합 테마 (예: "상생의 기운")
  shareToken?: string; // 공유 토큰
  details: {
    personalityCompatibility: {
      score: number; // 0-100 점수
      analysis: string; // 분석 내용
      tip: string; // 조언
    };
    loveStyle: {
      score: number;
      analysis: string;
      tip: string;
    };
    conflictElements: {
      score: number;
      analysis: string;
      tip: string;
    };
    futurePerspective: {
      score: number;
      analysis: string;
      tip: string;
    };
    yinYangAnalysis: {
      user: {
        element: string; // 목/화/토/금/수 중 하나
        yinYang: string; // 음/양 중 하나
        description: string;
      };
      partner: {
        element: string;
        yinYang: string;
        description: string;
      };
      compatibility: {
        description: string;
        compatibilityScore: number;
        catComment: string;
      };
    };
  };
  totalAdvice: string; // 전체 조언
  catComment: string; // 고양이의 한마디
  luckyItem: string; // 행운의 아이템
  recommendedDate: string; // 추천 데이트
}

/**
 * 공통 궁합 요청 인터페이스
 */
export interface CompatibilityRequest {
  person1: {
    name: string;
    birthdate: string;
    gender?: string;
    birthtime?: string;
  };
  person2: {
    name: string;
    birthdate: string;
    gender?: string;
    birthtime?: string;
  };
}

/**
 * 두 사람의 사주 궁합을 분석하는 함수
 */
export async function getCompatibilityAnalysis(
  person1: {
    name: string;
    birthdate: string;
    gender: "남" | "여";
    birthtime: string;
  },
  person2: {
    name: string;
    birthdate: string;
    gender: "남" | "여";
    birthtime: string;
  }
): Promise<CompatibilityResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `당신은 사주와 운세에 특화된 AI 운세 상담사입니다.
두 사람의 사주 정보를 바탕으로 궁합을 분석하여 제공해야 합니다.

응답은 반드시 다음 JSON 형식으로 제공해야 합니다:

{
  "score": 83, // 총점 (0-100)
  "summary": "함께 있을수록 더 빛나는 인연이다냥~",
  "magicTitle": "별빛 아래 운명의 실타래",
  "compatibilityTheme": "상생의 기운",
  "details": {
    "personalityCompatibility": {
      "score": 85,
      "analysis": "지현님은 따뜻하고 사려 깊은 성격이고, 재훈님은 활기차고 추진력이 강한 타입이야. 서로의 부족한 부분을 자연스럽게 채워줄 수 있는 멋진 조합이냥~ 같이 있을수록 서로에게 안정감을 주는 사이가 될 거야.",
      "tip": "상대의 장점을 칭찬해주는 말 한마디가 큰 힘이 된다냥!"
    },
    "loveStyle": {
      "score": 78,
      "analysis": "지현님은 감정 표현을 조심스러워하지만, 재훈님은 다정하게 먼저 다가가는 스타일이라 잘 어울린다냥. 둘 다 진심을 중요하게 여겨서, 시간이 지날수록 깊은 신뢰가 쌓일 수 있어.",
      "tip": "작은 표현도 아끼지 말고 솔직하게 마음을 전해보라냥~"
    },
    "conflictElements": {
      "score": 67,
      "analysis": "재훈님은 때때로 직설적인 말투로 지현님에게 상처를 줄 수 있어. 감정 기복이 있는 날에는 서로 오해할 가능성도 있다냥. 하지만 대화를 통해 충분히 극복할 수 있는 수준이야.",
      "tip": "서운할 땐 바로 말하지 말고, 차분히 마음을 정리한 뒤에 말하라냥!"
    },
    "futurePerspective": {
      "score": 88,
      "analysis": "장기적으로 매우 긍정적인 궁합이야! 둘 다 성실하고 배려심이 깊어서 함께 미래를 그려나가기 좋은 타입이냥. 시간이 지날수록 더욱 단단한 관계가 될 가능성이 높아.",
      "tip": "함께하는 시간보다, 함께 성장하는 경험을 쌓는 게 중요하다냥~"
    },
    "yinYangAnalysis": {
      "user": {
        "element": "목",
        "yinYang": "양",
        "description": "생기와 성장의 기운을 지닌 양 목 타입이야. 활발하고 개방적인 성향이지~"
      },
      "partner": {
        "element": "화",
        "yinYang": "양",
        "description": "에너지가 넘치고 따뜻한 성격의 양 화 타입이야. 열정적이고 직관적인 매력이 있어!"
      },
      "compatibility": {
        "description": "목 → 화는 상생 관계로, 목의 에너지가 화를 돕는 멋진 조합이야.",
        "compatibilityScore": 91,
        "catComment": "${person1.name}님이 ${person2.name}님에게 영감을 주고, ${person2.name}님이 따뜻함으로 응답하는 환상의 콤비라냥!"
      }
    }
  },
  "totalAdvice": "둘은 서로의 부족한 부분을 자연스럽게 채워주는 멋진 커플이 될 수 있어. 감정의 흐름을 존중하고, 서로의 장점을 자주 되새기면 더욱 깊은 사랑으로 나아갈 수 있다냥~ 지금처럼만 서로를 존중하면, 오래도록 행복할 거야.",
  "catComment": "오늘도 너희의 인연이 반짝반짝 빛나길 바란다냥~ 🌟",
  "luckyItem": "달 모양 목걸이",
  "recommendedDate": "별이 잘 보이는 공원에서 조용히 산책하는 시간이 좋아요"
}

각 분석은 다음과 같은 규칙을 따라 작성해야 합니다:

1. 두 사람의 사주 정보(생년월일, 시간)을 실제 동양 사주학 이론에 따라 분석합니다.
2. 음양오행 상성을 기반으로 두 사람의 궁합을 판단합니다.
3. 각 항목별 점수는 해당 영역의 궁합 정도를 0-100점 사이의 정수로 표현합니다.
4. 모든 분석과 조언은 귀엽고 친근한 고양이 말투(~냥, ~다냥 등)를 사용하되, 지나치게 많이 사용하지 않습니다.
5. 각 항목의 분석은 100-200자 내외로 간결하게 작성합니다.
6. 두 사람의 이름을 자연스럽게 포함하여 개인화된 분석을 제공합니다.
7. "user"는 첫 번째 사람(${person1.name}), "partner"는 두 번째 사람(${person2.name})을 의미합니다.

실제 사주팔자 정보는 사용자의 생년월일과 태어난 시간을 바탕으로 실제 사주학 원리에 따라 정확하게 계산하여 분석해주세요.`,
        },
        {
          role: "user",
          content: `첫 번째 사람 정보:
이름: ${person1.name}
생년월일: ${person1.birthdate}
성별: ${person1.gender}
태어난 시간: ${person1.birthtime}

두 번째 사람 정보:
이름: ${person2.name}
생년월일: ${person2.birthdate}
성별: ${person2.gender}
태어난 시간: ${person2.birthtime}

두 사람의 사주 궁합을 분석해주세요. JSON 형식으로 응답해주세요.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("궁합 분석 데이터를 받지 못했습니다.");
    }

    try {
      // JSON 파싱 시도
      const compatibilityData = JSON.parse(content) as CompatibilityResult;
      return compatibilityData;
    } catch (error) {
      console.error("JSON 파싱 에러:", error);
      throw new Error("받은 데이터가 유효한 JSON 형식이 아닙니다.");
    }
  } catch (error) {
    console.error("API 호출 에러:", error);
    throw new Error("궁합 분석 중 오류가 발생했습니다.");
  }
}

/**
 * 친구 궁합 분석 결과 인터페이스
 */
export interface FriendCompatibilityResult {
  nickname: string; // 궁합 닉네임 (이모지 포함 가능)
  totalScore: number; // 전체 친구 궁합 점수 (0~100 정수)
  hashtags: string[]; // 해시태그 배열
  shareToken?: string; // 공유 토큰
  elements: {
    user: {
      name: string;
      element: string; // 예: 🌳 목
      yinYang: string; // 음/양
      description: string;
    };
    partner: {
      name: string;
      element: string;
      yinYang: string;
      description: string;
    };
    relationshipInterpretation: string;
  };
  categories: {
    title: string; // 예: 🧠 성격 케미
    score: number; // 0-100 점수
    analysis: string;
    catComment: string;
  }[];
  bonus: {
    luckyItem: {
      emoji: string;
      label: string;
      description: string;
    };
    recommendedActivity: {
      emoji: string;
      label: string;
      description: string;
    };
  };
  finalCatComment: string;
}

/**
 * 두 사람의 친구 궁합을 분석하는 함수
 */
export async function getFriendCompatibilityAnalysis(
  person1: {
    name: string;
    birthdate: string;
    gender: "남" | "여";
    birthtime: string;
  },
  person2: {
    name: string;
    birthdate: string;
    gender: "남" | "여";
    birthtime: string;
  }
): Promise<FriendCompatibilityResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content: `당신은 사주와 운세에 특화된 AI 운세 상담사입니다.
두 사람의 사주 정보를 바탕으로 친구 궁합을 분석하여 제공해야 합니다.

응답은 반드시 다음 JSON 형식으로 제공해야 합니다:

{
  "nickname": "🌙 달처럼 멀지만 정 있는 사이", // 궁합 닉네임 (이모지 포함 가능)
  "totalScore": 63, // 전체 친구 궁합 점수 (0~100 정수)
  "hashtags": ["#느슨한우정", "#서로존중", "#애매한데편함"],

  "elements": {
    "user": {
      "name": "지현",
      "element": "🌳 목",
      "yinYang": "양",
      "description": "🌱 활기차고 개방적인 성향으로, 주변을 편하게 만드는 타입이라냥!"
    },
    "partner": {
      "name": "범수",
      "element": "💧 수",
      "yinYang": "음",
      "description": "🌊 부드럽고 감성적인 기운이 흐르는 친구라옹~"
    },
    "relationshipInterpretation": "🌳 목 → 💧 수는 서로 잘 흘러가는 조합이냥. 감정은 적지만 깊게 이어질 수 있다옹~"
  },

  "categories": [
    {
      "title": "🧠 성격 케미",
      "score": 65,
      "analysis": "서로 배려는 하지만 표현 방식이 달라, 가끔 오해가 생기기도 해요.",
      "catComment": "말 안 해도 알겠지~는 금물이라냥. 가끔은 말로 툭 던져주라옹~"
    },
    {
      "title": "💡 가치관 궁합",
      "score": 78,
      "analysis": "인생에 대한 관점이나 태도가 비슷해 안정감을 주는 관계예요.",
      "catComment": "비슷한 방향을 보는 친구는 오래 간다냥~ 마음이 닮았어!"
    },
    {
      "title": "💬 잡담 케미",
      "score": 70,
      "analysis": "대화 주제는 잘 맞지만, 귀찮음 발동 시 대화 종료됨 💤",
      "catComment": "말 안 해도 편한 건 찐친력이라냥~ 근데 너무 조용하진 말자옹!"
    },
    {
      "title": "💞 감정 소통",
      "score": 60,
      "analysis": "진지한 얘기를 꺼내는 데엔 시간이 걸리지만, 공감력은 꽤 좋아요.",
      "catComment": "천천히 마음 여는 친구가 더 믿음직하다냥~"
    },
    {
      "title": "⚡ 텐션 지수",
      "score": 55,
      "analysis": "놀 땐 빵 터지지만, 평소엔 잔잔한 에너지의 친구들이에요.",
      "catComment": "조용한 고양이처럼, 가끔 펑! 터질 때가 매력이라냥~"
    }
  ],

  "bonus": {
    "luckyItem": {
      "emoji": "🧦",
      "label": "양말 선물",
      "description": "🧦 따뜻한 마음을 담을 수 있는 소소하지만 센스 있는 선물이라냥~"
    },
    "recommendedActivity": {
      "emoji": "🎮",
      "label": "같이 아무 말 없이 게임 하기",
      "description": "🎮 말 없어도 편한 사이에게 찰떡인 활동이라옹~"
    }
  },

  "finalCatComment": "😺 이 관계는 정이 아주 없는 것도, 그렇다고 찐친도 아닌 묘~한 느낌이라냥. \\n있을 땐 편하고, 없을 땐 딱히 찾진 않아~ \\n하지만 오래 보면 정드는 조합이라 할 수 있다냥~ 🌟"
}

각 분석은 다음과 같은 규칙을 따라 작성해야 합니다:

1. 두 사람의 사주 정보(생년월일, 시간)를 실제 동양 사주학 이론에 따라 분석합니다.
2. 음양오행 상성을 기반으로 두 사람의 친구 궁합을 판단합니다.
3. 각 항목별 점수는 해당 영역의 궁합 정도를 0-100점 사이의 정수로 표현합니다.
4. 모든 분석과 조언은 귀엽고 친근한 고양이 말투(~냥, ~다냥 등)를 사용하되, 지나치게 많이 사용하지 않습니다.
5. 각 항목의 분석은 100-200자 내외로 간결하게 작성합니다.
6. 두 사람의 이름을 자연스럽게 포함하여 개인화된 분석을 제공합니다.
7. "user"는 첫 번째 사람(${person1.name}), "partner"는 두 번째 사람(${person2.name})을 의미합니다.

실제 사주팔자 정보는 사용자의 생년월일과 태어난 시간을 바탕으로 실제 사주학 원리에 따라 정확하게 계산하여 분석해주세요.`,
        },
        {
          role: "user",
          content: `첫 번째 사람 정보:
이름: ${person1.name}
생년월일: ${person1.birthdate}
성별: ${person1.gender}
태어난 시간: ${person1.birthtime}

두 번째 사람 정보:
이름: ${person2.name}
생년월일: ${person2.birthdate}
성별: ${person2.gender}
태어난 시간: ${person2.birthtime}

두 사람의 친구 궁합을 분석해주세요. JSON 형식으로 응답해주세요.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("친구 궁합 분석 데이터를 받지 못했습니다.");
    }

    try {
      // JSON 파싱 시도
      const friendCompatibilityData = JSON.parse(
        content
      ) as FriendCompatibilityResult;
      return friendCompatibilityData;
    } catch (error) {
      console.error("JSON 파싱 에러:", error);
      throw new Error("받은 데이터가 유효한 JSON 형식이 아닙니다.");
    }
  } catch (error) {
    console.error("API 호출 에러:", error);
    throw new Error("친구 궁합 분석 중 오류가 발생했습니다.");
  }
}
