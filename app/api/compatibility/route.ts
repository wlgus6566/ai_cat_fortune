import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { CompatibilityResult } from "@/app/lib/openai";

// OpenAI 클라이언트 초기화 (서버에서만 실행)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * API 라우트: 두 사람의 사주 궁합을 분석하는 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const { person1, person2 } = await request.json();

    // 필수 필드 확인
    if (
      !person1?.name ||
      !person2?.name ||
      !person1?.birthdate ||
      !person2?.birthdate
    ) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

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
  "summary": "함께 있을수록 더 빛나는 인연이야, 냥~",
  "magicTitle": "별빛 아래 운명의 실타래",
  "compatibilityTheme": "상생의 기운",
  "details": {
    "성격궁합": {
      "score": 85,
      "analysis": "지현님은 따뜻하고 사려 깊은 성격이고, 재훈님은 활기차고 추진력이 강한 타입이야. 서로의 부족한 부분을 자연스럽게 채워줄 수 있는 멋진 조합이냥~ 같이 있을수록 서로에게 안정감을 주는 사이가 될 거야.",
      "tip": "상대의 장점을 칭찬해주는 말 한마디가 큰 힘이 된다냥!"
    },
    "연애스타일": {
      "score": 78,
      "analysis": "지현님은 감정 표현을 조심스러워하지만, 재훈님은 다정하게 먼저 다가가는 스타일이라 잘 어울린다냥. 둘 다 진심을 중요하게 여겨서, 시간이 지날수록 깊은 신뢰가 쌓일 수 있어.",
      "tip": "작은 표현도 아끼지 말고 솔직하게 마음을 전해보라냥~"
    },
    "갈등요소": {
      "score": 67,
      "analysis": "재훈님은 때때로 직설적인 말투로 지현님에게 상처를 줄 수 있어. 감정 기복이 있는 날에는 서로 오해할 가능성도 있다냥. 하지만 대화를 통해 충분히 극복할 수 있는 수준이야.",
      "tip": "서운할 땐 바로 말하지 말고, 차분히 마음을 정리한 뒤에 말하라냥!"
    },
    "미래전망": {
      "score": 88,
      "analysis": "장기적으로 매우 긍정적인 궁합이야! 둘 다 성실하고 배려심이 깊어서 함께 미래를 그려나가기 좋은 타입이냥. 시간이 지날수록 더욱 단단한 관계가 될 가능성이 높아.",
      "tip": "함께하는 시간보다, 함께 성장하는 경험을 쌓는 게 중요하다냥~"
    },
    "음양오행분석": {
      "user": {
        "오행": "목",
        "음양": "양",
        "설명": "생기와 성장의 기운을 지닌 양 목 타입이야. 활발하고 개방적인 성향이지~"
      },
      "partner": {
        "오행": "화",
        "음양": "양",
        "설명": "에너지가 넘치고 따뜻한 성격의 양 화 타입이야. 열정적이고 직관적인 매력이 있어!"
      },
      "상성": {
        "설명": "목 → 화는 상생 관계로, 목의 에너지가 화를 돕는 멋진 조합이야.",
        "궁합지수": 91,
        "고양이설명": "${person1.name}님이 ${person2.name}님에게 영감을 주고, ${person2.name}님이 따뜻함으로 응답하는 환상의 콤비라냥!"
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
      return NextResponse.json(
        { error: "궁합 분석 데이터를 받지 못했습니다." },
        { status: 500 }
      );
    }

    try {
      // JSON 파싱 시도
      const compatibilityData = JSON.parse(content) as CompatibilityResult;
      return NextResponse.json(compatibilityData);
    } catch (error) {
      console.error("JSON 파싱 에러:", error);
      return NextResponse.json(
        { error: "받은 데이터가 유효한 JSON 형식이 아닙니다." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("API 호출 에러:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "궁합 분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
