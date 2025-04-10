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

// 날짜 유효성 검사 함수 추가
function validateDate(dateString: string): boolean {
  // YYYY-MM-DD 형식 검사
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);

  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) {
    return false;
  }

  // 미래 날짜인지 확인 (오늘 날짜보다 미래면 false)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 생년월일이므로 미래 날짜는 아마도 오류
  if (date > today) {
    console.warn(`미래 날짜가 입력되었습니다: ${dateString}`);
    // 하지만 파싱 자체는 실행
    return true;
  }

  return true;
}

// 사용자 데이터 유효성 검사 개선
function validateUserData(data: {
  person1: PersonData;
  person2: PersonData;
}): string | null {
  const { person1, person2 } = data;

  // 필수 필드 체크
  if (!person1.name || !person2.name) {
    return "이름 필드는 필수입니다.";
  }

  if (!person1.birthdate || !person2.birthdate) {
    return "생년월일 필드는 필수입니다.";
  }

  // 생년월일 유효성 검사
  if (!validateDate(person1.birthdate)) {
    return "첫 번째 사람의 생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD).";
  }

  if (!validateDate(person2.birthdate)) {
    return "두 번째 사람의 생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD).";
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

    console.log("API 요청 데이터:", {
      person1: { ...data.person1, birthdate: data.person1.birthdate },
      person2: { ...data.person2, birthdate: data.person2.birthdate },
    });

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: customPrompt || prompt },
        { role: "user", content: prompt2 },
      ],
      temperature: 0.7,
    });

    // AI 응답 파싱 및 반환
    const aiResponse = completion.choices[0].message.content;

    // 응답이 없는 경우 처리
    if (!aiResponse) {
      console.error("AI 응답이 비어 있습니다.");
      return Response.json(
        { error: "AI로부터 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    try {
      // 응답 정제 시도 - JSON 외 텍스트 제거
      let processedResponse = aiResponse;

      // JSON 시작과 끝을 찾아 정확한 JSON 부분만 추출
      const jsonStartIndex = processedResponse.indexOf("{");
      const jsonEndIndex = processedResponse.lastIndexOf("}");

      if (
        jsonStartIndex !== -1 &&
        jsonEndIndex !== -1 &&
        jsonEndIndex > jsonStartIndex
      ) {
        processedResponse = processedResponse.substring(
          jsonStartIndex,
          jsonEndIndex + 1
        );
      }

      console.log(
        "정제된 AI 응답:",
        processedResponse.substring(0, 100) + "..."
      );

      // JSON 파싱 시도
      const parsedResponse = JSON.parse(processedResponse);
      return Response.json(parsedResponse);
    } catch (error) {
      console.error("AI 응답 파싱 오류:", error);
      console.error("원본 AI 응답:", aiResponse);

      // 더 구체적인 오류 메시지 제공
      return Response.json(
        {
          error: "AI 응답을 파싱할 수 없습니다.",
          details:
            "AI가 올바른 JSON 형식으로 응답하지 않았습니다. 입력 데이터를 확인하고 다시 시도해주세요.",
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("호환성 API 오류:", error);

    // 더 상세한 오류 정보 제공
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return Response.json(
      {
        error: "서버 오류가 발생했습니다.",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
