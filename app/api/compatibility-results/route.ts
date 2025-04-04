import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

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
    // Next-Auth 세션 확인
    const authSession = await getServerSession(authOptions);
    const sessionId = await getSessionId();

    // 쿠키 세션 또는 Next-Auth 세션 둘 중 하나라도 없으면 인증 실패
    if (!sessionId && !authSession?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    // 사용할 사용자 ID 결정 (Next-Auth 우선)
    const userId = authSession?.user?.id || sessionId;

    // URL 쿼리 파라미터에서 resultType 가져오기
    const { searchParams } = new URL(request.url);
    const resultType = searchParams?.get("type"); // "love" 또는 "friend" 또는 null (전체)

    let query = db
      .select()
      .from(compatibilityResultsTable)
      .where(eq(compatibilityResultsTable.userId, userId as string))
      .orderBy(desc(compatibilityResultsTable.createdAt));

    // resultType이 지정된 경우 추가 필터링
    if (resultType) {
      query = db
        .select()
        .from(compatibilityResultsTable)
        .where(
          and(
            eq(compatibilityResultsTable.userId, userId as string),
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
    // Next-Auth 세션 확인
    const authSession = await getServerSession(authOptions);
    let sessionId = await getSessionId();

    // 세션 ID가 없는 경우 임시 세션 생성
    if (!sessionId && !authSession?.user?.id) {
      sessionId = Math.random().toString(36).substring(2, 15);
      console.log("임시 세션 ID 생성:", sessionId);
    } else if (authSession?.user?.id) {
      // Next-Auth 인증이 있으면 해당 ID 사용
      sessionId = authSession.user.id as string;
    }

    const body = await request.json();
    console.log("요청 바디:", JSON.stringify(body, null, 2));

    // person1, person2 객체 대신 개별 필드로 전달된 경우 처리
    const {
      resultType,
      resultData,
      person1Name,
      person1Birthdate,
      person1Gender,
      person1Birthtime,
      person2Name,
      person2Birthdate,
      person2Gender,
      person2Birthtime,
      totalScore,
    } = body;

    // 필수 데이터 검증
    if (!resultType || !resultData) {
      console.error("필수 데이터 누락: resultType 또는 resultData 없음");
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // person1, person2 정보 누락 여부 검증
    if (
      !person1Name ||
      !person1Birthdate ||
      !person1Gender ||
      !person2Name ||
      !person2Birthdate ||
      !person2Gender
    ) {
      console.error("person1/person2 정보 누락", {
        person1: {
          person1Name,
          person1Birthdate,
          person1Gender,
          person1Birthtime,
        },
        person2: {
          person2Name,
          person2Birthdate,
          person2Gender,
          person2Birthtime,
        },
      });
      return NextResponse.json(
        { error: "person1 또는 person2 정보가 누락되었습니다." },
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

    // 타입별 총점 계산 (클라이언트에서 전달된 값이 있으면 사용)
    let finalTotalScore = totalScore;
    if (!finalTotalScore) {
      if (resultType === "love") {
        finalTotalScore = processedResultData.score || 0;
      } else if (resultType === "friend") {
        finalTotalScore = processedResultData.totalScore || 0;
      } else {
        finalTotalScore = 0;
      }
    }

    try {
      // 사용자 프로필 ID 가져오기 (없으면 생성)
      const profileId = await getUserProfileId(sessionId as string);

      console.log("DB 삽입 시도:", {
        userId: profileId,
        resultType,
        person1Name,
        totalScore: finalTotalScore,
      });

      const result = await db
        .insert(compatibilityResultsTable)
        .values({
          userId: profileId,
          resultType,
          person1Name,
          person1Birthdate,
          person1Gender,
          person1Birthtime: person1Birthtime || null,
          person2Name,
          person2Birthdate,
          person2Gender,
          person2Birthtime: person2Birthtime || null,
          resultData: processedResultData,
          totalScore: finalTotalScore,
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
      console.error("호환성 결과 저장 중 오류:", error);
      // 오류 메시지 정리
      const errorMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error);

      return NextResponse.json(
        { error: "결과 저장 중 오류가 발생했습니다.", details: errorMessage },
        { status: 500 }
      );
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
