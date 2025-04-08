import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { compatibilityResultsTable } from "@/db/schema";

// GET: 공유 토큰으로 호환성 결과 조회
export async function GET(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  try {
    const token = context.params.token;

    if (!token) {
      return NextResponse.json(
        { error: "유효하지 않은 공유 토큰입니다." },
        { status: 400 }
      );
    }

    // shareToken으로 결과 조회
    const results = await db
      .select()
      .from(compatibilityResultsTable)
      .where(eq(compatibilityResultsTable.shareToken, token));

    if (results.length === 0) {
      return NextResponse.json(
        { error: "해당 토큰으로 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("공유 결과 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "결과 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
