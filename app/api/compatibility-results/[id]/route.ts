import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { compatibilityResultsTable } from "@/db/schema";

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

// GET: 특정 ID의 호환성 결과 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(compatibilityResultsTable)
      .where(
        and(
          eq(compatibilityResultsTable.id, id),
          eq(compatibilityResultsTable.userId, sessionId)
        )
      );

    if (result.length === 0) {
      return NextResponse.json(
        { error: "결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("결과 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "결과 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 특정 ID의 호환성 결과 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 ID입니다." },
        { status: 400 }
      );
    }

    const result = await db
      .delete(compatibilityResultsTable)
      .where(
        and(
          eq(compatibilityResultsTable.id, id),
          eq(compatibilityResultsTable.userId, sessionId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("결과 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "결과 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
