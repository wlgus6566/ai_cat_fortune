import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

// OpenAI 클라이언트 초기화 (서버에서만 실행)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// 공통 사용자 데이터 검증 로직
export function validateUserData(person1: any, person2: any) {
  if (
    !person1?.name ||
    !person2?.name ||
    !person1?.birthdate ||
    !person2?.birthdate
  ) {
    return {
      isValid: false,
      error: { error: "필수 정보가 누락되었습니다." },
    };
  }
  return { isValid: true };
}

// 공통 OpenAI API 호출 로직
export async function callCompatibilityAPI(
  systemPrompt: string,
  userData: { person1: any; person2: any }
) {
  const { person1, person2 } = userData;

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
          content: systemPrompt,
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

두 사람의 궁합을 분석해주세요. JSON 형식으로 응답해주세요.`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("궁합 분석 데이터를 받지 못했습니다.");
    }

    // JSON 파싱 시도
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("궁합 분석 중 오류가 발생했습니다.");
  }
}

// 공통 API 핸들러
export async function handleCompatibilityRequest(
  data: any,
  systemPrompt: string
) {
  try {
    const { person1, person2 } = data;

    // 데이터 검증
    const validation = validateUserData(person1, person2);
    if (!validation.isValid) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    // API 호출
    const compatibilityData = await callCompatibilityAPI(systemPrompt, {
      person1,
      person2,
    });

    return NextResponse.json(compatibilityData);
  } catch (error) {
    console.error("API 호출 에러:", error);
    const errorMsg =
      error instanceof Error
        ? error.message
        : "궁합 분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
