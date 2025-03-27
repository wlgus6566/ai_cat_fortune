import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  saveTalisman,
  getTalismansByUserId,
  deleteTalisman,
} from "@/app/lib/talismanUtils";

// POST /api/talisman - 새 부적 저장
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // 필수 필드 검증
    if (!body.imageData) {
      return NextResponse.json(
        { error: "이미지 데이터는 필수입니다." },
        { status: 400 }
      );
    }

    if (!body.concern) {
      return NextResponse.json(
        { error: "고민 내용은 필수입니다." },
        { status: 400 }
      );
    }

    // 부적 저장
    const talisman = await saveTalisman(
      userId,
      body.imageData,
      body.concern,
      body.concernType,
      body.fileName
    );

    return NextResponse.json({ talisman });
  } catch (error) {
    console.error("부적 저장 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "부적 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// GET /api/talisman - 사용자의 모든 부적 조회
export async function GET() {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 부적 목록 조회
    const talismans = await getTalismansByUserId(userId);
    console.log("talismans44444", talismans);

    return NextResponse.json({ talismans });
  } catch (error) {
    console.error("부적 목록 조회 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "부적 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/talisman?id=xxx - 특정 부적 삭제
export async function DELETE(req: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const talismanId = searchParams.get("id");

    if (!talismanId) {
      return NextResponse.json(
        { error: "부적 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 부적 삭제
    const result = await deleteTalisman(talismanId, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("부적 삭제 중 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "부적 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
