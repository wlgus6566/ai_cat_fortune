import { NextRequest } from "next/server";
import OpenAI from "openai";
import { createAiPrompt } from "@/app/lib/compatibilityUtils";

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API 라우트: 두 사람의 사주 궁합을 분석하는 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // AI 프롬프트 생성
    const { prompt, prompt2 } = createAiPrompt(body);

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
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
