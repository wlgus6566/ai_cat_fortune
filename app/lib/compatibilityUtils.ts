import { loveCompatibilityPrompt } from "./compatibilityPrompts";
import OpenAI from "openai";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI 호환성 프롬프트 생성
export function createAiPrompt(data: {
  person1: PersonData;
  person2: PersonData;
}): { prompt: string; prompt2: string } {
  const { person1, person2 } = data;

  // 기본 프롬프트 사용
  const prompt = loveCompatibilityPrompt;

  // 사용자 데이터로 user 프롬프트 생성
  const prompt2 = `
사람 1:
이름: ${person1.name}
생년월일: ${person1.birthdate}
성별: ${person1.gender}
태어난 시간: ${person1.birthtime || "모름"}

사람 2:
이름: ${person2.name}
생년월일: ${person2.birthdate}
성별: ${person2.gender}
태어난 시간: ${person2.birthtime || "모름"}

위 두 사람의 궁합 분석을 해주세요.
`;

  return { prompt, prompt2 };
}

interface PersonData {
  name: string;
  birthdate: string;
  gender: "남" | "여";
  birthtime?: string;
}

// 데이터 검증 함수
export function validateUserData(data: {
  person1: PersonData;
  person2: PersonData;
}): string | null {
  const { person1, person2 } = data;

  // 필수 필드 확인
  if (!person1 || !person2) {
    return "두 사람의 정보가 필요합니다.";
  }

  if (!person1.name || !person2.name) {
    return "두 사람의 이름이 필요합니다.";
  }

  if (!person1.birthdate || !person2.birthdate) {
    return "두 사람의 생년월일이 필요합니다.";
  }

  if (!person1.gender || !person2.gender) {
    return "두 사람의 성별이 필요합니다.";
  }

  return null;
}

export async function handleCompatibilityRequest(
  data: { person1: PersonData; person2: PersonData },
  customPrompt?: string
) {
  try {
    // 데이터 검증
    const validationError = validateUserData(data);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    // AI 프롬프트 생성
    const { prompt, prompt2 } = createAiPrompt(data);

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: customPrompt || prompt },
        { role: "user", content: prompt2 },
      ],
      temperature: 0.7,
    });

    // AI 응답 파싱 및 반환
    const aiResponse = completion.choices[0].message.content;

    try {
      const parsedResponse = JSON.parse(aiResponse || "{}");
      return Response.json(parsedResponse);
    } catch (error) {
      console.error("AI 응답 파싱 오류:", error);
      return Response.json(
        { error: "AI 응답을 파싱할 수 없습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("호환성 API 오류:", error);
    return Response.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
