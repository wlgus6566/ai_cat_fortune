import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { FriendCompatibilityResult } from "@/app/lib/openai";

// OpenAI 클라이언트 초기화 (서버에서만 실행)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * API 라우트: 두 사람의 친구 궁합을 분석하는 엔드포인트
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
      return NextResponse.json(
        { error: "친구 궁합 분석 데이터를 받지 못했습니다." },
        { status: 500 }
      );
    }

    try {
      // JSON 파싱 시도
      const friendCompatibilityData = JSON.parse(
        content
      ) as FriendCompatibilityResult;
      return NextResponse.json(friendCompatibilityData);
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
        : "친구 궁합 분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
