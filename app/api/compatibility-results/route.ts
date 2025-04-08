import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";

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
    } = await request.json();

    // 세션 ID 가져오기
    const sessionId = await getSessionId();
    const authSession = await getServerSession(authOptions);

    // 쿠키 세션 또는 Next-Auth 세션 둘 중 하나라도 없으면 인증 실패
    if (!sessionId && !authSession?.user?.id) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
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

    // shareToken 생성
    const shareToken = nanoid(10); // 10자리 고유 토큰 생성

    // 결과 데이터에 shareToken 추가
    processedResultData.shareToken = shareToken;

    // 결과 저장
    const [result] = await db
      .insert(compatibilityResultsTable)
      .values({
        userId: (authSession?.user?.id || sessionId) as string,
        resultType,
        person1Name,
        person1Birthdate,
        person1Gender,
        person1Birthtime,
        person2Name,
        person2Birthdate,
        person2Gender,
        person2Birthtime,
        resultData: processedResultData,
        totalScore: finalTotalScore,
        shareToken, // shareToken 저장
      })
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error("결과 저장 중 오류 발생:", error);
    return NextResponse.json(
      { error: "결과 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
