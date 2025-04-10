import { NextRequest } from "next/server";
import { handleCompatibilityRequest } from "@/app/lib/compatibilityUtils";
import { friendCompatibilityPrompt } from "@/app/lib/compatibilityPrompts";

/**
 * API 라우트: 두 사람의 친구 궁합을 분석하는 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 검증
    const data = await request.json();

    // 필수 필드 확인
    if (!data.person1 || !data.person2) {
      return Response.json(
        { error: "person1과 person2 필드가 필요합니다." },
        { status: 400 }
      );
    }

    // 생년월일이 미래 날짜인지 확인
    const today = new Date();
    const person1BirthDate = new Date(data.person1.birthdate);
    const person2BirthDate = new Date(data.person2.birthdate);

    if (person1BirthDate > today || person2BirthDate > today) {
      console.warn("미래 날짜가 입력되었습니다:", {
        person1: data.person1.birthdate,
        person2: data.person2.birthdate,
      });
      // 미래 날짜 경고 추가 (하지만 처리는 계속 진행)
    }

    // 공백이나 유효하지 않은 이름 검증
    if (!data.person1.name?.trim() || !data.person2.name?.trim()) {
      return Response.json(
        { error: "유효한 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    console.log("친구 궁합 분석 요청:", {
      person1: {
        name: data.person1.name,
        birthdate: data.person1.birthdate,
        gender: data.person1.gender,
      },
      person2: {
        name: data.person2.name,
        birthdate: data.person2.birthdate,
        gender: data.person2.gender,
      },
    });

    // 궁합 분석 요청 처리
    return handleCompatibilityRequest(data, friendCompatibilityPrompt);
  } catch (error: unknown) {
    console.error("친구 궁합 API 오류:", error);
    return Response.json(
      {
        error: "요청 처리 중 오류가 발생했습니다.",
        message: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
