import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { compatibilityResultsTable, userProfilesTable } from "@/db/schema";

// 세션 ID 가져오기
async function getSessionId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("session_id")?.value || null;
  } catch (error) {
    console.error("세션 ID 가져오기 오류:", error);
    return null;
  }
}

// 사용자 프로필 확인 또는 생성
async function getUserProfileId(sessionId: string): Promise<string> {
  try {
    // 세션 ID로 사용자 프로필 조회
    const existingProfiles = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.id, sessionId));

    // 프로필이 이미 존재하는 경우 ID 반환
    if (existingProfiles.length > 0) {
      return existingProfiles[0].id;
    }

    // 프로필이 존재하지 않는 경우 임시 프로필 생성
    console.log("임시 사용자 프로필 생성:", sessionId);
    const result = await db
      .insert(userProfilesTable)
      .values({
        id: sessionId,
        name: `임시사용자_${sessionId.substring(0, 6)}`,
        // 필수 필드들 설정
        gender: "미지정",
        birthDate: new Date().toISOString().split("T")[0],
        calendarType: "양력",
      })
      .returning();

    return result[0].id;
  } catch (error) {
    console.error("사용자 프로필 처리 오류:", error);
    throw new Error(
      "사용자 프로필을 확인하거나 생성하는 중 오류가 발생했습니다."
    );
  }
}

// GET: 사용자의 모든 호환성 결과 조회
export async function GET(request: Request) {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // URL 쿼리 파라미터에서 resultType 가져오기
    const { searchParams } = new URL(request.url);
    const resultType = searchParams.get("type"); // "love" 또는 "friend" 또는 null (전체)

    let query = db
      .select()
      .from(compatibilityResultsTable)
      .where(eq(compatibilityResultsTable.userId, sessionId))
      .orderBy(desc(compatibilityResultsTable.createdAt));

    // resultType이 지정된 경우 추가 필터링
    if (resultType) {
      query = db
        .select()
        .from(compatibilityResultsTable)
        .where(
          and(
            eq(compatibilityResultsTable.userId, sessionId),
            eq(compatibilityResultsTable.resultType, resultType)
          )
        )
        .orderBy(desc(compatibilityResultsTable.createdAt));
    }

    const results = await query;

    return NextResponse.json(results);
  } catch (error) {
    console.error("결과 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "결과 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 새 호환성 결과 저장
export async function POST(request: Request) {
  try {
    let sessionId = await getSessionId();

    // 세션 ID가 없는 경우 임시 세션 생성
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      console.log("임시 세션 ID 생성:", sessionId);
    }

    const body = await request.json();
    console.log("요청 바디:", JSON.stringify(body, null, 2));

    const { resultType, person1, person2, resultData } = body;

    if (!resultType || !person1 || !person2 || !resultData) {
      console.error("필수 데이터 누락:", {
        resultType,
        person1,
        person2,
        resultData,
      });
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // resultData가 객체인지 확인하고 문자열인 경우 파싱
    let processedResultData = resultData;
    if (typeof resultData === "string") {
      try {
        processedResultData = JSON.parse(resultData);
      } catch (parseError) {
        console.error("resultData 파싱 오류:", parseError);
        return NextResponse.json(
          { error: "결과 데이터 형식이 올바르지 않습니다." },
          { status: 400 }
        );
      }
    }

    // 타입별 총점 계산
    let totalScore = 0;
    if (resultType === "love") {
      totalScore = processedResultData.score || 0;
    } else if (resultType === "friend") {
      totalScore = processedResultData.totalScore || 0;
    }

    try {
      // 사용자 프로필 ID 가져오기 (없으면 생성)
      const profileId = await getUserProfileId(sessionId);

      console.log("DB 삽입 시도:", {
        userId: profileId,
        resultType,
        person1Name: person1.name,
        totalScore,
      });

      const result = await db
        .insert(compatibilityResultsTable)
        .values({
          userId: profileId,
          resultType,
          person1Name: person1.name,
          person1Birthdate: person1.birthdate,
          person1Gender: person1.gender,
          person1Birthtime: person1.birthtime || null,
          person2Name: person2.name,
          person2Birthdate: person2.birthdate,
          person2Gender: person2.gender,
          person2Birthtime: person2.birthtime || null,
          resultData: processedResultData,
          totalScore,
        })
        .returning();

      // 쿠키에 세션 ID 설정 (클라이언트에 반환)
      const cookieStore = await cookies();
      cookieStore.set("session_id", profileId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30일
        httpOnly: true,
        sameSite: "lax",
      });

      console.log("저장 성공:", result[0]);
      return NextResponse.json(result[0]);
    } catch (error) {
      console.error("DB 작업 중 오류 발생:", error);
      throw error; // 상위 catch 블록으로 전달
    }
  } catch (error) {
    console.error("결과 저장 중 오류 발생:", error);

    // 상세 오류 정보 확인
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    return NextResponse.json(
      { error: "결과 저장 중 오류가 발생했습니다.", details: errorMessage },
      { status: 500 }
    );
  }
}
